export declare class BlockCache<Key, Result extends NonNullable<any>> {
    private readonly fetch;
    private readonly blocksToLive;
    private currentBlock;
    constructor(fetch: (key: Key) => Promise<Result>, blocksToLive: number, currentBlock: number);
    private cache;
    private loadResource;
    get(key: Key): Promise<Result>;
    onBlock(block: number): void;
}
