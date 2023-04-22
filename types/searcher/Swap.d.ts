import { type Action } from '../action/Action';
import { type Address } from '../base/Address';
import { TokenAmounts, type TokenQuantity } from '../entities/Token';
import { type Universe } from '../Universe';
/**
 * A single Step token exchange
 */
export declare class SingleSwap {
    readonly input: TokenQuantity[];
    readonly action: Action;
    readonly output: TokenQuantity[];
    constructor(input: TokenQuantity[], action: Action, output: TokenQuantity[]);
    exchange(tokenAmounts: TokenAmounts): Promise<void>;
    toString(): string;
}
/**
 * A SwapPath groups a set of actions together
 */
export declare class SwapPath {
    readonly universe: Universe;
    readonly inputs: TokenQuantity[];
    readonly steps: SingleSwap[];
    readonly outputs: TokenQuantity[];
    readonly outputValue: TokenQuantity;
    readonly destination: Address;
    constructor(universe: Universe, inputs: TokenQuantity[], steps: SingleSwap[], outputs: TokenQuantity[], outputValue: TokenQuantity, destination: Address);
    exchange(tokenAmounts: TokenAmounts): Promise<void>;
    compare(other: SwapPath): number;
    toString(): string;
    describe(): string[];
}
/**
 * SwapPaths groups SwapPath's together into sections
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
/** Abstract set of steps to go from A to B */
export declare class SwapPlan {
    readonly universe: Universe;
    readonly steps: Action[];
    constructor(universe: Universe, steps: Action[]);
    get inputs(): readonly import("../entities/Token").Token[];
    quote(input: TokenQuantity[], destination: Address): Promise<SwapPath>;
    toString(): string;
}
//# sourceMappingURL=Swap.d.ts.map