const TIMEOUT = 350;
export class DexRouter {
    name;
    swap_;
    dynamicInput;
    cache = new Map();
    constructor(name, swap_, dynamicInput = false) {
        this.name = name;
        this.swap_ = swap_;
        this.dynamicInput = dynamicInput;
    }
    swap = async (src, dst, input, output, slippage) => {
        // const start = Date.now()
        const key = `${input.amount}.${input.token.address.address}.${output.address.address}`;
        if (this.cache.has(key)) {
            const previous = (await this.cache.get(key));
            const delta = Date.now() - previous.timestamp;
            if (delta > TIMEOUT) {
                this.cache.delete(key);
            }
            else {
                return previous.path;
            }
        }
        this.cache.set(key, this.swap_(src, dst, input, output, slippage)
            .then((path) => {
            // const duration = Date.now() - start
            // console.log(
            //   `${this.name} ${input} -> ${path.outputs.join(
            //     ', '
            //   )}: (${duration}ms)`
            // )
            return {
                path,
                timestamp: Date.now(),
            };
        })
            .catch((e) => {
            this.cache.delete(key);
            throw e;
        }));
        return this.cache.get(key).then((i) => i.path);
    };
    [Symbol.toStringTag] = 'DexAggregator';
    toString() {
        return `DexAggregator(name=${this.name})`;
    }
}
//# sourceMappingURL=DexAggregator.js.map