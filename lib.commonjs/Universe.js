"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Universe = void 0;
const Address_1 = require("./base/Address");
const Graph_1 = require("./exchange-graph/Graph");
const Token_1 = require("./entities/Token");
const makeTokenLoader_1 = require("./entities/makeTokenLoader");
const DefaultMap_1 = require("./base/DefaultMap");
const Refreshable_1 = require("./entities/Refreshable");
const ApprovalsStore_1 = require("./searcher/ApprovalsStore");
const constants_1 = require("./base/constants");
class Universe {
    provider;
    config;
    approvalsStore;
    loadToken;
    get chainId() { return this.config.chainId; }
    refreshableEntities = new Map();
    tokens = new Map();
    lpTokens = new Map();
    precursorTokenSourcingSpecialCases = new DefaultMap_1.DefaultMap(() => new Map());
    actions = new DefaultMap_1.DefaultMap(() => []);
    allActions = new Set();
    tokenTradeSpecialCases = new Map();
    // The GAS token for the EVM chain, set by the StaticConfig
    nativeToken;
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
    defineTokenSourcingRule(rToken, precursor, rule) {
        this.precursorTokenSourcingSpecialCases.get(rToken).set(precursor, rule);
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
        return this.oracle?.quote(qty).catch(() => null) ?? null;
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
        return this;
    }
    defineLPToken(lpTokenInstance) {
        this.lpTokens.set(lpTokenInstance.token, lpTokenInstance);
        this.defineMintable(lpTokenInstance.mintAction, lpTokenInstance.burnAction);
    }
    defineMintable(mint, burn, allowAggregatorSearcher = false) {
        const output = mint.output[0];
        this.addAction(mint, output.address);
        this.addAction(burn, output.address);
        const out = {
            mint,
            burn,
            allowAggregatorSearcher
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
        this.nativeToken = Token_1.Token.createToken(this.tokens, Address_1.Address.fromHexString(constants_1.GAS_TOKEN_ADDRESS), nativeToken.symbol, nativeToken.name, nativeToken.decimals);
    }
    updateBlockState(block, gasPrice) {
        if (block <= this.blockState.currentBlock) {
            return;
        }
        this.blockState.currentBlock = block;
        this.blockState.gasPrice = gasPrice;
    }
    static async createWithConfig(provider, config, initialize, opts = {}) {
        const universe = new Universe(provider, config, opts.approvalsStore ?? new ApprovalsStore_1.ApprovalsStore(provider), opts.tokenLoader ?? (0, makeTokenLoader_1.makeTokenLoader)(provider));
        await initialize(universe);
        return universe;
    }
}
exports.Universe = Universe;
//# sourceMappingURL=Universe.js.map