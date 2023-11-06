import { type Token, type TokenQuantity } from '../entities/Token';
import { type Universe } from '../Universe';
import { Action } from './Action';
import { ContractCall } from '../base/ContractCall';
import { Address } from '../base/Address';
export declare class StargateDepositAction extends Action {
    readonly universe: Universe;
    readonly underlying: Token;
    readonly stargateToken: Token;
    readonly poolId: number;
    readonly router: Address;
    gasEstimate(): bigint;
    encode([amountsIn]: TokenQuantity[], destination: Address): Promise<ContractCall>;
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
    gasEstimate(): bigint;
    encode([amountsIn]: TokenQuantity[], destination: Address): Promise<ContractCall>;
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, underlying: Token, stargateToken: Token, poolId: number, router: Address);
    toString(): string;
}
//# sourceMappingURL=Stargate.d.ts.map