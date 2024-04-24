import { type Universe } from '../Universe';
import { Address } from '../base/Address';
import { type Token, type TokenQuantity } from '../entities/Token';
import { Action } from './Action';
import { Planner, Value } from '../tx-gen/Planner';
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
    get outputSlippage(): bigint;
    plan(planner: Planner, inputs: Value[], destination: Address): Promise<Value[]>;
    gasEstimate(): bigint;
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, underlying: Token, shareToken: Token);
    toString(): string;
}
export declare class ERC4626WithdrawAction extends Action {
    readonly universe: Universe;
    readonly underlying: Token;
    readonly shareToken: Token;
    plan(planner: Planner, inputs: Value[], destination: Address): Promise<Value[]>;
    gasEstimate(): bigint;
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, underlying: Token, shareToken: Token);
    toString(): string;
    get outputSliptepage(): bigint;
}
