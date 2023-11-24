"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZapperTokenQuantityPrice = exports.ZapperOracleAggregator = void 0;
const Cached_1 = require("../base/Cached");
const PriceOracle_1 = require("./PriceOracle");
class ZapperOracleAggregator extends PriceOracle_1.PriceOracle {
    universe;
    constructor(universe) {
        super("Aggregator", qty => this.priceAsset(qty), () => universe.currentBlock);
        this.universe = universe;
    }
    async priceAsset(token) {
        for (const oracle of this.universe.oracles) {
            try {
                const price = await oracle.quote(token);
                if (price != null) {
                    return price;
                }
            }
            catch (e) { }
        }
        throw new Error('Unable to price ' + token);
    }
}
exports.ZapperOracleAggregator = ZapperOracleAggregator;
class ZapperTokenQuantityPrice extends Cached_1.Cached {
    universe;
    aggregatorOracle;
    constructor(universe) {
        super(qty => this.quoteFn(qty), 1, () => universe.currentBlock);
        this.universe = universe;
        this.aggregatorOracle = new ZapperOracleAggregator(this.universe);
    }
    async quoteFn(qty) {
        const universe = this.universe;
        const wrappedToken = universe.wrappedTokens.get(qty.token);
        if (wrappedToken != null) {
            const outTokens = await wrappedToken.burn.quote([qty]);
            const sums = await Promise.all(outTokens.map(async (qty) => await this.get(qty)));
            return sums.reduce((l, r) => l.add(r));
        }
        else {
            return (await this.tokenPrice(qty.token)).into(qty.token).mul(qty).into(universe.usd);
        }
    }
    async tokenPrice(token) {
        for (const oracle of this.universe.oracles) {
            try {
                return await oracle.quote(token);
            }
            catch (e) { }
        }
        throw new Error('Unable to price ' + token);
    }
    async quoteToken(token) {
        if (!this.universe.wrappedTokens.has(token)) {
            return this.aggregatorOracle.quote(token);
        }
        return this.get(token.one);
    }
    async quote(qty) {
        return this.get(qty);
    }
    async quoteIn(qty, tokenToQuoteWith) {
        const [priceOfOneUnitOfInput, priceOfOneUnitOfOutput] = await Promise.all([
            this.quote(qty.token.one),
            this.quote(tokenToQuoteWith.one)
        ]);
        return priceOfOneUnitOfInput.div(priceOfOneUnitOfOutput).into(tokenToQuoteWith).mul(qty.into(tokenToQuoteWith));
    }
}
exports.ZapperTokenQuantityPrice = ZapperTokenQuantityPrice;
//# sourceMappingURL=ZapperAggregatorOracle.js.map