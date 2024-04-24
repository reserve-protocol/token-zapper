import { type Universe } from '../Universe';
import { type Token, type TokenQuantity } from '../entities/Token';
import { Planner, Value } from '../tx-gen/Planner';
import { Action } from './Action';
export declare class MintCTokenAction extends Action {
    readonly universe: Universe;
    readonly underlying: Token;
    readonly cToken: Token;
    private readonly rate;
    plan(planner: Planner, inputs: Value[]): Promise<Value[]>;
    gasEstimate(): bigint;
    private readonly rateScale;
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    get outputSlippage(): bigint;
    constructor(universe: Universe, underlying: Token, cToken: Token, rate: {
        value: bigint;
    });
    toString(): string;
}
export declare class BurnCTokenAction extends Action {
    readonly universe: Universe;
    readonly underlying: Token;
    readonly cToken: Token;
    private readonly rate;
    get outputSlippage(): bigint;
    plan(planner: Planner, inputs: Value[]): Promise<Value[]>;
    gasEstimate(): bigint;
    private readonly rateScale;
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, underlying: Token, cToken: Token, rate: {
        value: bigint;
    });
    toString(): string;
}
//# sourceMappingURL=CTokens.d.ts.map