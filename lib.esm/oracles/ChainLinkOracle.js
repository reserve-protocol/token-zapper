import { IChainLinkFeedRegistry__factory } from '../contracts/factories/IChainLinkFeedRegistry__factory';
import { PriceOracle } from './PriceOracle';
const ISO4217USDCodeInHex = '0x0000000000000000000000000000000000000348';
export class ChainLinkOracle extends PriceOracle {
    universe;
    chainlinkRegistry;
    tokenToChainLinkInternalAddress = new Map();
    mapTokenTo(token, address) {
        this.tokenToChainLinkInternalAddress.set(token, address);
    }
    constructor(universe, chainlinkRegistry) {
        super('ChainLink', async (token) => {
            const addrToLookup = this.tokenToChainLinkInternalAddress.get(token)?.address ??
                token.address.address;
            const lastestAnswer = await IChainLinkFeedRegistry__factory.connect(this.chainlinkRegistry.address, this.universe.provider).callStatic.latestAnswer(addrToLookup, ISO4217USDCodeInHex);
            return universe.usd.fromEthersBn(lastestAnswer);
        }, () => universe.currentBlock);
        this.universe = universe;
        this.chainlinkRegistry = chainlinkRegistry;
    }
}
//# sourceMappingURL=ChainLinkOracle.js.map