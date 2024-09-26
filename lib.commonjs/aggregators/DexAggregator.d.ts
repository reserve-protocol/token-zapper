import { Universe } from '..';
import { RouterAction } from '../action/RouterAction';
import { Token, TokenQuantity } from '../entities/Token';
import { type SwapSignature } from './SwapSignature';
export declare class DexRouter {
    readonly name: string;
    private readonly swap_;
    readonly dynamicInput: boolean;
    readonly supportedInputTokens: Set<Token>;
    readonly supportedOutputTokens: Set<Token>;
    private cache;
    constructor(name: string, swap_: SwapSignature, dynamicInput: boolean, supportedInputTokens?: Set<Token>, supportedOutputTokens?: Set<Token>);
    private maxConcurrency;
    private pending;
    withMaxConcurrency(concurrency: number): this;
    private currentBlock;
    onBlock(block: number, tolerance: number): void;
    readonly swap: SwapSignature;
    supportsSwap(inputTokenQty: TokenQuantity, output: Token): boolean;
    [Symbol.toStringTag]: string;
    toString(): string;
}
export declare class TradingVenue {
    readonly universe: Universe;
    readonly router: DexRouter;
    private readonly createTradeEdge_?;
    toString(): string;
    constructor(universe: Universe, router: DexRouter, createTradeEdge_?: ((src: Token, dst: Token) => Promise<RouterAction | null>) | undefined);
    get supportsDynamicInput(): boolean;
    get name(): string;
    get supportsEdges(): boolean;
    canCreateEdgeBetween(tokenA: Token, tokenB: Token): boolean;
    createTradeEdge(src: Token, dst: Token): Promise<RouterAction | null>;
}
