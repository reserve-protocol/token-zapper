"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TradingVenue = exports.DexRouter = void 0;
class DexRouter {
    name;
    swap_;
    dynamicInput;
    supportedInputTokens;
    supportedOutputTokens;
    cache = new Map();
    constructor(name, swap_, dynamicInput, supportedInputTokens = new Set(), supportedOutputTokens = new Set()) {
        this.name = name;
        this.swap_ = swap_;
        this.dynamicInput = dynamicInput;
        this.supportedInputTokens = supportedInputTokens;
        this.supportedOutputTokens = supportedOutputTokens;
    }
    maxConcurrency = Infinity;
    pending = 0;
    withMaxConcurrency(concurrency) {
        this.maxConcurrency = concurrency;
        return this;
    }
    currentBlock = 0;
    onBlock(block, tolerance) {
        this.currentBlock = block;
        for (const [key, data] of [...this.cache.entries()]) {
            if (data.timestamp + tolerance < this.currentBlock) {
                this.cache.delete(key);
            }
        }
    }
    swap = (abort, input, output, slippage) => {
        const key = `${input.amount}.${input.token.address.address}.${output.address.address}.${slippage}`;
        const prev = this.cache.get(key);
        if (prev != null) {
            return prev.path;
        }
        if (this.pending > this.maxConcurrency) {
            throw new Error('Too many concurrent swaps');
        }
        this.pending++;
        const out = this.swap_(abort, input, output, slippage);
        this.cache.set(key, {
            path: out,
            timestamp: this.currentBlock,
        });
        out.catch(() => {
            if (this.cache.get(key)?.path === out) {
                this.cache.delete(key);
            }
        });
        return out.finally(() => {
            this.pending--;
        });
    };
    supportsSwap(inputTokenQty, output) {
        if (this.supportedInputTokens.size === 0 && this.supportedOutputTokens.size === 0) {
            return true;
        }
        if (this.supportedInputTokens.size !== 0 &&
            !this.supportedInputTokens.has(inputTokenQty.token)) {
            return false;
        }
        if (this.supportedOutputTokens.size !== 0 &&
            !this.supportedOutputTokens.has(output)) {
            return false;
        }
        return true;
    }
    [Symbol.toStringTag] = 'Router';
    toString() {
        return `Router(${this.name})`;
    }
}
exports.DexRouter = DexRouter;
class TradingVenue {
    universe;
    router;
    createTradeEdge_;
    toString() {
        return `Venue(${this.router.name})`;
    }
    constructor(universe, router, createTradeEdge_) {
        this.universe = universe;
        this.router = router;
        this.createTradeEdge_ = createTradeEdge_;
    }
    get supportsDynamicInput() {
        return this.router.dynamicInput;
    }
    get name() {
        return this.router.name;
    }
    get supportsEdges() {
        return this.createTradeEdge_ != null;
    }
    canCreateEdgeBetween(tokenA, tokenB) {
        if (this.router.supportedInputTokens.size !== 0) {
            if (!this.router.supportedInputTokens.has(tokenA)) {
                return false;
            }
        }
        if (this.router.supportedOutputTokens.size !== 0) {
            if (!this.router.supportedOutputTokens.has(tokenB)) {
                return false;
            }
        }
        return true;
    }
    async createTradeEdge(src, dst) {
        if (this.createTradeEdge_ == null) {
            throw new Error(`${this.router.name} does not support creating permanent edges`);
        }
        return await this.createTradeEdge_(src, dst);
    }
}
exports.TradingVenue = TradingVenue;
//# sourceMappingURL=DexAggregator.js.map