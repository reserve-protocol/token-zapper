import { Address } from '../base/Address';
import { IChainLinkFeedRegistry__factory } from '../contracts/factories/contracts/IChainLinkFeedRegistry__factory';
import { PriceOracle } from './PriceOracle';
const ISO4217USDCodeInHex = '0x0000000000000000000000000000000000000348';
export class ChainLinkOracle extends PriceOracle {
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
            const lastestAnswer = await IChainLinkFeedRegistry__factory.connect(this.chainlinkRegistry.address, this.universe.provider).callStatic.latestAnswer(addrToLookup, quoteSymbol);
            return (this.universe.tokens
                .get(Address.from(quoteSymbol))
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
//# sourceMappingURL=ChainLinkOracle.js.map