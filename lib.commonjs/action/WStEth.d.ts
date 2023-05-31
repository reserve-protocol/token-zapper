import { type Token, type TokenQuantity } from '../entities/Token';
import { type Universe } from '../Universe';
import { Action } from './Action';
import { ContractCall } from '../base/ContractCall';
export declare class WStETHRateProvider {
    readonly universe: Universe;
    readonly steth: Token;
    readonly wsteth: Token;
    private wstethInstance;
    constructor(universe: Universe, steth: Token, wsteth: Token);
    quoteMint(amountsIn: TokenQuantity): Promise<TokenQuantity>;
    quoteBurn(amountsIn: TokenQuantity): Promise<TokenQuantity>;
}
export declare class MintWStETH extends Action {
    readonly universe: Universe;
    readonly steth: Token;
    readonly wsteth: Token;
    readonly rateProvider: Pick<WStETHRateProvider, "quoteMint">;
    gasEstimate(): bigint;
    encode([amountsIn]: TokenQuantity[]): Promise<ContractCall>;
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, steth: Token, wsteth: Token, rateProvider: Pick<WStETHRateProvider, "quoteMint">);
    toString(): string;
}
export declare class BurnWStETH extends Action {
    readonly universe: Universe;
    readonly steth: Token;
    readonly wsteth: Token;
    readonly rateProvider: Pick<WStETHRateProvider, "quoteBurn">;
    gasEstimate(): bigint;
    encode([amountsIn]: TokenQuantity[]): Promise<ContractCall>;
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, steth: Token, wsteth: Token, rateProvider: Pick<WStETHRateProvider, "quoteBurn">);
    toString(): string;
}
