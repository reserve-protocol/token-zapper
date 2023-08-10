import { type DestinationOptions, type InteractionConvention, type Action } from '../action/Action';
import { type Address } from '../base/Address';
import { TokenAmounts, type TokenQuantity } from '../entities/Token';
import { type Universe } from '../Universe';
/**
 * A single Step token exchange
 */
export declare class SingleSwap {
    readonly inputs: TokenQuantity[];
    readonly action: Action;
    readonly outputs: TokenQuantity[];
    readonly type = "SingleSwap";
    constructor(inputs: TokenQuantity[], action: Action, outputs: TokenQuantity[]);
    get proceedsOptions(): DestinationOptions;
    get interactionConvention(): InteractionConvention;
    get address(): Address;
    exchange(tokenAmounts: TokenAmounts): Promise<void>;
    describe(): string[];
}
/**
 * A SwapPath groups a set of SingleSwap's together. The output of one SingleSwap is the input of the next.
 * A SwapPath may be optimized, as long as the input's and output's remain the same.
 */
export declare class SwapPath {
    readonly inputs: TokenQuantity[];
    readonly steps: (SwapPath | SingleSwap)[];
    readonly outputs: TokenQuantity[];
    readonly outputValue: TokenQuantity;
    readonly destination: Address;
    readonly type = "MultipleSwaps";
    get proceedsOptions(): DestinationOptions;
    get interactionConvention(): InteractionConvention;
    get address(): Address;
    constructor(inputs: TokenQuantity[], steps: (SwapPath | SingleSwap)[], outputs: TokenQuantity[], outputValue: TokenQuantity, destination: Address);
    exchange(tokenAmounts: TokenAmounts): Promise<void>;
    compare(other: SwapPath): number;
    toString(): string;
    describe(): string[];
}
/**
 * SwapPaths groups SwapPath's together into sections
 * The swapPaths can be reordered, as long as the following holds for the ith SwapPath:
 * (sum(swapPaths[0..i-1].outputs) - sum(swapPaths[0..i-1].inputs)) >= swapPaths[i].inputs
 *
 * Basically, if you sum up all the inputs and output for all previous steps
 * You are holding enough tokens to do the current step.
 */
export declare class SwapPaths {
    readonly universe: Universe;
    readonly inputs: TokenQuantity[];
    readonly swapPaths: SwapPath[];
    readonly outputs: TokenQuantity[];
    readonly outputValue: TokenQuantity;
    readonly destination: Address;
    constructor(universe: Universe, inputs: TokenQuantity[], swapPaths: SwapPath[], outputs: TokenQuantity[], outputValue: TokenQuantity, destination: Address);
    exchange(tokenAmounts: TokenAmounts): Promise<void>;
    toString(): string;
    describe(): string[];
}
/**
 * A list steps to go from token set A to token set B.
 * A SwapPlan contains a linear set of actions to go from some input basket
 * to some output basket. But does not yet has any concrete values attached to it.
 *
 * Using the quote method with an input basket, a SwapPath can be generated.
 * The SwapPath is the concrete SwapPlan that contains the sub-actions inputs and outputs,
 * and can be used to generate an actual transaction.
 * */
export declare class SwapPlan {
    readonly universe: Universe;
    readonly steps: Action[];
    constructor(universe: Universe, steps: Action[]);
    get inputs(): readonly import("../entities/Token").Token[];
    quote(input: TokenQuantity[], destination: Address): Promise<SwapPath>;
    toString(): string;
}
//# sourceMappingURL=Swap.d.ts.map