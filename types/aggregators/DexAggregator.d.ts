import { Token, TokenQuantity } from '../entities/Token';
import { SwapPath } from '../searcher/Swap';
import { type SwapSignature } from './SwapSignature';
export declare class DexRouter {
    readonly name: string;
    private readonly swap_;
    readonly dynamicInput: boolean;
    readonly supportedInputTokens: Set<Token>;
    readonly supportedOutputTokens: Set<Token>;
    private cache;
    private cache2;
    constructor(name: string, swap_: SwapSignature, dynamicInput: boolean, supportedInputTokens?: Set<Token>, supportedOutputTokens?: Set<Token>);
    private currentBlock;
    onBlock(block: number): void;
    getPrevious(input: TokenQuantity, output: Token, slippage: bigint): SwapPath | undefined;
    readonly swap: SwapSignature;
    supportsSwap(inputTokenQty: TokenQuantity, output: Token): boolean;
    [Symbol.toStringTag]: string;
    toString(): string;
}
//# sourceMappingURL=DexAggregator.d.ts.map