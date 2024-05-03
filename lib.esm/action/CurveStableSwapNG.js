import { Address } from '../base/Address';
import { Approval } from '../base/Approval';
import { CurveStableSwapNGHelper__factory, ICurveStableSwapNG__factory, } from '../contracts';
import { Action, DestinationOptions, InteractionConvention } from './Action';
export class CurveStableSwapNGPool {
    universe;
    pool;
    underlying;
    addLiqudity;
    removeLiquidity;
    poolInstance;
    constructor(universe, pool, underlying) {
        this.universe = universe;
        this.pool = pool;
        this.underlying = underlying;
        this.addLiqudity = underlying.map((_, index) => new CurveStableSwapNGAddLiquidity(universe, this, index));
        this.removeLiquidity = underlying.map((_, index) => new CurveStableSwapNGRemoveLiquidity(universe, this, index));
        this.poolInstance = ICurveStableSwapNG__factory.connect(pool.address.address, universe.provider);
        for (const action of [...this.addLiqudity, ...this.removeLiquidity]) {
            universe.addAction(action);
        }
    }
    toString() {
        return `CurveStableSwapNGPool(addr=${this.pool.address}, lp=${this.pool}, coins=[${this.underlying.join(', ')}])`;
    }
    getAddLiquidityAction(input) {
        const out = this.addLiqudity.find((action) => action.inputToken[0] === input);
        if (out) {
            return out;
        }
        throw new Error(`Could not find add liquidity action for ${input}`);
    }
    getRemoveLiquidityAction(input) {
        const out = this.removeLiquidity.find((action) => action.inputToken[0] === input);
        if (out) {
            return out;
        }
        throw new Error(`Could not find remove liquidity action for ${input}`);
    }
}
export class CurveStableSwapNGAddLiquidity extends Action('CurveStableSwapNG') {
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
        const lib = this.gen.Contract.createLibrary(CurveStableSwapNGHelper__factory.connect(this.universe.config.addresses.curveStableSwapNGHelper.address, this.universe.provider));
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
        super(pool.pool.address, [pool.underlying[tokenIndex]], [pool.pool], InteractionConvention.ApprovalRequired, DestinationOptions.Callee, [new Approval(pool.underlying[tokenIndex], pool.pool.address)]);
        this.universe = universe;
        this.pool = pool;
        this.tokenIndex = tokenIndex;
    }
    toString() {
        return `CurveStableSwapNGAddLiquidity(${this.inputToken.join(', ')} -> ${this.outputToken.join(', ')})`;
    }
}
export class CurveStableSwapNGRemoveLiquidity extends Action('CurveStableSwapNG') {
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
        const lib = this.gen.Contract.createContract(ICurveStableSwapNG__factory.connect(this.pool.pool.address.address, this.universe.provider));
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
        super(pool.pool.address, [pool.pool], [pool.underlying[tokenIndex]], InteractionConvention.ApprovalRequired, DestinationOptions.Callee, [new Approval(pool.underlying[tokenIndex], pool.pool.address)]);
        this.universe = universe;
        this.pool = pool;
        this.tokenIndex = tokenIndex;
    }
    toString() {
        return `CurveStableSwapNGRemoveLiquidity(${this.inputToken.join(', ')} -> ${this.outputToken.join(', ')})`;
    }
}
export const setupCurveStableSwapNGPool = async (universe, pool) => {
    const poolInstance = ICurveStableSwapNG__factory.connect(pool.address.address, universe.provider);
    const n = (await poolInstance.N_COINS()).toNumber();
    const underlying = [];
    for (let i = 0; i < n; i++) {
        const token = await poolInstance.coins(i);
        underlying.push(await universe.getToken(Address.from(token)));
    }
    return new CurveStableSwapNGPool(universe, pool, underlying);
};
//# sourceMappingURL=CurveStableSwapNG.js.map