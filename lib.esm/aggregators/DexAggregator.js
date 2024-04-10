export class DexAggregator {
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
//# sourceMappingURL=DexAggregator.js.map