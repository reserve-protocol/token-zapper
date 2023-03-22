"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterningCache = void 0;
class InterningCache {
    idFn;
    entities = new Map();
    constructor(idFn) {
        this.idFn = idFn;
    }
    lastCollect = 0;
    collect() {
        if (Date.now() - this.lastCollect < 10000) {
            return;
        }
        this.lastCollect = Date.now();
        for (const key of [...this.entities.keys()]) {
            const entity = this.entities.get(key);
            if (entity == null || entity.deref() == null) {
                this.entities.delete(key);
            }
        }
    }
    get(inst) {
        const addr = this.idFn(inst);
        if (this.entities.has(addr)) {
            const previous = this.entities.get(addr)?.deref();
            if (previous != null) {
                return previous;
            }
        }
        if (this.entities.size > 2000) {
            this.collect();
        }
        this.entities.set(addr, new WeakRef(inst));
        return inst;
    }
    toString() {
        return `InterningCache({${[...this.entities.entries()]
            .map(([addr, address]) => {
            const addrInst = address.deref();
            return `[${addr} => ${addrInst}]`;
        })
            .join(', ')}})`;
    }
    [Symbol.toStringTag] = 'InterningCache';
}
exports.InterningCache = InterningCache;
//# sourceMappingURL=InterningCache.js.map