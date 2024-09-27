"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupCurveFactoryCryptoPool = exports.CurveFactoryCryptoPool = void 0;
const tslib_1 = require("tslib");
const Address_1 = require("../base/Address");
const Approval_1 = require("../base/Approval");
const abi_1 = require("@ethersproject/abi");
const ethers_1 = require("ethers");
const contracts_1 = require("../contracts");
const factory_crypto_pool_2_json_1 = tslib_1.__importDefault(require("../curve-js/src/constants/abis/factory-crypto/factory-crypto-pool-2.json"));
const Planner_1 = require("../tx-gen/Planner");
const Action_1 = require("./Action");
class CurveFactoryCryptoPoolBase extends (0, Action_1.Action)('CurveFactoryCryptoPool') {
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
        super(pool.pool, pool.underlying, [pool.lpToken], Action_1.InteractionConvention.ApprovalRequired, Action_1.DestinationOptions.Callee, pool.underlying.map((token) => new Approval_1.Approval(token, pool.pool)));
        this.pool = pool;
    }
}
class CryptoFactoryPoolSwapBurn extends CurveFactoryCryptoPoolBase {
    pool;
    async quote([amount]) {
        const [bal0, bal1, totalSupply] = (await Promise.all([
            this.pool.poolInstance.callStatic.balances(0),
            this.pool.poolInstance.callStatic.balances(1),
            contracts_1.IERC20__factory.connect(this.pool.lpToken.address.address, this.pool.universe.provider).callStatic.totalSupply(),
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
        planner.add(lib.remove_liquidity(inputs[0] ?? predictedInputs[0].amount, (0, Planner_1.encodeArg)([0, 0], abi_1.ParamType.fromString('uint256[2]')), false));
        return null;
    }
    get returnsOutput() {
        return false;
    }
    constructor(pool) {
        super(pool.pool, [pool.lpToken], pool.underlying, Action_1.InteractionConvention.None, Action_1.DestinationOptions.Callee, []);
        this.pool = pool;
    }
}
class CurveFactoryCryptoPoolAddLiquidityAction extends (0, Action_1.Action)('CurveFactoryCryptoPool') {
    universe;
    pool;
    tokenIndex;
    gasEstimate() {
        return 385000n;
    }
    get returnsOutput() {
        return true;
    }
    async plan(planner, [input], destination, [amountIn]) {
        const poolInst = this.gen.Contract.createContract(new ethers_1.Contract(this.pool.address.address, [
            'function add_liquidity(uint256[2], uint256 min_mint_amount, bool use_eth, address receiver) external returns (uint256)',
        ], this.universe.provider));
        const quote = await this.quoteCache.get(amountIn);
        const tradeInputSplit = this.genUtils.fraction(this.universe, planner, input, quote.tradeFraction, ` of ${amountIn} into ${quote.subTrade.action.toString()}`, `input_trade`);
        const [tradeOutput] = await quote.subTrade.action.planWithOutput(this.universe, planner, [tradeInputSplit], this.universe.execAddress, quote.subTrade.inputs);
        const actionInput = this.genUtils.fraction(this.universe, planner, input, Action_1.ONE - quote.tradeFraction, ` of ${amountIn} into ${this}`, `input_lpdeposit`);
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
        const [token0, token1] = this.pool.allPoolTokens;
        const lpTokenSupply = this.pool.lpToken.from(await this.pool.lpTokenInstance.totalSupply());
        const balanceToken0 = token0.from(await this.pool.poolInstance.balances(0));
        const balanceToken1 = token1.from(await this.pool.poolInstance.balances(1));
        const tok0PrLpToken = lpTokenSupply.into(token0).div(balanceToken0);
        const tok1PrLpToken = lpTokenSupply.into(token1).div(balanceToken1);
        let total = tok0PrLpToken.add(tok1PrLpToken.into(token0));
        const fractionToken0 = tok0PrLpToken.div(total);
        const fractionToken1 = tok1PrLpToken.div(total.into(token1));
        let subTrade = null;
        let amounts;
        let tradeFraction;
        const abort = AbortSignal.timeout(Math.floor(this.universe.config.routerDeadline / 4));
        if (this.tokenIndex === 0) {
            const amountQty = amountIn.mul(fractionToken0);
            const tradeQty = amountIn.sub(amountQty);
            tradeFraction = fractionToken1.amount;
            const paths = await this.universe.searcher.findSingleInputTokenSwap(true, tradeQty, token1, this.universe.execAddress, this.universe.config.defaultInternalTradeSlippage, abort, 1);
            subTrade = paths.path.steps[0];
            amounts = [amountQty, subTrade.outputs[0]];
        }
        else {
            const amountQty = amountIn.mul(fractionToken1);
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
            amounts
        };
    }
    async quote([amountsIn]) {
        const quote = await this.quoteCache.get(amountsIn);
        return [quote.output];
    }
    quoteCache;
    constructor(universe, pool, tokenIndex) {
        super(pool.pool, [pool.underlying[tokenIndex]], [pool.lpToken], Action_1.InteractionConvention.ApprovalRequired, Action_1.DestinationOptions.Recipient, pool.underlying.map((token) => new Approval_1.Approval(token === universe.nativeToken
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
class CurveFactoryCryptoPoolRemoveLiquidityAction extends (0, Action_1.Action)('CurveFactoryCryptoPool') {
    universe;
    pool;
    tokenIndex;
    gasEstimate() {
        return 100000n;
    }
    get outputSlippage() {
        return 30n;
    }
    async plan(planner, inputs, _, predicted) {
        const lib = this.gen.Contract.createContract(this.pool.poolInstance);
        const mintOutQuote = await this.quoteWithSlippage(predicted);
        const input = inputs[0] ?? (0, Planner_1.encodeArg)(predicted[0].amount, abi_1.ParamType.from('uint256'));
        return [
            planner.add(lib.remove_liquidity_one_coin(input, this.tokenIndex, mintOutQuote[0].amount, false), `CurveFactoryCryptoPool.removeLiquidity: ${predicted.join(', ')} -> ${mintOutQuote.join(', ')}`),
        ];
    }
    async quote([amountsIn]) {
        const out = await this.pool.poolInstance.callStatic.calc_withdraw_one_coin(amountsIn.amount, this.tokenIndex);
        return [this.outputToken[0].from(ethers_1.BigNumber.from(out))];
    }
    constructor(universe, pool, tokenIndex) {
        super(pool.pool, [pool.lpToken], [pool.underlying[tokenIndex]], Action_1.InteractionConvention.None, Action_1.DestinationOptions.Callee, []);
        this.universe = universe;
        this.pool = pool;
        this.tokenIndex = tokenIndex;
    }
    toString() {
        return `CurveFactoryCryptoPool.removeLiquidity(${this.inputToken.join(', ')} -> ${this.outputToken.join(', ')})`;
    }
}
class CurveFactoryCryptoPool {
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
    poolInstance;
    lpTokenInstance;
    get allPoolTokens() {
        return this.underlying;
    }
    constructor(universe, pool, lpToken, underlying) {
        this.universe = universe;
        this.pool = pool;
        this.lpToken = lpToken;
        this.underlying = underlying;
        this.actions = underlying.map((_, index) => ({
            remove: new CurveFactoryCryptoPoolRemoveLiquidityAction(universe, this, index),
            add: new CurveFactoryCryptoPoolAddLiquidityAction(universe, this, index),
        }));
        const mintable = {
            mint: new CryptoFactoryPoolSwapMint(this),
            burn: new CryptoFactoryPoolSwapBurn(this),
        };
        this.lpTokenInstance = contracts_1.IERC20__factory.connect(this.lpToken.address.address, this.universe.provider);
        this.poolInstance = new ethers_1.Contract(this.pool.address, factory_crypto_pool_2_json_1.default, this.universe.provider);
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
exports.CurveFactoryCryptoPool = CurveFactoryCryptoPool;
const setupCurveFactoryCryptoPool = async (universe, pool) => {
    const poolInstance = new ethers_1.Contract(pool.address, factory_crypto_pool_2_json_1.default, universe.provider);
    const n = 2;
    const underlying = [];
    for (let i = 0; i < n; i++) {
        const token = await poolInstance.coins(i);
        const tok = await universe.getToken(Address_1.Address.from(token));
        underlying.push(tok);
    }
    const lpToken = await universe.getToken(Address_1.Address.from(await poolInstance.token()));
    const out = new CurveFactoryCryptoPool(universe, pool, lpToken, underlying);
    return out;
};
exports.setupCurveFactoryCryptoPool = setupCurveFactoryCryptoPool;
//# sourceMappingURL=CurveFactoryCryptoPool.js.map