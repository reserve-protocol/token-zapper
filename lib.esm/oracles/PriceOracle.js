import { Cached } from '../base/Cached';
export class PriceOracle extends Cached {
    name;
    supportedTokens;
    constructor(ltvBlocks, name, fetchPrice, getCurrentBlock, supportedTokens = new Set()) {
        super(async (k) => {
            if (!this.supports(k)) {
                throw new Error(`Unsupported token ${k}`);
            }
            const v = await fetchPrice(k);
            if (v == null) {
                throw new Error('Price not found');
            }
            return v;
        }, ltvBlocks, getCurrentBlock);
        this.name = name;
        this.supportedTokens = supportedTokens;
    }
    static createSingleTokenOracle(universe, token, fetchPrice) {
        return new PriceOracle(universe.config.requoteTolerance, `PriceProvider(${token})`, async (_) => fetchPrice(), () => universe.currentBlock, new Set([token]));
    }
    supports(token) {
        if (this.supportedTokens.size === 0) {
            return true;
        }
        return this.supportedTokens.has(token);
    }
    async quote(token) {
        return this.get(token);
    }
}
//# sourceMappingURL=PriceOracle.js.map