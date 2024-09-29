export declare class BlockCache<Input, Result extends NonNullable<any>, Key = Input> {
    private readonly fetch;
    private readonly blocksToLive;
    private currentBlock;
    private keyFn;
    constructor(fetch: (key: Input) => Promise<Result>, blocksToLive: number, currentBlock: number, keyFn?: (key: Input) => Key);
    private cache;
    get(key: Input): Promise<Result>;
    onBlock(block: number): void;
}
