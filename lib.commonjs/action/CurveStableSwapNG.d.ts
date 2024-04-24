import { type Universe } from '../Universe';
import { Address } from '../base/Address';
import { ICurveStableSwapNG } from '../contracts';
import { type Token, type TokenQuantity } from '../entities/Token';
import { Planner, Value } from '../tx-gen/Planner';
import { Action } from './Action';
export declare class CurveStableSwapNGPool {
    readonly universe: Universe;
    readonly pool: Token;
    readonly underlying: Token[];
    readonly addLiqudity: CurveStableSwapNGAddLiquidity[];
    readonly removeLiquidity: CurveStableSwapNGRemoveLiquidity[];
    readonly poolInstance: ICurveStableSwapNG;
    constructor(universe: Universe, pool: Token, underlying: Token[]);
    toString(): string;
    getAddLiquidityAction(input: Token): CurveStableSwapNGAddLiquidity;
    getRemoveLiquidityAction(input: Token): CurveStableSwapNGRemoveLiquidity;
}
export declare class CurveStableSwapNGAddLiquidity extends Action {
    readonly universe: Universe;
    readonly pool: CurveStableSwapNGPool;
    readonly tokenIndex: number;
    get outputSlippage(): bigint;
    gasEstimate(): bigint;
    plan(planner: Planner, [input]: Value[], _: Address, predicted: TokenQuantity[]): Promise<Value[]>;
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, pool: CurveStableSwapNGPool, tokenIndex: number);
    toString(): string;
}
export declare class CurveStableSwapNGRemoveLiquidity extends Action {
    readonly universe: Universe;
    readonly pool: CurveStableSwapNGPool;
    readonly tokenIndex: number;
    get outputSlippage(): bigint;
    gasEstimate(): bigint;
    plan(planner: Planner, inputs: Value[], _: Address, predicted: TokenQuantity[]): Promise<Value[]>;
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, pool: CurveStableSwapNGPool, tokenIndex: number);
    toString(): string;
}
export declare const setupCurveStableSwapNGPool: (universe: Universe, pool: Token) => Promise<CurveStableSwapNGPool>;
