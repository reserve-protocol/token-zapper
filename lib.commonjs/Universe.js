"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Universe = void 0;
const tslib_1 = require("tslib");
const Action_1 = require("./action/Action");
const Address_1 = require("./base/Address");
const DefaultMap_1 = require("./base/DefaultMap");
const ChainConfiguration_1 = require("./configuration/ChainConfiguration");
const Token_1 = require("./entities/Token");
const makeTokenLoader_1 = require("./entities/makeTokenLoader");
const Graph_1 = require("./exchange-graph/Graph");
const LPTokenPriceOracle_1 = require("./oracles/LPTokenPriceOracle");
const PriceOracle_1 = require("./oracles/PriceOracle");
const ApprovalsStore_1 = require("./searcher/ApprovalsStore");
const events_1 = tslib_1.__importDefault(require("events"));
const RTokens_1 = require("./action/RTokens");
const BlockBasedCache_1 = require("./base/BlockBasedCache");
const constants_1 = require("./base/constants");
const contracts_1 = require("./contracts");
const PerformanceMonitor_1 = require("./searcher/PerformanceMonitor");
const Searcher_1 = require("./searcher/Searcher");
const Planner_1 = require("./tx-gen/Planner");
const ZapperAggregatorOracle_1 = require("./oracles/ZapperAggregatorOracle");
class Universe {
    provider;
    config;
    approvalsStore;
    loadToken;
    simulateZapFn_;
    emitter = new events_1.default();
    _finishResolving = () => { };
    initialized = new Promise((resolve) => {
        this._finishResolving = resolve;
    });
    get chainId() {
        return this.config.chainId;
    }
    caches = [];
    perf = new PerformanceMonitor_1.PerformanceMonitor();
    prettyPrintPerfs(addContext = false) {
        console.log('Performance Stats');
        for (const [_, value] of this.perf.stats.entries()) {
            console.log('  ' + value.toString());
            if (addContext) {
                for (const context of value.contextStats) {
                    console.log('    ' + context.toString());
                }
            }
        }
    }
    createCache(fetch, ttl = this.config.requoteTolerance, keyFn) {
        const cache = new BlockBasedCache_1.BlockCache(fetch, ttl, this.currentBlock, keyFn);
        this.caches.push(cache);
        return cache;
    }
    refreshableEntities = new Map();
    tokens = new Map();
    lpTokens = new Map();
    _gasTokenPrice = null;
    get gasTokenPrice() {
        return this._gasTokenPrice ?? this.usd.from(3000);
    }
    async quoteGas(units) {
        if (this._gasTokenPrice == null) {
            this._gasTokenPrice = await this.fairPrice(this.nativeToken.one);
        }
        const txFee = this.nativeToken.from(units * this.gasPrice);
        const txFeeUsd = txFee.into(this.usd).mul(this.gasTokenPrice);
        return {
            units,
            txFee,
            txFeeUsd,
        };
    }
    precursorTokenSourcingSpecialCases = new Map();
    actions = new DefaultMap_1.DefaultMap(() => []);
    allActions = new Set();
    tokenTradeSpecialCases = new Map();
    tokenFromTradeSpecialCases = new Map();
    // The GAS token for the EVM chain, set by the StaticConfig
    nativeToken;
    wrappedNativeToken;
    // 'Virtual' token used for pricing things
    usd = Token_1.Token.createToken(this.tokens, Address_1.Address.fromHexString(constants_1.USD_ADDRESS), 'USD', 'USD Dollar', 8);
    fairPriceCache;
    graph = new Graph_1.Graph();
    wrappedTokens = new Map();
    oracles = [];
    tradeVenues = [];
    tradingVenuesSupportingDynamicInput = [];
    addTradeVenue(venue) {
        if (venue.supportsDynamicInput) {
            this.tradingVenuesSupportingDynamicInput.push(venue);
            this.tradeVenues.push(venue);
        }
        else {
            this.tradeVenues = [venue, ...this.tradeVenues];
        }
    }
    getTradingVenues(input, output) {
        const venues = this.tradeVenues;
        const out = venues.filter((venue) => venue.router.supportsSwap(input, output));
        if (out.length !== 0) {
            return out;
        }
        throw new Error(`Failed to find any trading venues for ${input.token} -> ${output}`);
    }
    async swap(input, output, opts) {
        const out = [];
        await this.swaps(input, output, async (res) => {
            out.push(res);
        }, {
            ...opts,
            slippage: this.config.defaultInternalTradeSlippage,
            dynamicInput: true,
            abort: AbortSignal.timeout(this.config.routerDeadline),
        });
        out.sort((l, r) => l.compare(r));
        return out[0];
    }
    async swaps(input, output, onResult, opts) {
        const wrapper = this.wrappedTokens.get(input.token);
        if (wrapper?.allowAggregatorSearcher === false) {
            return;
        }
        const aggregators = this.getTradingVenues(input, output);
        const tradeName = `${input.token} -> ${output}`;
        await Promise.all(shuffle(aggregators).map(async (venue) => {
            try {
                let inp = input;
                if (opts.dynamicInput && !venue.supportsDynamicInput) {
                    inp = inp.mul(inp.token.from(0.99999));
                }
                const res = await this.perf.measurePromise(venue.name, venue.router.swap(opts.abort, inp, output, opts.slippage), tradeName);
                // console.log(`${venue.name} ok: ${res.steps[0].action.toString()}`)
                await onResult(res);
            }
            catch (e) {
                // console.log(`${venue.name} failed for case: ${tradeName}`)
                // console.log(e.message)
            }
        }));
    }
    // Sentinel token used for pricing things
    rTokens = {};
    commonTokens = {};
    commonTokensSet_ = null;
    get commonTokensInfo() {
        if (this.commonTokensSet_ == null) {
            this.commonTokensSet_ = new Set(Object.values(this.commonTokens));
        }
        return {
            addresses: new Set([...this.commonTokensSet_].map((i) => i.address)),
            tokens: this.commonTokensSet_,
        };
    }
    rTokensSet_ = null;
    get rTokensInfo() {
        if (this.rTokensSet_ == null) {
            this.rTokensSet_ = new Set(Object.values(this.rTokens));
        }
        return {
            addresses: new Set([...this.rTokensSet_].map((i) => i.address)),
            tokens: this.rTokensSet_,
        };
    }
    preferredRTokenInputToken = new Map();
    integrations = {};
    rTokenDeployments = new Map();
    async defineRToken(rTokenAddress) {
        const rToken = await this.getToken(rTokenAddress);
        if (this.rTokenDeployments.has(rToken)) {
            throw new Error(`RToken ${rToken} already defined`);
        }
        let facade = this.config.addresses.facadeAddress;
        if (facade === Address_1.Address.ZERO) {
            facade = Address_1.Address.from(this.config.addresses.oldFacadeAddress);
        }
        const rtokenDeployment = await RTokens_1.RTokenDeployment.load(this, facade, rToken);
        this.rTokenDeployments.set(rToken, rtokenDeployment);
        this.rTokensInfo.addresses.add(rToken.address);
        this.rTokensInfo.tokens.add(rToken);
        return rToken;
    }
    getRTokenDeployment(token) {
        const out = this.rTokenDeployments.get(token);
        if (out == null) {
            throw new Error(`${token} is not a known RToken`);
        }
        return out;
    }
    addIntegration(key, value) {
        if (this.integrations[key] != null) {
            throw new Error(`Integration ${key} already defined`);
        }
        this.integrations[key] = value;
        return value;
    }
    async balanceOf(token, account) {
        return await this.approvalsStore.queryBalance(token, account, this);
    }
    blockState = {
        currentBlock: 0,
        gasPrice: 0n,
    };
    defineTokenSourcingRule(precursor, rule) {
        this.precursorTokenSourcingSpecialCases.set(precursor, rule);
    }
    /**
     * This method try to price a given token in USD.
     * It will first try and see if there is an canonical way to mint/burn the token,
     * if there is, it will recursively unwrap the token until it finds a what the token consists of.
     *
     * Once the token is fully unwrapped, it will query the oracles to find the price of each underlying
     * quantity, and sum them up.
     *
     * @param qty quantity to price
     * @returns The price of the qty in USD, or null if the price cannot be determined
     */
    oracle;
    /** */
    async addSingleTokenPriceOracle(opts) {
        const oracle = await PriceOracle_1.PriceOracle.createSingleTokenOracleChainLinkLike(this, opts.token, opts.oracleAddress, opts.priceToken);
        this.oracles.push(oracle);
        return oracle;
    }
    addSingleTokenPriceSource(opts) {
        const oracle = PriceOracle_1.PriceOracle.createSingleTokenOracle(this, opts.token, opts.priceFn);
        this.oracles.push(oracle);
        return oracle;
    }
    async fairPrice(qty) {
        const perfStart = this.perf.begin('fairPrice', qty.token.symbol);
        let out = await this.fairPriceCache.get(qty);
        if (out.amount === 0n) {
            out = null;
        }
        perfStart();
        return out;
    }
    async quoteIn(qty, tokenToQuoteWith) {
        return this.oracle?.quoteIn(qty, tokenToQuoteWith).catch(() => null) ?? null;
    }
    get currentBlock() {
        return this.blockState.currentBlock;
    }
    get gasPrice() {
        return this.blockState.gasPrice;
    }
    async getToken(address) {
        let previous = this.tokens.get(address);
        if (previous == null) {
            const data = await this.loadToken(address);
            previous = Token_1.Token.createToken(this.tokens, address, data.symbol, data.symbol, data.decimals);
            this.tokens.set(address, previous);
        }
        return previous;
    }
    createToken(address, symbol, name, decimals) {
        const token = Token_1.Token.createToken(this.tokens, address, symbol, name, decimals);
        return token;
    }
    addAction(action, actionAddress) {
        if (this.allActions.has(action)) {
            return this;
        }
        this.allActions.add(action);
        if (actionAddress != null) {
            this.actions.get(actionAddress).push(action);
        }
        if (action.addToGraph) {
            this.graph.addEdge(action);
        }
        // console.log(`${action.inputToken.join(', ')} -> ${action.outputToken.join(', ')}`)
        return this;
    }
    defineLPToken(lpTokenInstance) {
        this.lpTokens.set(lpTokenInstance.token, lpTokenInstance);
        this.addAction(lpTokenInstance.mintAction);
        this.addAction(lpTokenInstance.burnAction);
        // this.defineMintable(
        //   lpTokenInstance.mintAction,
        //   lpTokenInstance.burnAction,
        //   true
        // )
    }
    weirollZapperExec;
    weirollZapperExecContract;
    findBurnActions(token) {
        const out = this.actions
            .get(token.address)
            .filter((i) => i.inputToken.length === 1 && i.inputToken[0] === token);
        return [...out];
    }
    get execAddress() {
        return this.config.addresses.executorAddress;
    }
    get zapperAddress() {
        return this.config.addresses.zapperAddress;
    }
    async createTradeEdge(tokenIn, tokenOut) {
        const edges = [];
        for (const venue of this.tradeVenues) {
            if (!venue.supportsDynamicInput ||
                !venue.supportsEdges ||
                !venue.canCreateEdgeBetween(tokenIn, tokenOut)) {
                continue;
            }
            const edge = await venue.createTradeEdge(tokenIn, tokenOut);
            if (edge != null) {
                edges.push(edge);
            }
        }
        if (edges.length === 0) {
            throw new Error(`No trade edge found for ${tokenIn} -> ${tokenOut}`);
        }
        return (0, Action_1.createMultiChoiceAction)(this, edges);
    }
    defineMintable(mint, burn, allowAggregatorSearcher = false) {
        const output = mint.outputToken[0];
        if (!mint.outputToken.every((i, index) => burn.inputToken[index] === i) ||
            !burn.outputToken.every((i, index) => mint.inputToken[index] === i)) {
            throw new Error(`Invalid mintable: mint: (${mint.inputToken.join(', ')}) -> ${mint} -> (${mint.outputToken.join(', ')}), burn: (${burn.inputToken.join(', ')}) -> ${burn} -> (${burn.outputToken.join(', ')})`);
        }
        // console.log(
        //   `Defining mintable ${mint.outputToken.join(
        //     ', '
        //   )} via ${mint.inputToken.join(', ')}`
        // )
        if (this.wrappedTokens.has(output)) {
            throw new Error('Token already mintable');
        }
        this.addAction(mint, output.address);
        this.addAction(burn, output.address);
        const out = {
            mint,
            burn,
            allowAggregatorSearcher,
        };
        this.wrappedTokens.set(output, out);
        return out;
    }
    simulateZapFn;
    get searcher() {
        return new Searcher_1.Searcher(this);
    }
    constructor(provider, config, approvalsStore, loadToken, simulateZapFn_) {
        this.provider = provider;
        this.config = config;
        this.approvalsStore = approvalsStore;
        this.loadToken = loadToken;
        this.simulateZapFn_ = simulateZapFn_;
        const nativeToken = config.nativeToken;
        this.nativeToken = Token_1.Token.createToken(this.tokens, Address_1.Address.fromHexString(constants_1.GAS_TOKEN_ADDRESS), nativeToken.symbol, nativeToken.name, nativeToken.decimals);
        this.wrappedNativeToken = Token_1.Token.createToken(this.tokens, config.addresses.wrappedNative, 'W' + nativeToken.symbol, 'Wrapped ' + nativeToken.name, nativeToken.decimals);
        this.weirollZapperExec = Planner_1.Contract.createLibrary(contracts_1.ZapperExecutor__factory.connect(this.config.addresses.executorAddress.address, this.provider));
        this.weirollZapperExecContract = Planner_1.Contract.createContract(contracts_1.ZapperExecutor__factory.connect(this.config.addresses.executorAddress.address, this.provider));
        this.oracle = new ZapperAggregatorOracle_1.ZapperTokenQuantityPrice(this);
        this.fairPriceCache = this.createCache(async (qty) => {
            if (this.rTokenDeployments.has(qty.token)) {
                const outs = await this.rTokenDeployments
                    .get(qty.token)
                    .burn.quote([qty]);
                const outsPriced = await Promise.all(outs.map(async (i) => (await this.fairPrice(i)) ?? this.usd.zero));
                const sum = outsPriced.reduce((a, b) => a.add(b), this.usd.zero);
                return sum;
            }
            const out = (await this.oracle?.quote(qty).catch((e) => {
                return this.usd.zero;
            })) ?? this.usd.zero;
            return out;
        }, this.config.requoteTolerance);
        const pending = new Map();
        this.simulateZapFn = async (params) => {
            const keyObj = {
                data: params.data?.toString(),
                value: params.value?.toString(),
                block: this.currentBlock,
                setup: {
                    inputTokenAddress: params.setup.inputTokenAddress,
                    amount: params.setup.userBalanceAndApprovalRequirements.toString(),
                },
            };
            const k = JSON.stringify(keyObj);
            const prev = pending.get(k);
            if (prev != null) {
                return prev;
            }
            const p = this.simulateZapFn_(params);
            pending.set(k, p);
            p.then(() => {
                if (pending.get(k) === p) {
                    pending.delete(k);
                }
            });
            return p;
        };
    }
    async updateBlockState(block, gasPrice) {
        if (block <= this.blockState.currentBlock) {
            return;
        }
        for (const router of this.tradeVenues) {
            router.router.onBlock(block, this.config.requoteTolerance);
        }
        for (const cache of this.caches) {
            cache.onBlock(block);
        }
        this.blockState.currentBlock = block;
        this.blockState.gasPrice = gasPrice;
        this._gasTokenPrice = await this.fairPrice(this.nativeToken.one);
    }
    static async createWithConfig(provider, config, initialize, opts = {}) {
        const network = await provider.getNetwork();
        let simulateZapFunction = opts.simulateZapFn;
        if (simulateZapFunction == null) {
            simulateZapFunction =
                opts.simulateZapFn ?? constants_1.simulationUrls[network.chainId]
                    ? (0, ChainConfiguration_1.createSimulatorThatUsesOneOfReservesCallManyProxies)(network.chainId)
                    : (0, ChainConfiguration_1.createSimulateZapTransactionUsingProvider)(provider);
        }
        const universe = new Universe(provider, config, opts.approvalsStore ?? new ApprovalsStore_1.ApprovalsStore(provider), opts.tokenLoader ?? (0, makeTokenLoader_1.makeTokenLoader)(provider), simulateZapFunction);
        universe.oracles.push(new LPTokenPriceOracle_1.LPTokenPriceOracle(universe));
        await Promise.all(Object.values(universe.config.addresses.rTokens).map(async (rTokenAddress) => {
            await universe.defineRToken(rTokenAddress);
        }));
        initialize(universe).then(async () => {
            universe._finishResolving();
        });
        return universe;
    }
    // Used for analytics to track interesting zapper events
    emitEvent(object) {
        this.emitter.emit('event', {
            ...object,
            chainId: this.chainId,
        });
    }
    onEvent(cb) {
        this.emitter.on('event', cb);
        return () => {
            this.emitter.off('event', cb);
        };
    }
    async zap(userInput, rToken, userAddress, opts) {
        if (typeof userAddress === 'string') {
            userAddress = Address_1.Address.from(userAddress);
        }
        if (typeof rToken === 'string') {
            rToken = await this.getToken(Address_1.Address.from(rToken));
        }
        const out = await this.searcher.zapIntoRToken(userInput, rToken, userAddress, opts);
        return out.bestZapTx.tx;
    }
    async redeem(rTokenQuantity, outputToken, userAddress, opts) {
        if (typeof userAddress === 'string') {
            userAddress = Address_1.Address.from(userAddress);
        }
        if (typeof outputToken === 'string') {
            outputToken = await this.getToken(Address_1.Address.from(outputToken));
        }
        const out = await this.searcher.redeem(rTokenQuantity, outputToken, userAddress, opts);
        return out.bestZapTx.tx;
    }
    get approvalAddress() {
        return this.config.addresses.zapperAddress.address;
    }
}
exports.Universe = Universe;
function shuffle(array) {
    const out = [...array];
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}
//# sourceMappingURL=Universe.js.map