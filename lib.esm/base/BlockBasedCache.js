export class BlockCache {
    fetch;
    blocksToLive;
    currentBlock;
    keyFn;
    constructor(fetch, blocksToLive, currentBlock, keyFn = x => x) {
        this.fetch = fetch;
        this.blocksToLive = blocksToLive;
        this.currentBlock = currentBlock;
        this.keyFn = keyFn;
    }
    cache = new Map();
    get(key) {
        const k = this.keyFn(key);
        let out = this.cache.get(k);
        if (out == null) {
            const res = this.fetch(key);
            out = { result: res, time: this.currentBlock };
            this.cache.set(k, out);
        }
        return out.result;
    }
    has(key) {
        const a = this.cache.get(this.keyFn(key));
        return a != null;
    }
    onBlock(block) {
        this.currentBlock = block;
        for (const [key, { time }] of [...this.cache.entries()]) {
            if (block - time > this.blocksToLive) {
                this.cache.delete(key);
            }
        }
    }
}
//# sourceMappingURL=BlockBasedCache.js.map