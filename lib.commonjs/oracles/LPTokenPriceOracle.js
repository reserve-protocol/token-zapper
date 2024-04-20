"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LPTokenPriceOracle = void 0;
const PriceOracle_1 = require("./PriceOracle");
class LPTokenPriceOracle extends PriceOracle_1.PriceOracle {
    universe;
    async quoteTok(token) {
        if (!this.universe.lpTokens.has(token)) {
            return null;
        }
        const lpToken = this.universe.lpTokens.get(token);
        const out = await Promise.all((await lpToken.burn(token.one)).map(async (t) => (await this.universe.fairPrice(t)) ?? this.universe.usd.zero));
        return out.reduce((acc, t) => {
            return acc.add(t);
        }, this.universe.usd.zero);
    }
    constructor(universe) {
        super('ChainLink', (t) => this.quoteTok(t), () => universe.currentBlock);
        this.universe = universe;
    }
}
exports.LPTokenPriceOracle = LPTokenPriceOracle;
//# sourceMappingURL=LPTokenPriceOracle.js.map