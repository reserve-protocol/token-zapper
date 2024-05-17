export declare class Cached<Key, Result extends NonNullable<any>> {
    private readonly fetch;
    private readonly ttl;
    private readonly currentTime;
    constructor(fetch: (key: Key) => Promise<Result>, ttl: number, currentTime: () => number);
    private cache;
    private invalidateCache;
    private loadResource;
    protected get(key: Key): Promise<Result>;
    protected cleanup(): void;
}
