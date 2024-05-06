import { DefaultMap } from '../base/DefaultMap';
declare class Measurement {
    readonly name: string;
    private count;
    private total;
    private max;
    private min;
    private context;
    constructor(name: string, count?: number, total?: number, max?: number, min?: number);
    get average(): number;
    protected addPoint(time: number): void;
    begin(context?: string): () => void;
    get contextStats(): Measurement[];
    toString(): string;
}
export declare class PerformanceMonitor {
    stats: DefaultMap<string, Measurement>;
    measure<T>(name: string, fn: () => T, context?: string): T;
    begin(name: string, context?: string): () => void;
    measureAsync<T>(name: string, fn: () => Promise<T>, context?: string): Promise<T>;
    measurePromise<const T extends Promise<unknown>>(name: string, promise: T, context?: string): Promise<T>;
    wrapFunction<T extends (...args: any[]) => any>(name: string, fn: T, context?: string): T;
    wrapAsyncFunction<T extends (...args: any[]) => Promise<any>>(name: string, fn: T, context?: string): T;
    printStats(): string[];
}
export {};
//# sourceMappingURL=PerformanceMonitor.d.ts.map