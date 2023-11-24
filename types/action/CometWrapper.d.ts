import { type Universe } from '../Universe';
import { type Address } from '../base/Address';
import { ContractCall } from '../base/ContractCall';
import { type Token, type TokenQuantity } from '../entities/Token';
import { Action } from './Action';
export declare class MintCometWrapperAction extends Action {
    readonly universe: Universe;
    readonly baseToken: Token;
    readonly receiptToken: Token;
    readonly getRate: () => Promise<bigint>;
    gasEstimate(): bigint;
    encode([amountsIn]: TokenQuantity[], dest: Address): Promise<ContractCall>;
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
    gasEstimate(): bigint;
    encode([amountsIn]: TokenQuantity[], dest: Address): Promise<ContractCall>;
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, baseToken: Token, receiptToken: Token, getRate: () => Promise<bigint>);
    toString(): string;
    get outputSlippage(): bigint;
}
//# sourceMappingURL=CometWrapper.d.ts.map