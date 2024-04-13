import { Address } from './base/Address';
import { Graph } from './exchange-graph/Graph';
import { Token } from './entities/Token';
import { makeTokenLoader } from './entities/makeTokenLoader';
import { DefaultMap } from './base/DefaultMap';
import { LPTokenPriceOracle } from './oracles/LPTokenPriceOracle';
import { Refreshable } from './entities/Refreshable';
import { ApprovalsStore } from './searcher/ApprovalsStore';
import { GAS_TOKEN_ADDRESS, USD_ADDRESS } from './base/constants';
import { MintRTokenAction } from './action/RTokens';
import { Searcher } from './searcher/Searcher';
import { findPrecursorTokenSet } from './searcher/Searcher';
import EventEmitter from 'events';
export class Universe {
    provider;
    config;
    approvalsStore;
    loadToken;
    emitter = new EventEmitter();
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
        return this._gasTokenPrice ?? this.usd.from(0);
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
    precursorTokenSourcingSpecialCases = new DefaultMap(() => new Map());
    actions = new DefaultMap(() => []);
    allActions = new Set();
    tokenTradeSpecialCases = new Map();
    // The GAS token for the EVM chain, set by the StaticConfig
    nativeToken;
    wrappedNativeToken;
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
        const out = (await this.oracle?.quote(qty).catch(() => {
            return null;
        })) ?? null;
        return out;
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
        this.addAction(lpTokenInstance.mintAction);
        // this.defineMintable(
        //   lpTokenInstance.mintAction,
        //   lpTokenInstance.burnAction,
        //   true
        // )
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
            throw new Error('Not an rToken');
        }
        if (!(wrappable.mint instanceof MintRTokenAction)) {
            throw new Error('Not an rToken');
        }
        const action = wrappable.mint;
        const unit = action.basket.unitBasket;
        const searcher = new Searcher(this);
        const input = this.nativeToken.from('0.1');
        const precursorSet = await findPrecursorTokenSet(this, input, token, unit, searcher);
        let tokensMissings = [];
        for (const qty of precursorSet.precursorToTradeFor) {
            try {
                const out = await searcher.findSingleInputTokenSwap(input, qty.token, this.config.addresses.executorAddress, 0.1, 1);
                if (out.length === 0) {
                    tokensMissings.push(qty.token);
                }
            }
            catch (e) {
                tokensMissings.push(qty.token);
            }
        }
        return {
            canZap: tokensMissings.length === 0,
            tokensMissings,
        };
    }
    constructor(provider, config, approvalsStore, loadToken) {
        this.provider = provider;
        this.config = config;
        this.approvalsStore = approvalsStore;
        this.loadToken = loadToken;
        const nativeToken = config.nativeToken;
        this.searcher = new Searcher(this);
        this.nativeToken = Token.createToken(this.tokens, Address.fromHexString(GAS_TOKEN_ADDRESS), nativeToken.symbol, nativeToken.name, nativeToken.decimals);
        this.wrappedNativeToken = Token.createToken(this.tokens, config.addresses.wrappedNative, 'W' + nativeToken.symbol, 'Wrapped ' + nativeToken.name, nativeToken.decimals);
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
        const universe = new Universe(provider, config, opts.approvalsStore ?? new ApprovalsStore(provider), opts.tokenLoader ?? makeTokenLoader(provider));
        universe.oracles.push(new LPTokenPriceOracle(universe));
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
        const inputTokenQty = (await this.getToken(Address.from(tokenIn))).from(amountIn);
        const outputToken = await this.getToken(Address.from(rToken));
        return this.searcher.findSingleInputToRTokenZap(inputTokenQty, outputToken, Address.from(signerAddress));
    }
    async zapETH(amountIn, rToken, signerAddress) {
        const inputTokenQty = this.nativeToken.from(amountIn);
        const outputToken = await this.getToken(Address.from(rToken));
        return this.searcher.findSingleInputToRTokenZap(inputTokenQty, outputToken, Address.from(signerAddress));
    }
    async redeem(rToken, amount, output, signerAddress) {
        const inputTokenQty = (await this.getToken(Address.from(rToken))).from(amount);
        const outputToken = await this.getToken(Address.from(output));
        return this.searcher.findRTokenIntoSingleTokenZap(inputTokenQty, outputToken, Address.from(signerAddress));
    }
}
//# sourceMappingURL=Universe.js.map