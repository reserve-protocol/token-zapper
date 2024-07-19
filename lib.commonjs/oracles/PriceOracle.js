"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceOracle = void 0;
const Cached_1 = require("../base/Cached");
const contracts_1 = require("../contracts");
class PriceOracle extends Cached_1.Cached {
    name;
    supportedTokens;
    constructor(ltvBlocks, name, fetchPrice, getCurrentBlock, supportedTokens = new Set()) {
        super(async (k) => {
            if (!this.supports(k)) {
                return null;
            }
            const v = await fetchPrice(k);
            if (v == null) {
                return null;
            }
            return v;
        }, ltvBlocks, getCurrentBlock);
        this.name = name;
        this.supportedTokens = supportedTokens;
    }
    toString() {
        return `PriceOracle[${this.name}]`;
    }
    static createSingleTokenOracle(universe, token, fetchPrice) {
        return new PriceOracle(universe.config.requoteTolerance, `PriceProvider(${token})`, async (_) => fetchPrice(), () => universe.currentBlock, new Set([token]));
    }
    static async createSingleTokenOracleChainLinkLike(universe, token, oracleAddress, priceToken) {
        const oracle = contracts_1.IChainlinkAggregator__factory.connect(oracleAddress.address, universe.provider);
        const digits = BigInt(await oracle.decimals());
        return new PriceOracle(universe.config.requoteTolerance, `PriceProvider(${token})`, async (_) => {
            let answer = (await oracle.latestAnswer()).toBigInt();
            if (digits > 18) {
                answer = answer * 10n ** (digits - 18n);
            }
            else if (digits < 18) {
                answer = answer / 10n ** (18n - digits);
            }
            const out = priceToken.fromScale18BN(answer);
            if (priceToken !== universe.usd) {
                return await universe.fairPrice(out);
            }
            return out;
        }, () => universe.currentBlock, new Set([token]));
    }
    supports(token) {
        if (this.supportedTokens.size === 0) {
            return true;
        }
        return this.supportedTokens.has(token);
    }
    async quote(token) {
        try {
            return await this.get(token);
        }
        catch (e) {
            return null;
        }
    }
}
exports.PriceOracle = PriceOracle;
//# sourceMappingURL=PriceOracle.js.map