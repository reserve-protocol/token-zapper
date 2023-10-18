import { type Token, type TokenQuantity } from '../entities/Token';
import { type Universe } from '../Universe';
import { Action } from './Action';
import { ContractCall } from '../base/ContractCall';
import { Address } from '../base/Address';
export declare class StargateWrapperDepositAction extends Action {
    readonly universe: Universe;
    readonly underlying: Token;
    readonly stargateToken: Token;
    gasEstimate(): bigint;
    encode([amountsIn]: TokenQuantity[], destination: Address): Promise<ContractCall>;
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, underlying: Token, stargateToken: Token);
    toString(): string;
}
export declare class StargateWrapperWithdrawAction extends Action {
    readonly universe: Universe;
    readonly underlying: Token;
    readonly stargateToken: Token;
    gasEstimate(): bigint;
    encode([amountsIn]: TokenQuantity[], destination: Address): Promise<ContractCall>;
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, underlying: Token, stargateToken: Token);
    toString(): string;
}
//# sourceMappingURL=StargateWrapper.d.ts.map