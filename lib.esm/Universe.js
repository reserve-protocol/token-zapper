import { Address } from './base/Address';
import { Graph } from './exchange-graph/Graph';
import { Token } from './entities/Token';
import { makeTokenLoader } from './entities/makeTokenLoader';
import { DefaultMap } from './base/DefaultMap';
import { Refreshable } from './entities/Refreshable';
import { ApprovalsStore } from './searcher/ApprovalsStore';
import { GAS_TOKEN_ADDRESS, USD_ADDRESS } from './base/constants';
import { MintRTokenAction } from './action/RTokens';
import { Searcher } from './searcher/Searcher';
import { findPrecursorTokenSet } from './searcher/Searcher';
export class Universe {
    provider;
    config;
    approvalsStore;
    loadToken;
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
    precursorTokenSourcingSpecialCases = new DefaultMap(() => new Map());
    actions = new DefaultMap(() => []);
    allActions = new Set();
    tokenTradeSpecialCases = new Map();
    // The GAS token for the EVM chain, set by the StaticConfig
    nativeToken;
    // 'Virtual' token used for pricing things
    usd = Token.createToken(this.tokens, Address.fromHexString(USD_ADDRESS), 'USD', 'USD Dollar', 8);
    graph = new Graph();
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
        this.refreshableEntities.set(address, new Refreshable(address, -1, refresh));
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
            allowAggregatorSearcher,
        };
        this.wrappedTokens.set(output, out);
        return out;
    }
    async canZapIntoRToken(token) {
        const wrappable = this.wrappedTokens.get(token);
        if (wrappable == null) {
            return false;
        }
        if (!(wrappable.mint instanceof MintRTokenAction)) {
            return false;
        }
        const action = wrappable.mint;
        const unit = action.basket.unitBasket;
        const searcher = new Searcher(this);
        try {
            const input = this.nativeToken.from('0.1');
            const precursorSet = await findPrecursorTokenSet(this, input, token, unit, searcher);
            for (const qty of precursorSet.precursorToTradeFor) {
                await searcher.findSingleInputTokenSwap(input, qty.token, this.config.addresses.executorAddress, 0.1, 1);
            }
            return true;
        }
        catch (e) {
            return false;
        }
    }
    constructor(provider, config, approvalsStore, loadToken) {
        this.provider = provider;
        this.config = config;
        this.approvalsStore = approvalsStore;
        this.loadToken = loadToken;
        const nativeToken = config.nativeToken;
        this.nativeToken = Token.createToken(this.tokens, Address.fromHexString(GAS_TOKEN_ADDRESS), nativeToken.symbol, nativeToken.name, nativeToken.decimals);
    }
    updateBlockState(block, gasPrice) {
        if (block <= this.blockState.currentBlock) {
            return;
        }
        this.blockState.currentBlock = block;
        this.blockState.gasPrice = gasPrice;
    }
    static async createWithConfig(provider, config, initialize, opts = {}) {
        const universe = new Universe(provider, config, opts.approvalsStore ?? new ApprovalsStore(provider), opts.tokenLoader ?? makeTokenLoader(provider));
        initialize(universe).then(() => {
            universe._finishResolving();
        });
        return universe;
    }
}
//# sourceMappingURL=Universe.js.map