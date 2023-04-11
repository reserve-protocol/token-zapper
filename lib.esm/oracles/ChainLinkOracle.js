import { IChainLinkFeedRegistry__factory } from '../contracts';
import { Oracle } from './Oracle';
const ISO4217USDCodeInHex = '0x0000000000000000000000000000000000000348';
export class ChainLinkOracle extends Oracle {
    universe;
    chainlinkRegistry;
    tokenToChainLinkInternalAddress = new Map();
    mapTokenTo(token, address) {
        this.tokenToChainLinkInternalAddress.set(token, address);
    }
    constructor(universe, chainlinkRegistry) {
        super('Chainlink', async (token) => {
            const addrToLookup = this.tokenToChainLinkInternalAddress.get(token)?.address ??
                token.address.address;
            try {
                const round = await IChainLinkFeedRegistry__factory.connect(this.chainlinkRegistry.address, this.universe.provider).callStatic.latestAnswer(addrToLookup, ISO4217USDCodeInHex);
                return this.universe.usd.fromBigInt(round.toBigInt());
            }
            catch (e) {
                return null;
            }
        });
        this.universe = universe;
        this.chainlinkRegistry = chainlinkRegistry;
    }
}
//# sourceMappingURL=ChainLinkOracle.js.map