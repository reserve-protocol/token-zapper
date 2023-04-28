import { type Address } from '../base/Address';
import { type SwapPath } from '../searcher/Swap';
import { type Token, type TokenQuantity } from '../entities/Token';
export declare class DexAggregator {
    readonly name: string;
    readonly swap: (payerAddress: Address, recipientDestination: Address, input: TokenQuantity, output: Token, slippage: number) => Promise<SwapPath>;
    constructor(name: string, swap: (payerAddress: Address, recipientDestination: Address, input: TokenQuantity, output: Token, slippage: number) => Promise<SwapPath>);
    [Symbol.toStringTag]: string;
    toString(): string;
}
