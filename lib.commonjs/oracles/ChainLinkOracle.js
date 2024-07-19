"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChainLinkOracle = void 0;
const Address_1 = require("../base/Address");
const IChainLinkFeedRegistry__factory_1 = require("../contracts/factories/contracts/IChainLinkFeedRegistry__factory");
const PriceOracle_1 = require("./PriceOracle");
const ISO4217USDCodeInHex = '0x0000000000000000000000000000000000000348';
class ChainLinkOracle extends PriceOracle_1.PriceOracle {
    universe;
    chainlinkRegistry;
    tokenToChainLinkInternalAddress = new Map();
    derived = new Map();
    mapTokenTo(token, address) {
        this.tokenToChainLinkInternalAddress.set(token, address);
    }
    addDerived(derived, uoaToken, derivedTokenUnit) {
        this.derived.set(derived, { uoaToken, derivedTokenUnit });
    }
    unsupported = new Set();
    async quote_(token, quoteSymbol = ISO4217USDCodeInHex) {
        try {
            const addrToLookup = this.tokenToChainLinkInternalAddress.get(token)?.address ??
                token.address.address;
            const lastestAnswer = await IChainLinkFeedRegistry__factory_1.IChainLinkFeedRegistry__factory.connect(this.chainlinkRegistry.address, this.universe.provider).callStatic.latestAnswer(addrToLookup, quoteSymbol);
            return (this.universe.tokens
                .get(Address_1.Address.from(quoteSymbol))
                ?.fromEthersBn(lastestAnswer) ?? null);
        }
        catch (e) {
            this.unsupported.add(token);
            return null;
        }
    }
    supports(token) {
        return !this.unsupported.has(token);
    }
    async quoteTok(token) {
        if (this.derived.has(token)) {
            const [derivedToken, { uoaToken, derivedTokenUnit }] = [
                token,
                this.derived.get(token),
            ];
            const [basePrice, derivedPrice] = await Promise.all([
                this.quote_(uoaToken, ISO4217USDCodeInHex),
                this.quote_(derivedToken, derivedTokenUnit.address),
            ]);
            if (!basePrice || !derivedPrice) {
                return null;
            }
            return basePrice.mul(derivedPrice.into(basePrice.token));
        }
        return await this.quote_(token);
    }
    constructor(universe, chainlinkRegistry) {
        super(universe.config.requoteTolerance, 'ChainLink', (t) => this.quoteTok(t), () => universe.currentBlock);
        this.universe = universe;
        this.chainlinkRegistry = chainlinkRegistry;
    }
}
exports.ChainLinkOracle = ChainLinkOracle;
//# sourceMappingURL=ChainLinkOracle.js.map