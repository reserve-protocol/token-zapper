import { type Token, type TokenQuantity } from '../entities/Token';
import { type Universe } from '../Universe';
import { Action } from './Action';
import { ContractCall } from '../base/ContractCall';
import { type OneInchSwapResponse } from '../aggregators/oneInch/oneInchRegistry';
export declare class OneInchAction extends Action {
    readonly universe: Universe;
    private readonly actionQuote;
    encode(): Promise<ContractCall>;
    toString(): string;
    quote(_: TokenQuantity[]): Promise<TokenQuantity[]>;
    private constructor();
    static createAction(universe: Universe, input: Token, output: Token, quote: OneInchSwapResponse): OneInchAction;
}
//# sourceMappingURL=OneInch.d.ts.map