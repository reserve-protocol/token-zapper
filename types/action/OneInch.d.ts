import { Address } from '../base/Address';
import { type Token, type TokenQuantity } from '../entities/Token';
import { type Universe } from '../Universe';
import { Action } from './Action';
import { type OneInchSwapResponse } from '../aggregators/oneInch/oneInchRegistry';
import { Planner, Value } from '../tx-gen/Planner';
export declare class OneInchAction extends Action {
    readonly universe: Universe;
    private readonly outputToken;
    private readonly actionQuote;
    plan(planner: Planner, _: Value[], destination: Address): Promise<Value[]>;
    gasEstimate(): bigint;
    toString(): string;
    private readonly outputQty;
    quote(_: TokenQuantity[]): Promise<TokenQuantity[]>;
    private constructor();
    static createAction(universe: Universe, input: Token, output: Token, quote: OneInchSwapResponse, slippagePercent: number): OneInchAction;
}
//# sourceMappingURL=OneInch.d.ts.map