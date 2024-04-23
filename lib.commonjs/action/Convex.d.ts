import { Action } from './Action';
import { Universe } from '../Universe';
import { Address } from '../base/Address';
import { Token, TokenQuantity } from '../entities/Token';
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
export declare class ConvexDepositAndStake extends Action {
    readonly universe: Universe;
    readonly convexPool: ConvexPool;
    plan(planner: Planner, inputs: Value[], destination: Address): Promise<Value[]>;
    toString(): string;
    quote([amountIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    gasEstimate(): bigint;
    constructor(universe: Universe, convexPool: ConvexPool);
}
export declare class ConvexUnstakeAndWithdraw extends Action {
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
