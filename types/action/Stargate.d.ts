import { type Token, type TokenQuantity } from '../entities/Token';
import { type Universe } from '../Universe';
import { Action } from './Action';
import { Address } from '../base/Address';
import { Planner, Value } from '../tx-gen/Planner';
export declare class StargateDepositAction extends Action {
    readonly universe: Universe;
    readonly underlying: Token;
    readonly stargateToken: Token;
    readonly poolId: number;
    readonly router: Address;
    plan(planner: Planner, inputs: Value[], destination: Address): Promise<Value[]>;
    gasEstimate(): bigint;
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, underlying: Token, stargateToken: Token, poolId: number, router: Address);
    toString(): string;
}
export declare class StargateWithdrawAction extends Action {
    readonly universe: Universe;
    readonly underlying: Token;
    readonly stargateToken: Token;
    readonly poolId: number;
    readonly router: Address;
    plan(planner: Planner, inputs: Value[], destination: Address): Promise<import("../tx-gen/Planner").ReturnValue[]>;
    gasEstimate(): bigint;
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, underlying: Token, stargateToken: Token, poolId: number, router: Address);
    toString(): string;
}
//# sourceMappingURL=Stargate.d.ts.map