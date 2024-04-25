import { type SwapSignature } from './SwapSignature';
export declare class DexRouter {
    readonly name: string;
    private readonly swap_;
    readonly dynamicInput: boolean;
    private cache;
    constructor(name: string, swap_: SwapSignature, dynamicInput?: boolean);
    readonly swap: SwapSignature;
    [Symbol.toStringTag]: string;
    toString(): string;
}
//# sourceMappingURL=DexAggregator.d.ts.map