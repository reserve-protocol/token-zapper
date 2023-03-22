export declare class DefaultMap<A, B> extends Map<A, B> {
    private readonly defaultFn;
    constructor(defaultFn: (k: A) => B);
    get(key: A): B;
}
