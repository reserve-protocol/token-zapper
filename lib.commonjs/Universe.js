"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Universe = void 0;
const tslib_1 = require("tslib");
const Address_1 = require("./base/Address");
const Graph_1 = require("./exchange-graph/Graph");
const Token_1 = require("./entities/Token");
const makeTokenLoader_1 = require("./entities/makeTokenLoader");
const DefaultMap_1 = require("./base/DefaultMap");
const LPTokenPriceOracle_1 = require("./oracles/LPTokenPriceOracle");
const Refreshable_1 = require("./entities/Refreshable");
const ApprovalsStore_1 = require("./searcher/ApprovalsStore");
const constants_1 = require("./base/constants");
const Searcher_1 = require("./searcher/Searcher");
const events_1 = tslib_1.__importDefault(require("events"));
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
    graph = new Graph_1.Graph();
    wrappedTokens = new Map();
    oracles = [];
    dexAggregators = [];
    // Sentinel token used for pricing things
    rTokens = {};
    commonTokens = {};
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
        const out = (await this.oracle?.quote(qty).catch(() => {
            return null;
        })) ?? null;
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
        // this.defineMintable(
        //   lpTokenInstance.mintAction,
        //   lpTokenInstance.burnAction,
        //   true
        // )
    }
    get execAddress() {
        return this.config.addresses.executorAddress;
    }
    get zapperAddress() {
        return this.config.addresses.zapperAddress;
    }
    defineMintable(mint, burn, allowAggregatorSearcher = false) {
        const output = mint.outputToken[0];
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
    }
    async updateBlockState(block, gasPrice) {
        if (block <= this.blockState.currentBlock) {
            return;
        }
        this.blockState.currentBlock = block;
        this.blockState.gasPrice = gasPrice;
        this._gasTokenPrice = await this.fairPrice(this.nativeToken.one);
    }
    static async createWithConfig(provider, config, initialize, opts = {}) {
        const universe = new Universe(provider, config, opts.approvalsStore ?? new ApprovalsStore_1.ApprovalsStore(provider), opts.tokenLoader ?? (0, makeTokenLoader_1.makeTokenLoader)(provider));
        universe.oracles.push(new LPTokenPriceOracle_1.LPTokenPriceOracle(universe));
        initialize(universe).then(() => {
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
        const inputTokenQty = (await this.getToken(Address_1.Address.from(tokenIn))).from(amountIn);
        const outputToken = await this.getToken(Address_1.Address.from(rToken));
        return this.searcher.findSingleInputToRTokenZap(inputTokenQty, outputToken, Address_1.Address.from(signerAddress));
    }
    async zapETH(amountIn, rToken, signerAddress) {
        const inputTokenQty = this.nativeToken.from(amountIn);
        const outputToken = await this.getToken(Address_1.Address.from(rToken));
        return this.searcher.findSingleInputToRTokenZap(inputTokenQty, outputToken, Address_1.Address.from(signerAddress));
    }
    async redeem(rToken, amount, output, signerAddress) {
        const inputTokenQty = (await this.getToken(Address_1.Address.from(rToken))).from(amount);
        const outputToken = await this.getToken(Address_1.Address.from(output));
        return this.searcher.findRTokenIntoSingleTokenZap(inputTokenQty, outputToken, Address_1.Address.from(signerAddress));
    }
}
exports.Universe = Universe;
//# sourceMappingURL=Universe.js.map