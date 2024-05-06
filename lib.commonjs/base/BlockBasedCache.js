"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockCache = void 0;
class BlockCache {
    fetch;
    blocksToLive;
    currentBlock;
    constructor(fetch, blocksToLive, currentBlock) {
        this.fetch = fetch;
        this.blocksToLive = blocksToLive;
        this.currentBlock = currentBlock;
    }
    cache = new Map();
    loadResource(key) {
        const task = this.fetch(key);
        const value = {
            result: task.then((result) => {
                if (result == null) {
                    throw new Error('Resource not found');
                }
                return result;
            }),
            time: this.currentBlock,
        };
        this.cache.set(key, value);
        task.catch(() => {
            if (value === this.cache.get(key)) {
                this.cache.delete(key);
            }
        });
        return value;
    }
    async get(key) {
        return await (this.cache.get(key) ?? this.loadResource(key)).result;
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