import { Cached } from '../base/Cached';
import { PriceOracle } from './PriceOracle';
export class ZapperOracleAggregator extends PriceOracle {
    universe;
    constructor(universe) {
        super(universe.config.requoteTolerance, 'Aggregator', async (qty) => await this.priceAsset(qty), () => universe.currentBlock);
        this.universe = universe;
    }
    async priceAsset(token) {
        let sum = this.universe.usd.zero;
        let samples = 0n;
        await Promise.all(this.universe.oracles.map(async (oracle) => {
            const price = await oracle.quote(token);
            if (price == null) {
                return;
            }
            if (price.token !== this.universe.usd) {
                console.log('Price oracle returned price in ' +
                    price.token.symbol +
                    ' instead of USD');
                return;
            }
            sum = sum.add(price);
            samples += 1n;
        }));
        if (samples === 0n) {
            throw new Error('Unable to price ' + token);
        }
        return sum.scalarDiv(samples);
    }
}
export class ZapperTokenQuantityPrice extends Cached {
    universe;
    aggregatorOracle;
    latestPrices = new Map();
    constructor(universe) {
        super((qty) => this.quoteFn(qty), universe.config.requoteTolerance, () => universe.currentBlock);
        this.universe = universe;
        this.aggregatorOracle = new ZapperOracleAggregator(this.universe);
    }
    dumpPrices() {
        return [...this.latestPrices.entries()].map((k) => {
            return {
                token: k[0],
                price: k[1],
            };
        });
    }
    async quoteFn(qty) {
        const universe = this.universe;
        const wrappedToken = universe.wrappedTokens.get(qty.token);
        if (wrappedToken != null) {
            const outTokens = await wrappedToken.burn.quote([qty]);
            const sums = await Promise.all(outTokens.map(async (qty) => await this.get(qty)));
            const out = sums.reduce((l, r) => l.add(r));
            const unitPrice = qty.amount === qty.token.scale ? out : out.div(qty.into(out.token));
            this.latestPrices.set(qty.token, unitPrice);
            return out;
        }
        else {
            return (await this.tokenPrice(qty.token))
                .into(qty.token)
                .mul(qty)
                .into(universe.usd);
        }
    }
    async tokenPrice(token) {
        const outPrice = await this.aggregatorOracle.quote(token);
        if (outPrice != null) {
            this.latestPrices.set(token, outPrice);
        }
        return outPrice ?? this.universe.usd.zero;
    }
    async quote(qty) {
        return this.get(qty);
    }
    async quoteIn(tokenQty, quoteToken) {
        const [priceOfOneUnitOfInput, priceOfOneUnitOfOutput] = await Promise.all([
            this.quote(tokenQty.token.one),
            this.quote(quoteToken.one),
        ]);
        return priceOfOneUnitOfInput
            .div(priceOfOneUnitOfOutput)
            .into(quoteToken)
            .mul(tokenQty.into(quoteToken));
    }
}
//# sourceMappingURL=ZapperAggregatorOracle.js.map