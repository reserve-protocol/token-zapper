"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Universe = void 0;
const tslib_1 = require("tslib");
const Address_1 = require("./base/Address");
const DefaultMap_1 = require("./base/DefaultMap");
const Refreshable_1 = require("./entities/Refreshable");
const Token_1 = require("./entities/Token");
const makeTokenLoader_1 = require("./entities/makeTokenLoader");
const Graph_1 = require("./exchange-graph/Graph");
const LPTokenPriceOracle_1 = require("./oracles/LPTokenPriceOracle");
const ApprovalsStore_1 = require("./searcher/ApprovalsStore");
const events_1 = tslib_1.__importDefault(require("events"));
const constants_1 = require("./base/constants");
const contracts_1 = require("./contracts");
const Searcher_1 = require("./searcher/Searcher");
const Planner_1 = require("./tx-gen/Planner");
const BlockBasedCache_1 = require("./base/BlockBasedCache");
const PerformanceMonitor_1 = require("./searcher/PerformanceMonitor");
const RTokens_1 = require("./action/RTokens");
class Universe {
    provider;
    config;
    approvalsStore;
    loadToken;
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
    createCache(fetch, ttl = this.config.requoteTolerance) {
        const cache = new BlockBasedCache_1.BlockCache(fetch, ttl, this.currentBlock);
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
    getTradingVenues(input, output, dynamicInput) {
        const venues = dynamicInput
            ? this.tradingVenuesSupportingDynamicInput
            : this.tradeVenues;
        const out = venues.filter((venue) => venue.router.supportsSwap(input, output));
        if (out.length !== 0) {
            return out;
        }
        if (dynamicInput) {
            throw new Error(`Failed to find any trading venues for ${input.token} -> ${output} where dynamic input is allowed`);
        }
        else {
            throw new Error(`Failed to find any trading venues for ${input.token} -> ${output}`);
        }
    }
    async swaps(input, output, onResult, opts) {
        const wrapper = this.wrappedTokens.get(input.token);
        if (wrapper?.allowAggregatorSearcher === false) {
            return;
        }
        const aggregators = this.getTradingVenues(input, output, opts.dynamicInput);
        const tradeName = `${input.token} -> ${output}`;
        await Promise.all(shuffle(aggregators).map(async (venue) => {
            try {
                const res = await this.perf.measurePromise(venue.name, venue.router.swap(opts.abort, input, output, opts.slippage), tradeName);
                // console.log(`${venue.name} ok: ${res.steps[0].action.toString()}`)
                await onResult(res);
            }
            catch (e) {
                // console.log(`${router.name} failed for case: ${tradeName}`)
                // console.log(e.message)
            }
        }));
    }
    // Sentinel token used for pricing things
    rTokens = {};
    commonTokens = {};
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
    async refresh(entity) {
        const refreshable = this.refreshableEntities.get(entity);
        if (refreshable == null) {
            return;
        }
        await refreshable.refresh(this.currentBlock);
    }
    createRefreshableEntity(address, refresh) {
        this.refreshableEntities.set(address, new Refreshable_1.Refreshable(address, -1, refresh));
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
    oracle = undefined;
    async fairPrice(qty) {
        const perfStart = this.perf.begin('fairPrice', qty.token.symbol);
        let out = await this.fairPriceCache.get(qty);
        if (out.amount === 0n) {
            out = null;
        }
        perfStart();
        return out;
    }
    async priceQty(qty) {
        const out = await this.fairPrice(qty);
        return new Token_1.PricedTokenQuantity(qty, out);
    }
    async quoteIn(qty, tokenToQuoteWith) {
        return this.oracle?.quoteIn(qty, tokenToQuoteWith).catch(() => null) ?? null;
    }
    searcher;
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
        return this;
    }
    defineLPToken(lpTokenInstance) {
        this.lpTokens.set(lpTokenInstance.token, lpTokenInstance);
        this.addAction(lpTokenInstance.mintAction);
        // this.addAction(lpTokenInstance.burnAction)
        // this.defineMintable(
        //   lpTokenInstance.mintAction,
        //   lpTokenInstance.burnAction,
        //   true
        // )
    }
    weirollZapperExec;
    get execAddress() {
        return this.config.addresses.executorAddress;
    }
    get zapperAddress() {
        return this.config.addresses.zapperAddress;
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
    constructor(provider, config, approvalsStore, loadToken) {
        this.provider = provider;
        this.config = config;
        this.approvalsStore = approvalsStore;
        this.loadToken = loadToken;
        const nativeToken = config.nativeToken;
        this.searcher = new Searcher_1.Searcher(this);
        this.nativeToken = Token_1.Token.createToken(this.tokens, Address_1.Address.fromHexString(constants_1.GAS_TOKEN_ADDRESS), nativeToken.symbol, nativeToken.name, nativeToken.decimals);
        this.wrappedNativeToken = Token_1.Token.createToken(this.tokens, config.addresses.wrappedNative, 'W' + nativeToken.symbol, 'Wrapped ' + nativeToken.name, nativeToken.decimals);
        this.weirollZapperExec = Planner_1.Contract.createLibrary(contracts_1.ZapperExecutor__factory.connect(this.execAddress.address, this.provider));
        this.fairPriceCache = this.createCache(async (qty) => {
            return ((await this.oracle?.quote(qty).catch(() => this.usd.zero)) ??
                this.usd.zero);
        }, this.config.requoteTolerance);
    }
    async updateBlockState(block, gasPrice) {
        if (block <= this.blockState.currentBlock) {
            return;
        }
        for (const router of this.tradeVenues) {
            router.router.onBlock(block);
        }
        for (const cache of this.caches) {
            cache.onBlock(block);
        }
        this.blockState.currentBlock = block;
        this.blockState.gasPrice = gasPrice;
        this._gasTokenPrice = await this.fairPrice(this.nativeToken.one);
    }
    static async createWithConfig(provider, config, initialize, opts = {}) {
        const universe = new Universe(provider, config, opts.approvalsStore ?? new ApprovalsStore_1.ApprovalsStore(provider), opts.tokenLoader ?? (0, makeTokenLoader_1.makeTokenLoader)(provider));
        universe.oracles.push(new LPTokenPriceOracle_1.LPTokenPriceOracle(universe));
        initialize(universe).then(async () => {
            // Load all predefined rTokens
            await Promise.all(Object.values(universe.config.addresses.rTokens).map(async (rTokenAddress) => {
                await universe.defineRToken(rTokenAddress);
            }));
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
    get approvalAddress() {
        return this.config.addresses.zapperAddress.address;
    }
    async zap(tokenIn, amountIn, rToken, signerAddress) {
        const [inputTokenQty, outputToken] = await Promise.all([
            this.getToken(Address_1.Address.from(tokenIn)).then((tok) => tok.from(amountIn)),
            this.getToken(Address_1.Address.from(rToken)),
        ]);
        return this.searcher.findSingleInputToRTokenZap(inputTokenQty, outputToken, Address_1.Address.from(signerAddress), this.config.defaultInternalTradeSlippage);
    }
    async zapETH(amountIn, rToken, signerAddress) {
        const inputTokenQty = this.nativeToken.from(amountIn);
        const outputToken = await this.getToken(Address_1.Address.from(rToken));
        return this.searcher.findSingleInputToRTokenZap(inputTokenQty, outputToken, Address_1.Address.from(signerAddress), this.config.defaultInternalTradeSlippage);
    }
    async redeem(rToken, amount, output, signerAddress) {
        const [inputTokenQty, outputToken] = await Promise.all([
            this.getToken(Address_1.Address.from(rToken)).then((tok) => tok.from(amount)),
            this.getToken(Address_1.Address.from(output)),
        ]);
        return this.searcher.findRTokenIntoSingleTokenZap(inputTokenQty, outputToken, Address_1.Address.from(signerAddress), this.config.defaultInternalTradeSlippage);
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