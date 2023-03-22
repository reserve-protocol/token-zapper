"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Oracle = void 0;
const DefaultMap_1 = require("../base/DefaultMap");
const NULL_VAL = { result: null, block: 0 };
class Oracle {
    name;
    fairTokenPriceImplementation;
    constructor(name, fairTokenPriceImplementation) {
        this.name = name;
        this.fairTokenPriceImplementation = fairTokenPriceImplementation;
    }
    currentPrices = new DefaultMap_1.DefaultMap(async () => await Promise.resolve(NULL_VAL));
    async fairTokenPrice(block, token) {
        const current = await (this.currentPrices.get(token) ??
            Promise.resolve(NULL_VAL));
        if (current.block < block) {
            this.currentPrices.set(token, this.fairTokenPriceImplementation(token).then((result) => ({
                result,
                block,
            })));
        }
        return await this.currentPrices.get(token).then(({ result }) => result);
    }
}
exports.Oracle = Oracle;
//# sourceMappingURL=Oracle.js.map