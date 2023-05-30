import { type Token, type TokenQuantity } from '../entities/Token';
import { type Universe } from '../Universe';
import { Action } from './Action';
import { ContractCall } from '../base/ContractCall';
import { type OneInchSwapResponse } from '../aggregators/oneInch/oneInchRegistry';
export declare class OneInchAction extends Action {
    readonly universe: Universe;
    private readonly outputToken;
    private readonly actionQuote;
    gasEstimate(): bigint;
    encode(): Promise<ContractCall>;
    toString(): string;
    private readonly outputQty;
    quote(_: TokenQuantity[]): Promise<TokenQuantity[]>;
    private constructor();
    static createAction(universe: Universe, input: Token, output: Token, quote: OneInchSwapResponse, slippagePercent: number): OneInchAction;
}
//# sourceMappingURL=OneInch.d.ts.map