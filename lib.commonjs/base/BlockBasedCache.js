"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockCache = void 0;
class BlockCache {
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
    onBlock(block) {
        this.currentBlock = block;
        for (const [key, { time }] of [...this.cache.entries()]) {
            if (block - time > this.blocksToLive) {
                this.cache.delete(key);
            }
        }
    }
}
exports.BlockCache = BlockCache;
//# sourceMappingURL=BlockBasedCache.js.map