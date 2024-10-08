import { Address } from '../base/Address';
import { Approval } from '../base/Approval';
import { ParamType } from '@ethersproject/abi';
import { Contract } from 'ethers';
import { IERC20__factory, } from '../contracts';
import ABI from '../curve-js/src/constants/abis/factory-crypto/factory-crypto-pool-2.json';
import { encodeArg } from '../tx-gen/Planner';
import { Action, DestinationOptions, InteractionConvention, ONE, } from './Action';
class CurveFactoryCryptoPoolBase extends Action('CurveFactoryCryptoPool') {
    get outputSlippage() {
        return 15n;
    }
    gasEstimate() {
        return 10000000n;
    }
    plan(planner, inputs, destination, predictedInputs) {
        throw new Error('Method not implemented.');
    }
    get addToGraph() {
        return false;
    }
}
class CryptoFactoryPoolSwapMint extends CurveFactoryCryptoPoolBase {
    pool;
    async quote(amountsIn) {
        const amts = await this.pool.poolInstance.callStatic.calc_token_amount(amountsIn.map((amt) => amt.amount));
        return [this.pool.lpToken.from(amts)];
    }
    constructor(pool) {
        super(pool.pool, pool.underlying, [pool.lpToken], InteractionConvention.ApprovalRequired, DestinationOptions.Callee, pool.underlying.map((token) => new Approval(token, pool.pool)));
        this.pool = pool;
    }
}
class CryptoFactoryPoolSwapBurn extends CurveFactoryCryptoPoolBase {
    pool;
    async quote([amount]) {
        const [bal0, bal1, totalSupply] = (await Promise.all([
            this.pool.poolInstance.callStatic.balances(0),
            this.pool.poolInstance.callStatic.balances(1),
            IERC20__factory.connect(this.pool.lpToken.address.address, this.pool.universe.provider).callStatic.totalSupply(),
        ]));
        return [
            this.outputToken[0].from((bal0.toBigInt() *
                ((amount.amount * amount.token.scale) / totalSupply.toBigInt())) /
                amount.token.scale),
            this.outputToken[1].from((bal1.toBigInt() *
                ((amount.amount * amount.token.scale) / totalSupply.toBigInt())) /
                amount.token.scale),
        ];
    }
    async plan(planner, inputs, _, predictedInputs) {
        const lib = this.gen.Contract.createContract(this.pool.poolInstance);
        planner.add(lib.remove_liquidity(inputs[0] ?? predictedInputs[0].amount, encodeArg([0, 0], ParamType.fromString('uint256[2]')), false));
        return null;
    }
    get returnsOutput() {
        return false;
    }
    constructor(pool) {
        super(pool.pool, [pool.lpToken], pool.underlying, InteractionConvention.None, DestinationOptions.Callee, []);
        this.pool = pool;
    }
}
class CurveFactoryCryptoPoolAddLiquidityAction extends Action('CurveFactoryCryptoPool') {
    universe;
    pool;
    tokenIndex;
    gasEstimate() {
        return 685000n;
    }
    get returnsOutput() {
        return true;
    }
    async plan(planner, [input], destination, [amountIn]) {
        const poolInst = this.gen.Contract.createContract(new Contract(this.pool.address.address, [
            'function add_liquidity(uint256[2], uint256 min_mint_amount, bool use_eth, address receiver) external returns (uint256)',
        ], this.universe.provider));
        const quote = await this.quoteCache.get(amountIn);
        const tradeInputSplit = this.genUtils.fraction(this.universe, planner, input, quote.tradeFraction, ` of ${amountIn} into ${quote.subTrade.action.toString()}`, `input_trade`);
        const [tradeOutput] = await quote.subTrade.action.planWithOutput(this.universe, planner, [tradeInputSplit], this.universe.execAddress, quote.subTrade.inputs);
        const actionInput = this.genUtils.fraction(this.universe, planner, input, ONE - quote.tradeFraction, ` of ${amountIn} into ${this}`, `input_lpdeposit`);
        const inputs = this.tokenIndex === 0
            ? [actionInput, tradeOutput]
            : [tradeOutput, actionInput];
        return [
            planner.add(poolInst.add_liquidity(inputs, quote.output.amount, false, destination.address), `CurveFactoryCryptoPool.addLiquidity(${quote.amounts.join(', ')}) -> ${quote.output}`),
        ];
    }
    get tokenToTradeFor() {
        return this.pool.allPoolTokens[this.tokenIndex === 0 ? 1 : 0];
    }
    get userInputToken() {
        return this.pool.allPoolTokens[this.tokenIndex];
    }
    async quoteInner(amountIn) {
        const { token0, tok0PrLpToken, token1, tok1PrLpToken } = await this.pool.calcTokenAmountsPrLp();
        let total = tok0PrLpToken.add(tok1PrLpToken.into(token0));
        const fractionToken0 = tok0PrLpToken.div(total);
        const fractionToken1 = tok1PrLpToken.div(total.into(token1));
        let subTrade = null;
        let amounts;
        let tradeFraction;
        const abort = AbortSignal.timeout(Math.floor(this.universe.config.routerDeadline / 4));
        if (this.tokenIndex === 0) {
            const amountQty = amountIn.sub(amountIn.token.wei).mul(fractionToken0);
            const tradeQty = amountIn.sub(amountQty);
            tradeFraction = fractionToken1.amount;
            const paths = await this.universe.searcher.findSingleInputTokenSwap(true, tradeQty, token1, this.universe.execAddress, this.universe.config.defaultInternalTradeSlippage, abort, 1);
            subTrade = paths.path.steps[0];
            amounts = [amountQty, subTrade.outputs[0]];
        }
        else {
            const amountQty = amountIn.sub(amountIn.token.wei).mul(fractionToken1);
            const tradeQty = amountIn.sub(amountQty);
            tradeFraction = fractionToken0.amount;
            const paths = await this.universe.searcher.findSingleInputTokenSwap(true, tradeQty, token0, this.universe.execAddress, this.universe.config.defaultInternalTradeSlippage, abort, 1);
            subTrade = paths.path.steps[0];
            amounts = [subTrade.outputs[0], amountQty];
        }
        const out = await this.pool.poolInstance.calc_token_amount([
            amounts[0].amount,
            amounts[1].amount,
        ]);
        const lpOut = this.outputToken[0].from(out);
        return {
            subTrade,
            output: lpOut,
            tradeFraction,
            amounts,
        };
    }
    async quote([amountsIn]) {
        const quote = await this.quoteCache.get(amountsIn);
        return [quote.output];
    }
    quoteCache;
    constructor(universe, pool, tokenIndex) {
        super(pool.pool, [pool.underlying[tokenIndex]], [pool.lpToken], InteractionConvention.ApprovalRequired, DestinationOptions.Recipient, pool.underlying.map((token) => new Approval(token === universe.nativeToken
            ? universe.wrappedNativeToken
            : token, pool.address)));
        this.universe = universe;
        this.pool = pool;
        this.tokenIndex = tokenIndex;
        this.quoteCache = this.universe.createCache(async (qty) => await this.quoteInner(qty), 1, (qty) => qty.amount);
    }
    get outputSlippage() {
        return 0n;
    }
    toString() {
        return `CurveFactoryCryptoPool.addLiquidity(${this.inputToken.join(', ')} -> ${this.outputToken.join(', ')})`;
    }
}
class CurveFactoryCryptoPoolRemoveLiquidityAction extends Action('CurveFactoryCryptoPool') {
    universe;
    pool;
    tokenIndex;
    gasEstimate() {
        return 600000n;
    }
    get supportsDynamicInput() {
        return true;
    }
    get oneUsePrZap() {
        return true;
    }
    get returnsOutput() {
        return true;
    }
    get outputSlippage() {
        return 0n;
    }
    get addressesInUse() {
        return this.pool.addressesInUse;
    }
    async plan(planner, [lpTokenQtyValue], _, [lpTokenQty]) {
        const lib = this.gen.Contract.createContract(this.pool.poolInstance);
        const mintOutQuote = await this.cache.get(lpTokenQty);
        planner.add(lib.remove_liquidity(lpTokenQtyValue, mintOutQuote.lpBurnOutputs.map((i) => i.amount - i.amount / 1000n), false), `CurveFactoryCryptoPool.removeLiquidity(${lpTokenQty}) -> ${mintOutQuote.output}`);
        let tradeInput = [
            this.genUtils.erc20.balanceOf(this.pool.universe, planner, mintOutQuote.subTrade.path.inputs[0].token, this.pool.universe.execAddress, `Redeem ${this.inputToken} result`),
        ];
        for (const step of mintOutQuote.subTrade.path.steps) {
            tradeInput = await step.action.planWithOutput(this.pool.universe, planner, tradeInput, this.pool.universe.execAddress, mintOutQuote.subTrade.path.inputs);
        }
        return tradeInput;
    }
    async quoteInner(lpTokenQty) {
        const { token0, tok0PrLpToken, token1, tok1PrLpToken } = await this.pool.calcTokenAmountsPrLp();
        const qtyTok0 = lpTokenQty
            .sub(lpTokenQty.token.wei)
            .into(token0)
            .mul(tok0PrLpToken);
        const qtyTok1 = lpTokenQty
            .sub(lpTokenQty.token.wei)
            .into(token1)
            .mul(tok1PrLpToken);
        const [qtyToKeep, qtyToTrade] = qtyTok0.token === this.outputToken[0]
            ? [qtyTok0, qtyTok1]
            : [qtyTok1, qtyTok0];
        const outputToken = qtyToKeep.token;
        const quote = await this.pool.universe.searcher.findSingleInputTokenSwap(true, qtyToTrade, outputToken, this.pool.universe.execAddress, this.pool.universe.config.defaultInternalTradeSlippage, AbortSignal.timeout(this.pool.universe.config.routerDeadline), 2);
        const outputQty = quote.outputs[0].add(qtyToKeep);
        return {
            subTrade: quote,
            output: [outputQty],
            lpBurnOutputs: [qtyTok0, qtyTok1],
        };
    }
    cache;
    async quote([amountsIn]) {
        const quote = await this.cache.get(amountsIn);
        return quote.output;
    }
    constructor(universe, pool, tokenIndex) {
        super(pool.pool, [pool.lpToken], [pool.underlying[tokenIndex]], InteractionConvention.None, DestinationOptions.Callee, []);
        this.universe = universe;
        this.pool = pool;
        this.tokenIndex = tokenIndex;
        this.cache = this.pool.universe.createCache(async (qty) => await this.quoteInner(qty), 1, (qty) => qty.amount);
    }
    toString() {
        return `CurveFactoryCryptoPool.removeLiquidity(${this.inputToken.join(', ')} -> ${this.outputToken.join(', ')})`;
    }
}
export class CurveFactoryCryptoPool {
    universe;
    pool;
    lpToken;
    underlying;
    actions;
    get outputSlippage() {
        return 1n;
    }
    get address() {
        return this.pool;
    }
    async calcTokenAmountsPrLp() {
        const [token0, token1] = this.allPoolTokens;
        const lpTokenSupply = this.lpToken.from(await this.lpTokenInstance.totalSupply());
        const balanceToken0 = token0.from(await this.poolInstance.balances(0));
        const balanceToken1 = token1.from(await this.poolInstance.balances(1));
        const tok0PrLpToken = balanceToken0.div(lpTokenSupply.into(token0));
        const tok1PrLpToken = balanceToken1.div(lpTokenSupply.into(token1));
        return {
            token0,
            token1,
            tok0PrLpToken,
            tok1PrLpToken,
        };
    }
    poolInstance;
    lpTokenInstance;
    get allPoolTokens() {
        return this.underlying;
    }
    addressesInUse;
    constructor(universe, pool, lpToken, underlying) {
        this.universe = universe;
        this.pool = pool;
        this.lpToken = lpToken;
        this.underlying = underlying;
        this.addressesInUse = new Set([pool]);
        this.actions = underlying.map((_, index) => ({
            remove: new CurveFactoryCryptoPoolRemoveLiquidityAction(universe, this, index),
            add: new CurveFactoryCryptoPoolAddLiquidityAction(universe, this, index),
        }));
        const mintable = {
            mint: new CryptoFactoryPoolSwapMint(this),
            burn: new CryptoFactoryPoolSwapBurn(this),
        };
        this.lpTokenInstance = IERC20__factory.connect(this.lpToken.address.address, this.universe.provider);
        this.poolInstance = new Contract(this.pool.address, ABI, this.universe.provider);
        for (const { add, remove } of this.actions) {
            universe.addAction(add);
            universe.addAction(remove);
        }
        universe.addSingleTokenPriceSource({
            token: this.lpToken,
            priceFn: async () => {
                const out = await mintable.burn.quote([this.lpToken.one]);
                const underlyingTokens = await Promise.all(out.map(async (i) => (await universe.fairPrice(i)) ?? universe.usd.zero));
                const sum = underlyingTokens.reduce((a, b) => a.add(b), universe.usd.zero);
                return sum;
            },
            priceToken: universe.usd,
        });
        universe.defineMintable(mintable.mint, mintable.burn, true);
    }
    toString() {
        return `CurveFactoryCryptoPool(addr=${this.pool.address}, lp=${this.lpToken}, coins=[${this.underlying.join(', ')}])`;
    }
}
export const setupCurveFactoryCryptoPool = async (universe, pool) => {
    const poolInstance = new Contract(pool.address, ABI, universe.provider);
    const n = 2;
    const underlying = [];
    for (let i = 0; i < n; i++) {
        const token = await poolInstance.coins(i);
        const tok = await universe.getToken(Address.from(token));
        underlying.push(tok);
    }
    const lpToken = await universe.getToken(Address.from(await poolInstance.token()));
    const out = new CurveFactoryCryptoPool(universe, pool, lpToken, underlying);
    return out;
};
//# sourceMappingURL=CurveFactoryCryptoPool.js.map