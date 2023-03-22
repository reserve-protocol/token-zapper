export declare class InterningCache<T extends object> {
    private readonly idFn;
    private readonly entities;
    constructor(idFn: (t: T) => string);
    private lastCollect;
    collect(): void;
    get(inst: T): T;
    toString(): string;
    readonly [Symbol.toStringTag] = "InterningCache";
}
