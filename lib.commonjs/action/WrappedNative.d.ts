import { type Token, type TokenQuantity } from '../entities/Token';
import { type Universe } from '../Universe';
import { Action } from './Action';
import { ContractCall } from '../base/ContractCall';
export declare class DepositAction extends Action {
    readonly universe: Universe;
    readonly wrappedToken: Token;
    encode([amountsIn]: TokenQuantity[]): Promise<ContractCall>;
    quote(qty: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, wrappedToken: Token);
    toString(): string;
}
export declare class WithdrawAction extends Action {
    readonly universe: Universe;
    readonly wrappedToken: Token;
    encode([amountsIn]: TokenQuantity[]): Promise<ContractCall>;
    quote(qty: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, wrappedToken: Token);
    toString(): string;
}
