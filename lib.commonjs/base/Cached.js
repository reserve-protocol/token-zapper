"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cached = void 0;
class Cached {
    fetch;
    ttl;
    currentTime;
    constructor(fetch, ttl, currentTime) {
        this.fetch = fetch;
        this.ttl = ttl;
        this.currentTime = currentTime;
    }
    cache = new Map();
    async cacheEntries() {
        const out = new Map();
        for (const [key, { result, time }] of this.cache) {
            try {
                out.set(key, await result);
            }
            catch (e) { }
        }
        return out;
    }
    invalidateCache(key) {
        const cached = this.cache.get(key);
        if (cached != null && this.currentTime() - cached.time > this.ttl) {
            this.cache.delete(key);
        }
    }
    loadResource(key) {
        const task = this.fetch(key);
        const value = {
            result: task.then((result) => {
                if (result == null) {
                    throw new Error('Resource not found');
                }
                return result;
            }),
            time: this.currentTime(),
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
        this.invalidateCache(key);
        return await (this.cache.get(key) ?? this.loadResource(key)).result;
    }
    cleanup() {
        const now = this.currentTime();
        for (const [key, { time }] of this.cache) {
            if (now - time > this.ttl) {
                this.cache.delete(key);
            }
        }
    }
}
exports.Cached = Cached;
//# sourceMappingURL=Cached.js.map