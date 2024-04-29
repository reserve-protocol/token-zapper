"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DexRouter = void 0;
class DexRouter {
    name;
    swap_;
    dynamicInput;
    cache = new Map();
    constructor(name, swap_, dynamicInput = false) {
        this.name = name;
        this.swap_ = swap_;
        this.dynamicInput = dynamicInput;
        setInterval(() => {
            this.cache.clear();
        }, 500);
    }
    swap = async (src, dst, input, output, slippage) => {
        // const start = Date.now()
        const key = `${input.amount}.${input.token.address.address}.${output.address.address}`;
        if (this.cache.has(key)) {
            const previous = (await this.cache.get(key));
            return previous.path;
        }
        const out = this.swap_(src, dst, input, output, slippage)
            .then((path) => {
            return {
                path,
                timestamp: Date.now(),
            };
        })
            .catch((e) => {
            this.cache.delete(key);
            throw e;
        });
        this.cache.set(key, out);
        return (await out).path;
    };
    [Symbol.toStringTag] = 'DexAggregator';
    toString() {
        return `DexAggregator(name=${this.name})`;
    }
}
exports.DexRouter = DexRouter;
//# sourceMappingURL=DexAggregator.js.map