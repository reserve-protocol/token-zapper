import { type Universe } from '../Universe';
import { ContractCall } from '../base/ContractCall';
import { type Token, type TokenQuantity } from '../entities/Token';
import * as gen from '../tx-gen/Planner';
import { Action } from './Action';
export declare class WStETHRateProvider {
    readonly universe: Universe;
    readonly steth: Token;
    readonly wsteth: Token;
    get outputSlippage(): bigint;
    private wstethInstance;
    constructor(universe: Universe, steth: Token, wsteth: Token);
    quoteMint(amountsIn: TokenQuantity): Promise<TokenQuantity>;
    quoteBurn(amountsIn: TokenQuantity): Promise<TokenQuantity>;
}
export declare class MintWStETH extends Action {
    readonly universe: Universe;
    readonly steth: Token;
    readonly wsteth: Token;
    readonly rateProvider: Pick<WStETHRateProvider, 'quoteMint'>;
    get outputSlippage(): bigint;
    gasEstimate(): bigint;
    encode([amountsIn]: TokenQuantity[]): Promise<ContractCall>;
    plan(planner: gen.Planner, inputs: gen.Value[]): Promise<gen.ReturnValue[]>;
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, steth: Token, wsteth: Token, rateProvider: Pick<WStETHRateProvider, 'quoteMint'>);
    toString(): string;
}
export declare class BurnWStETH extends Action {
    readonly universe: Universe;
    readonly steth: Token;
    readonly wsteth: Token;
    readonly rateProvider: Pick<WStETHRateProvider, 'quoteBurn'>;
    get outputSlippage(): bigint;
    gasEstimate(): bigint;
    encode([amountsIn]: TokenQuantity[]): Promise<ContractCall>;
    plan(planner: gen.Planner, inputs: gen.Value[]): Promise<gen.ReturnValue[]>;
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, steth: Token, wsteth: Token, rateProvider: Pick<WStETHRateProvider, 'quoteBurn'>);
    toString(): string;
}
