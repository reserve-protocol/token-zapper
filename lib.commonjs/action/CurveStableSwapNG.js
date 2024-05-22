"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupCurveStableSwapNGPool = exports.CurveStableSwapNGRemoveLiquidity = exports.CurveStableSwapNGAddLiquidity = exports.CurveStableSwapNGPool = void 0;
const Address_1 = require("../base/Address");
const Approval_1 = require("../base/Approval");
const contracts_1 = require("../contracts");
const Action_1 = require("./Action");
class NGSwapBase extends (0, Action_1.Action)('CurveStableSwapNG') {
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
class NGSwapMint extends NGSwapBase {
    pool;
    async quote(amountsIn) {
        const amts = await this.pool.poolInstance.callStatic.calc_token_amount(amountsIn.map((amt) => amt.amount), true);
        return [this.pool.lpToken.from(amts)];
    }
    constructor(pool) {
        super(pool.pool.address, pool.underlying, [pool.lpToken], Action_1.InteractionConvention.ApprovalRequired, Action_1.DestinationOptions.Callee, pool.underlying.map((token) => new Approval_1.Approval(token, pool.pool.address)));
        this.pool = pool;
    }
}
class NGSwapBurn extends NGSwapBase {
    pool;
    async quote(amounts) {
        const amts = await this.pool.poolInstance.callStatic.remove_liquidity(amounts[0].amount, this.pool.underlying.map((_) => 0));
        return amts.map((amt, i) => this.pool.underlying[i].from(amt));
    }
    constructor(pool) {
        super(pool.pool.address, [pool.lpToken], pool.underlying, Action_1.InteractionConvention.None, Action_1.DestinationOptions.Callee, []);
        this.pool = pool;
    }
}
class CurveStableSwapNGPool {
    universe;
    pool;
    underlying;
    actions;
    get outputSlippage() {
        return 1n;
    }
    get address() {
        return this.pool.address;
    }
    poolInstance;
    get lpToken() {
        return this.pool;
    }
    get allPoolTokens() {
        return this.underlying;
    }
    constructor(universe, pool, underlying) {
        this.universe = universe;
        this.pool = pool;
        this.underlying = underlying;
        this.actions = underlying.map((_, index) => ({
            remove: new CurveStableSwapNGRemoveLiquidity(universe, this, index),
            add: new CurveStableSwapNGAddLiquidity(universe, this, index),
        }));
        const mintable = {
            mint: new NGSwapMint(this),
            burn: new NGSwapBurn(this),
        };
        this.poolInstance = contracts_1.ICurveStableSwapNG__factory.connect(pool.address.address, universe.provider);
        for (const { add, remove } of this.actions) {
            universe.addAction(add);
            universe.addAction(remove);
        }
        universe.defineMintable(mintable.mint, mintable.burn);
    }
    toString() {
        return `CurveStableSwapNGPool(addr=${this.pool.address}, lp=${this.pool}, coins=[${this.underlying.join(', ')}])`;
    }
    getAddLiquidityAction(input) {
        const out = this.actions.find((action) => action.add.inputToken[0] === input);
        if (out) {
            return out;
        }
        throw new Error(`Could not find add liquidity action for ${input}`);
    }
    getRemoveLiquidityAction(input) {
        const out = this.actions.find((action) => action.remove.outputToken[0] === input);
        if (out) {
            return out;
        }
        throw new Error(`Could not find remove liquidity action for ${input}`);
    }
}
exports.CurveStableSwapNGPool = CurveStableSwapNGPool;
class CurveStableSwapNGAddLiquidity extends (0, Action_1.Action)('CurveStableSwapNG') {
    universe;
    pool;
    tokenIndex;
    get outputSlippage() {
        return 1n;
    }
    gasEstimate() {
        return BigInt(300000n);
    }
    async plan(planner, [input], _, predicted) {
        const lib = this.gen.Contract.createLibrary(contracts_1.CurveStableSwapNGHelper__factory.connect(this.universe.config.addresses.curveStableSwapNGHelper.address, this.universe.provider));
        const mintOutQuote = await this.quote(predicted);
        const minOut = 0; // mintOutQuote[0].amount - mintOutQuote[0].amount / 1000n;
        const add = planner.add(lib.addliquidity(input, this.tokenIndex, this.pool.pool.address.address, minOut), `CurveStableSwapNGAddLiquidity: ${predicted.join(', ')} -> ${mintOutQuote.join(', ')}`);
        return [add];
    }
    async quote([amountsIn]) {
        const out = await this.pool.poolInstance.calc_token_amount(this.pool.underlying.map((_, index) => this.tokenIndex === index ? amountsIn.amount : 0n), true);
        return [this.outputToken[0].from(out)];
    }
    constructor(universe, pool, tokenIndex) {
        super(pool.pool.address, [pool.underlying[tokenIndex]], [pool.pool], Action_1.InteractionConvention.ApprovalRequired, Action_1.DestinationOptions.Callee, [new Approval_1.Approval(pool.underlying[tokenIndex], pool.pool.address)]);
        this.universe = universe;
        this.pool = pool;
        this.tokenIndex = tokenIndex;
    }
    toString() {
        return `CurveStableSwapNGAddLiquidity(${this.inputToken.join(', ')} -> ${this.outputToken.join(', ')})`;
    }
}
exports.CurveStableSwapNGAddLiquidity = CurveStableSwapNGAddLiquidity;
class CurveStableSwapNGRemoveLiquidity extends (0, Action_1.Action)('CurveStableSwapNG') {
    universe;
    pool;
    tokenIndex;
    get outputSlippage() {
        return 1n;
    }
    gasEstimate() {
        return BigInt(300000n);
    }
    async plan(planner, inputs, _, predicted) {
        const lib = this.gen.Contract.createContract(contracts_1.ICurveStableSwapNG__factory.connect(this.pool.pool.address.address, this.universe.provider));
        const mintOutQuote = await this.quote(predicted);
        const minOut = mintOutQuote[0].amount;
        return [
            planner.add(lib.remove_liquidity_one_coin(inputs[0], this.tokenIndex, minOut), `CurveStableSwapNGRemoveLiquidity: ${predicted.join(', ')} -> ${mintOutQuote.join(', ')}`),
        ];
    }
    async quote([amountsIn]) {
        const out = await this.pool.poolInstance.calc_withdraw_one_coin(amountsIn.amount, this.tokenIndex);
        return [this.outputToken[0].from(out)];
    }
    constructor(universe, pool, tokenIndex) {
        super(pool.pool.address, [pool.pool], [pool.underlying[tokenIndex]], Action_1.InteractionConvention.ApprovalRequired, Action_1.DestinationOptions.Callee, [new Approval_1.Approval(pool.underlying[tokenIndex], pool.pool.address)]);
        this.universe = universe;
        this.pool = pool;
        this.tokenIndex = tokenIndex;
    }
    toString() {
        return `CurveStableSwapNGRemoveLiquidity(${this.inputToken.join(', ')} -> ${this.outputToken.join(', ')})`;
    }
}
exports.CurveStableSwapNGRemoveLiquidity = CurveStableSwapNGRemoveLiquidity;
const setupCurveStableSwapNGPool = async (universe, pool) => {
    const poolInstance = contracts_1.ICurveStableSwapNG__factory.connect(pool.address.address, universe.provider);
    const n = (await poolInstance.N_COINS()).toNumber();
    const underlying = [];
    for (let i = 0; i < n; i++) {
        const token = await poolInstance.coins(i);
        underlying.push(await universe.getToken(Address_1.Address.from(token)));
    }
    return new CurveStableSwapNGPool(universe, pool, underlying);
};
exports.setupCurveStableSwapNGPool = setupCurveStableSwapNGPool;
//# sourceMappingURL=CurveStableSwapNG.js.map