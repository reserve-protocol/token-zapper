export class DexRouter {
    name;
    swap_;
    dynamicInput;
    supportedInputTokens;
    supportedOutputTokens;
    cache = new Map();
    cache2 = new Map();
    constructor(name, swap_, dynamicInput, supportedInputTokens = new Set(), supportedOutputTokens = new Set()) {
        this.name = name;
        this.swap_ = swap_;
        this.dynamicInput = dynamicInput;
        this.supportedInputTokens = supportedInputTokens;
        this.supportedOutputTokens = supportedOutputTokens;
    }
    currentBlock = 0;
    onBlock(block) {
        this.currentBlock = block;
        for (const [key, data] of [...this.cache.entries()]) {
            if (data.timestamp !== this.currentBlock) {
                this.cache.delete(key);
                this.cache2.delete(key);
            }
        }
    }
    getPrevious(input, output, slippage) {
        const key = `${input.amount}.${input.token.address.address}.${output.address.address}.${slippage}`;
        return this.cache2.get(key);
    }
    swap = async (abort, src, dst, input, output, slippage) => {
        const key = `${input.amount}.${input.token.address.address}.${output.address.address}.${slippage}`;
        const prev = this.cache.get(key);
        if (prev != null) {
            return prev.path;
        }
        const out = this.swap_(abort, src, dst, input, output, slippage)
            .then((path) => {
            this.cache2.set(key, path);
            return path;
        })
            .catch((e) => {
            this.cache.delete(key);
            throw e;
        });
        this.cache.set(key, {
            path: out,
            timestamp: this.currentBlock,
        });
        return await out;
    };
    supportsSwap(inputTokenQty, output) {
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
    [Symbol.toStringTag] = 'DexAggregator';
    toString() {
        return `DexAggregator(name=${this.name})`;
    }
}
//# sourceMappingURL=DexAggregator.js.map