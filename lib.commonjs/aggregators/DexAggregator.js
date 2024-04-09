"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DexAggregator = void 0;
class DexAggregator {
    name;
    swap;
    constructor(name, swap) {
        this.name = name;
        this.swap = swap;
    }
    [Symbol.toStringTag] = 'DexAggregator';
    toString() {
        return `DexAggregator(name=${this.name})`;
    }
}
exports.DexAggregator = DexAggregator;
//# sourceMappingURL=DexAggregator.js.map