import { type Token, type TokenQuantity } from '../entities/Token';
import { type Universe } from '../Universe';
import { Action } from './Action';
import { ContractCall } from '../base/ContractCall';
export declare class MintCTokenAction extends Action {
    readonly universe: Universe;
    readonly underlying: Token;
    readonly cToken: Token;
    private readonly rate;
    private readonly rateScale;
    encode([amountsIn]: TokenQuantity[]): Promise<ContractCall>;
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, underlying: Token, cToken: Token, rate: {
        value: bigint;
    });
    toString(): string;
}
export declare class BurnCTokenAction extends Action {
    readonly universe: Universe;
    readonly underlying: Token;
    readonly cToken: Token;
    private readonly rate;
    private readonly rateScale;
    encode([amountsIn]: TokenQuantity[]): Promise<ContractCall>;
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, underlying: Token, cToken: Token, rate: {
        value: bigint;
    });
    toString(): string;
}
