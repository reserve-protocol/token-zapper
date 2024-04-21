import { type Token, type TokenQuantity } from '../entities/Token';
import { type Universe } from '../Universe';
import { Action } from './Action';
import { ContractCall } from '../base/ContractCall';
import * as gen from '../tx-gen/Planner';
import { Address } from '..';
export declare class DepositAction extends Action {
    readonly universe: Universe;
    readonly wrappedToken: Token;
    gasEstimate(): bigint;
    encode([amountsIn]: TokenQuantity[]): Promise<ContractCall>;
    plan(planner: gen.Planner, inputs: gen.Value[], destination: Address): Promise<gen.Value[]>;
    quote([qty]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, wrappedToken: Token);
    toString(): string;
}
export declare class WithdrawAction extends Action {
    readonly universe: Universe;
    readonly wrappedToken: Token;
    gasEstimate(): bigint;
    encode([amountsIn]: TokenQuantity[]): Promise<ContractCall>;
    plan(planner: gen.Planner, inputs: gen.Value[], destination: Address): Promise<gen.Value[]>;
    quote([qty]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, wrappedToken: Token);
    toString(): string;
}
//# sourceMappingURL=WrappedNative.d.ts.map