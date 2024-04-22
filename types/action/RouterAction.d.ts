import { type Universe } from '../Universe';
import { DexRouter } from '../aggregators/DexAggregator';
import { type Address } from '../base/Address';
import { type TokenQuantity, Token } from '../entities/Token';
import { Planner, Value } from '../tx-gen/Planner';
import { Action } from './Action';
export declare class RouterAction extends Action {
    readonly dex: DexRouter;
    readonly universe: Universe;
    readonly router: Address;
    plan(planner: Planner, inputs: Value[], destination: Address, predicted: TokenQuantity[]): Promise<Value[]>;
    gasEstimate(): bigint;
    innerQuote(input: TokenQuantity[]): Promise<import("../searcher/Swap").SwapPath>;
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(dex: DexRouter, universe: Universe, router: Address, inputToken: Token, outputToken: Token);
    toString(): string;
}
//# sourceMappingURL=RouterAction.d.ts.map