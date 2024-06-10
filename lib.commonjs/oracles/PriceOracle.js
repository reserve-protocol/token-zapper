"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceOracle = void 0;
const Cached_1 = require("../base/Cached");
class PriceOracle extends Cached_1.Cached {
    name;
    supportedTokens;
    constructor(ltvBlocks, name, fetchPrice, getCurrentBlock, supportedTokens = new Set()) {
        super((k) => fetchPrice(k).then((v) => {
            if (v == null) {
                throw new Error('Price not found');
            }
            return v;
        }), ltvBlocks, getCurrentBlock);
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
exports.PriceOracle = PriceOracle;
//# sourceMappingURL=PriceOracle.js.map