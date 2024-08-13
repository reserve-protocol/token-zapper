import { createMultiChoiceAction, } from './action/Action';
import { Address } from './base/Address';
import { DefaultMap } from './base/DefaultMap';
import { createSimulateZapTransactionUsingProvider, createSimulatorThatUsesOneOfReservesCallManyProxies, } from './configuration/ChainConfiguration';
import { Token, } from './entities/Token';
import { makeTokenLoader } from './entities/makeTokenLoader';
import { Graph } from './exchange-graph/Graph';
import { LPTokenPriceOracle } from './oracles/LPTokenPriceOracle';
import { PriceOracle } from './oracles/PriceOracle';
import { ApprovalsStore } from './searcher/ApprovalsStore';
import EventEmitter from 'events';
import { RTokenDeployment } from './action/RTokens';
import { BlockCache } from './base/BlockBasedCache';
import { GAS_TOKEN_ADDRESS, USD_ADDRESS, simulationUrls, } from './base/constants';
import { ZapperExecutor__factory } from './contracts';
import { PerformanceMonitor } from './searcher/PerformanceMonitor';
import { Searcher } from './searcher/Searcher';
import { Contract } from './tx-gen/Planner';
import { ZapperTokenQuantityPrice } from './oracles/ZapperAggregatorOracle';
export class Universe {
    provider;
    config;
    approvalsStore;
    loadToken;
    simulateZapFn_;
    emitter = new EventEmitter();
    _finishResolving = () => { };
    initialized = new Promise((resolve) => {
        this._finishResolving = resolve;
    });
    get chainId() {
        return this.config.chainId;
    }
    caches = [];
    perf = new PerformanceMonitor();
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
        const cache = new BlockCache(fetch, ttl, this.currentBlock);
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
    actions = new DefaultMap(() => []);
    allActions = new Set();
    tokenTradeSpecialCases = new Map();
    // The GAS token for the EVM chain, set by the StaticConfig
    nativeToken;
    wrappedNativeToken;
    // 'Virtual' token used for pricing things
    usd = Token.createToken(this.tokens, Address.fromHexString(USD_ADDRESS), 'USD', 'USD Dollar', 8);
    fairPriceCache;
    graph = new Graph();
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
        const venues = dynamicInput === true
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
                // console.log(`${venue.name} failed for case: ${tradeName}`)
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
        if (facade === Address.ZERO) {
            facade = Address.from(this.config.addresses.oldFacadeAddress);
        }
        const rtokenDeployment = await RTokenDeployment.load(this, facade, rToken);
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
        const oracle = await PriceOracle.createSingleTokenOracleChainLinkLike(this, opts.token, opts.oracleAddress, opts.priceToken);
        this.oracles.push(oracle);
        return oracle;
    }
    addSingleTokenPriceSource(opts) {
        const oracle = PriceOracle.createSingleTokenOracle(this, opts.token, opts.priceFn);
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
            previous = Token.createToken(this.tokens, address, data.symbol, data.symbol, data.decimals);
            this.tokens.set(address, previous);
        }
        return previous;
    }
    createToken(address, symbol, name, decimals) {
        const token = Token.createToken(this.tokens, address, symbol, name, decimals);
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
        return createMultiChoiceAction(this, edges);
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
        return new Searcher(this);
    }
    constructor(provider, config, approvalsStore, loadToken, simulateZapFn_) {
        this.provider = provider;
        this.config = config;
        this.approvalsStore = approvalsStore;
        this.loadToken = loadToken;
        this.simulateZapFn_ = simulateZapFn_;
        const nativeToken = config.nativeToken;
        this.nativeToken = Token.createToken(this.tokens, Address.fromHexString(GAS_TOKEN_ADDRESS), nativeToken.symbol, nativeToken.name, nativeToken.decimals);
        this.wrappedNativeToken = Token.createToken(this.tokens, config.addresses.wrappedNative, 'W' + nativeToken.symbol, 'Wrapped ' + nativeToken.name, nativeToken.decimals);
        this.weirollZapperExec = Contract.createLibrary(ZapperExecutor__factory.connect(this.config.addresses.executorAddress.address, this.provider));
        this.oracle = new ZapperTokenQuantityPrice(this);
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
                opts.simulateZapFn ?? simulationUrls[network.chainId]
                    ? createSimulatorThatUsesOneOfReservesCallManyProxies(network.chainId)
                    : createSimulateZapTransactionUsingProvider(provider);
        }
        const universe = new Universe(provider, config, opts.approvalsStore ?? new ApprovalsStore(provider), opts.tokenLoader ?? makeTokenLoader(provider), simulateZapFunction);
        universe.oracles.push(new LPTokenPriceOracle(universe));
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
            userAddress = Address.from(userAddress);
        }
        if (typeof rToken === 'string') {
            rToken = await this.getToken(Address.from(rToken));
        }
        const out = await this.searcher.zapIntoRToken(userInput, rToken, userAddress, opts);
        return out.bestZapTx.tx;
    }
    async redeem(rTokenQuantity, outputToken, userAddress, opts) {
        if (typeof userAddress === 'string') {
            userAddress = Address.from(userAddress);
        }
        if (typeof outputToken === 'string') {
            outputToken = await this.getToken(Address.from(outputToken));
        }
        const out = await this.searcher.redeem(rTokenQuantity, outputToken, userAddress, opts);
        return out.bestZapTx.tx;
    }
    get approvalAddress() {
        return this.config.addresses.zapperAddress.address;
    }
}
function shuffle(array) {
    const out = [...array];
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}
//# sourceMappingURL=Universe.js.map