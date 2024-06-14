"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupCurveFactoryCryptoPool = exports.CurveFactoryCryptoPool = void 0;
const tslib_1 = require("tslib");
const Address_1 = require("../base/Address");
const Approval_1 = require("../base/Approval");
const Planner_1 = require("../tx-gen/Planner");
const Action_1 = require("./Action");
const factory_crypto_pool_2_json_1 = tslib_1.__importDefault(require("../curve-js/src/constants/abis/factory-crypto/factory-crypto-pool-2.json"));
const ethers_1 = require("ethers");
const abi_1 = require("@ethersproject/abi");
const contracts_1 = require("../contracts");
const PriceOracle_1 = require("../oracles/PriceOracle");
class CurveFactoryCryptoPoolBase extends (0, Action_1.Action)('CurveFactoryCryptoPool') {
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
            contracts_1.IERC20__factory.connect(this.pool.lpToken.address.address, this.pool.universe.provider).callStatic.totalSupply()
        ]));
        return [
            this.outputToken[0].from((bal0.toBigInt() * ((amount.amount * amount.token.scale) / totalSupply.toBigInt())) / amount.token.scale),
            this.outputToken[1].from((bal1.toBigInt() * ((amount.amount * amount.token.scale) / totalSupply.toBigInt())) / amount.token.scale),
        ];
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
        return 100000n;
    }
    get outputSlippage() {
        return 1n;
    }
    get returnsOutput() {
        return true;
    }
    async plan(planner, inputs, _, predicted) {
        const helper = contracts_1.CurveCryptoFactoryHelper__factory.connect(this.universe.config.addresses.curveCryptoFactoryHelper.address, this.universe.provider);
        const lib = this.gen.Contract.createLibrary(helper);
        const mintOutQuote = await this.quote(predicted);
        const input = inputs[0] ?? (0, Planner_1.encodeArg)(predicted[0].amount, abi_1.ParamType.from('uint256'));
        return [
            planner.add(lib.addliquidity(input, this.tokenIndex, this.pool.address.address, 0n, this.inputToken[0] === this.universe.nativeToken), `CurveFactoryCryptoPool.add_liquidity: ${predicted.join(', ')} -> ${mintOutQuote.join(', ')}`),
        ];
    }
    async quote([amountsIn]) {
        const out = await this.pool.poolInstance.calc_token_amount(this.tokenIndex === 0 ? [amountsIn.amount, 0n] : [0n, amountsIn.amount]);
        return [this.outputToken[0].from(out)];
    }
    constructor(universe, pool, tokenIndex) {
        super(pool.pool, [pool.underlying[tokenIndex]], [pool.lpToken], pool.underlying[tokenIndex] === universe.nativeToken
            ? Action_1.InteractionConvention.None
            : Action_1.InteractionConvention.ApprovalRequired, Action_1.DestinationOptions.Callee, pool.underlying[tokenIndex] === universe.nativeToken
            ? []
            : [new Approval_1.Approval(pool.underlying[tokenIndex], pool.address)]);
        this.universe = universe;
        this.pool = pool;
        this.tokenIndex = tokenIndex;
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
        return 1n;
    }
    async plan(planner, inputs, _, predicted) {
        const lib = this.gen.Contract.createContract(this.pool.poolInstance);
        const mintOutQuote = await this.quote(predicted);
        const input = inputs[0] ?? (0, Planner_1.encodeArg)(predicted[0].amount, abi_1.ParamType.from('uint256'));
        return [
            planner.add(lib.remove_liquidity_one_coin(input, this.tokenIndex, false, this.universe.execAddress.address), `CurveFactoryCryptoPool.removeLiquidity: ${predicted.join(', ')} -> ${mintOutQuote.join(', ')}`),
        ];
    }
    async quote([amountsIn]) {
        const out = await this.pool.poolInstance.calc_withdraw_one_coin(amountsIn.amount, this.tokenIndex);
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
        this.poolInstance = new ethers_1.Contract(this.pool.address, factory_crypto_pool_2_json_1.default, this.universe.provider);
        for (const { add, remove } of this.actions) {
            universe.addAction(add);
            universe.addAction(remove);
        }
        const oracle = PriceOracle_1.PriceOracle.createSingleTokenOracle(universe, this.lpToken, async () => {
            const out = await mintable.burn.quote([this.lpToken.one]);
            const underlyingTokens = await Promise.all(out.map(async (i) => (await universe.fairPrice(i)) ?? universe.usd.zero));
            const sum = underlyingTokens.reduce((a, b) => a.add(b), universe.usd.zero);
            return sum;
        });
        universe.oracles.push(oracle);
        universe.defineMintable(mintable.mint, mintable.burn);
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
        underlying.push(await universe.getToken(Address_1.Address.from(token)));
    }
    const lpToken = await universe.getToken(Address_1.Address.from(await poolInstance.token()));
    const out = new CurveFactoryCryptoPool(universe, pool, lpToken, underlying);
    return out;
};
exports.setupCurveFactoryCryptoPool = setupCurveFactoryCryptoPool;
//# sourceMappingURL=CurveFactoryCryptoPool.js.map