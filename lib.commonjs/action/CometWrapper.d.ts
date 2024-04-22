import { type Universe } from '../Universe';
import { type Address } from '../base/Address';
import { type Token, type TokenQuantity } from '../entities/Token';
import { Planner, Value } from '../tx-gen/Planner';
import { Action } from './Action';
export declare class MintCometWrapperAction extends Action {
    readonly universe: Universe;
    readonly baseToken: Token;
    readonly receiptToken: Token;
    readonly getRate: () => Promise<bigint>;
    plan(planner: Planner, inputs: Value[], destination: Address, predicted: TokenQuantity[]): Promise<Value[]>;
    gasEstimate(): bigint;
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, baseToken: Token, receiptToken: Token, getRate: () => Promise<bigint>);
    toString(): string;
    get outputSlippage(): bigint;
}
export declare class BurnCometWrapperAction extends Action {
    readonly universe: Universe;
    readonly baseToken: Token;
    readonly receiptToken: Token;
    readonly getRate: () => Promise<bigint>;
    plan(planner: Planner, inputs: Value[], destination: Address, predicted: TokenQuantity[]): Promise<Value[]>;
    gasEstimate(): bigint;
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, baseToken: Token, receiptToken: Token, getRate: () => Promise<bigint>);
    toString(): string;
    get outputSlippage(): bigint;
}
