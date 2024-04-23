import { type Token, type TokenQuantity } from '../entities/Token';
import { type Universe } from '../Universe';
import { Action } from './Action';
import * as gen from '../tx-gen/Planner';
import { Address } from '..';
export declare class DepositAction extends Action {
    readonly universe: Universe;
    readonly wrappedToken: Token;
    gasEstimate(): bigint;
    plan(planner: gen.Planner, inputs: gen.Value[], destination: Address): Promise<gen.Value[]>;
    quote([qty]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, wrappedToken: Token);
    toString(): string;
}
export declare class WithdrawAction extends Action {
    readonly universe: Universe;
    readonly wrappedToken: Token;
    gasEstimate(): bigint;
    plan(planner: gen.Planner, inputs: gen.Value[], destination: Address): Promise<gen.Value[]>;
    quote([qty]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, wrappedToken: Token);
    toString(): string;
}
