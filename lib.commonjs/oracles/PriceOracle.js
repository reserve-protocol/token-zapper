"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceOracle = void 0;
const Cached_1 = require("../base/Cached");
class PriceOracle extends Cached_1.Cached {
    name;
    constructor(name, fetchPrice, getCurrentBlock) {
        super(k => fetchPrice(k).then(v => {
            if (v == null) {
                throw new Error('Price not found');
            }
            return v;
        }), 1, getCurrentBlock);
        this.name = name;
    }
    async quote(token) {
        return this.get(token);
    }
}
exports.PriceOracle = PriceOracle;
//# sourceMappingURL=PriceOracle.js.map