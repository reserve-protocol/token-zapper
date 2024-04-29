import { DestinationOptions, InteractionConvention } from './Action';
import { Universe } from '../Universe';
import { Address } from '../base/Address';
import { Token, TokenQuantity } from '../entities/Token';
import { Approval } from '../base/Approval';
import { Planner, Value } from '../tx-gen/Planner';
declare class ConvexPool {
    readonly convexBooster: Address;
    readonly convexPoolId: bigint;
    readonly curveLPToken: Token;
    readonly convexDepositToken: Token;
    readonly stakedConvexDepositToken: Token;
    readonly rewardsAddress: Address;
    constructor(convexBooster: Address, convexPoolId: bigint, curveLPToken: Token, convexDepositToken: Token, stakedConvexDepositToken: Token, rewardsAddress: Address);
    toString(): string;
}
declare const ConvexDepositAndStake_base: abstract new (address: Address, inputToken: Token[], outputToken: Token[], interactionConvention: InteractionConvention, proceedsOptions: DestinationOptions, approvals: Approval[]) => {
    readonly protocol: string;
    readonly gen: typeof import("../tx-gen/Planner");
    readonly genUtils: {
        planForwardERC20(universe: Universe<import("..").Config>, planner: Planner, token: Token, amount: Value, destination: Address): void;
        erc20: {
            transfer(universe: Universe<import("..").Config>, planner: Planner, amount: Value, token: Token, destination: Address): void;
            balanceOf(universe: Universe<import("..").Config>, planner: Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): Value;
        };
    };
    readonly address: Address;
    readonly inputToken: Token[];
    readonly outputToken: Token[];
    readonly interactionConvention: InteractionConvention;
    readonly proceedsOptions: DestinationOptions;
    readonly approvals: Approval[];
    quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    quoteWithSlippage(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    gasEstimate(): bigint;
    exchange(amountsIn: TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
    generateOutputTokenBalance(universe: Universe<import("..").Config>, planner: Planner, comment?: string | undefined): Value;
    plan(planner: Planner, inputs: Value[], destination: Address, predictedInputs: TokenQuantity[], outputNotUsed?: boolean | undefined): Promise<Value[]>;
    toString(): string;
    readonly addToGraph: boolean;
    readonly outputSlippage: bigint;
};
export declare class ConvexDepositAndStake extends ConvexDepositAndStake_base {
    readonly universe: Universe;
    readonly convexPool: ConvexPool;
    plan(planner: Planner, inputs: Value[], destination: Address): Promise<Value[]>;
    toString(): string;
    quote([amountIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    gasEstimate(): bigint;
    constructor(universe: Universe, convexPool: ConvexPool);
}
declare const ConvexUnstakeAndWithdraw_base: abstract new (address: Address, inputToken: Token[], outputToken: Token[], interactionConvention: InteractionConvention, proceedsOptions: DestinationOptions, approvals: Approval[]) => {
    readonly protocol: string;
    readonly gen: typeof import("../tx-gen/Planner");
    readonly genUtils: {
        planForwardERC20(universe: Universe<import("..").Config>, planner: Planner, token: Token, amount: Value, destination: Address): void;
        erc20: {
            transfer(universe: Universe<import("..").Config>, planner: Planner, amount: Value, token: Token, destination: Address): void;
            balanceOf(universe: Universe<import("..").Config>, planner: Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): Value;
        };
    };
    readonly address: Address;
    readonly inputToken: Token[];
    readonly outputToken: Token[];
    readonly interactionConvention: InteractionConvention;
    readonly proceedsOptions: DestinationOptions;
    readonly approvals: Approval[];
    quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    quoteWithSlippage(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    gasEstimate(): bigint;
    exchange(amountsIn: TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
    generateOutputTokenBalance(universe: Universe<import("..").Config>, planner: Planner, comment?: string | undefined): Value;
    plan(planner: Planner, inputs: Value[], destination: Address, predictedInputs: TokenQuantity[], outputNotUsed?: boolean | undefined): Promise<Value[]>;
    toString(): string;
    readonly addToGraph: boolean;
    readonly outputSlippage: bigint;
};
export declare class ConvexUnstakeAndWithdraw extends ConvexUnstakeAndWithdraw_base {
    readonly universe: Universe;
    readonly convexPool: ConvexPool;
    plan(planner: Planner, inputs: Value[], destination: Address): Promise<Value[]>;
    toString(): string;
    quote([amountIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    gasEstimate(): bigint;
    constructor(universe: Universe, convexPool: ConvexPool);
}
/**
 * Sets up all the edges associated with a convex pool.
 * This also sets up the minting of the convex deposit token, despite this token not being that useful.
 * @param universe
 * @param stakedConvexToken The staked convex lp token
 */
export declare const setupConvexEdges: (universe: Universe, stakedConvexToken: Token, convex: Address) => Promise<{
    pool: ConvexPool;
    depositAndStakeAction: ConvexDepositAndStake;
    unstakeAndWithdrawAction: ConvexUnstakeAndWithdraw;
}>;
export {};
//# sourceMappingURL=Convex.d.ts.map