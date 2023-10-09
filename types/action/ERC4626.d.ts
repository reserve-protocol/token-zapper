import { type Token, type TokenQuantity } from '../entities/Token';
import { type Universe } from '../Universe';
import { Action } from './Action';
import { ContractCall } from '../base/ContractCall';
import { Address } from '../base/Address';
export declare class ERC4626TokenVault {
    readonly shareToken: Token;
    readonly underlying: Token;
    constructor(shareToken: Token, underlying: Token);
    get address(): Address;
}
export declare class ERC4626DepositAction extends Action {
    readonly universe: Universe;
    readonly underlying: Token;
    readonly shareToken: Token;
    gasEstimate(): bigint;
    encode([amountsIn]: TokenQuantity[], destination: Address): Promise<ContractCall>;
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, underlying: Token, shareToken: Token);
    toString(): string;
}
export declare class ERC4626WithdrawAction extends Action {
    readonly universe: Universe;
    readonly underlying: Token;
    readonly shareToken: Token;
    gasEstimate(): bigint;
    encode([amountsIn]: TokenQuantity[], destination: Address): Promise<ContractCall>;
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, underlying: Token, shareToken: Token);
    toString(): string;
}
//# sourceMappingURL=ERC4626.d.ts.map