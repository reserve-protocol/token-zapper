"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChainLinkOracle = void 0;
const contracts_1 = require("../contracts");
const Oracle_1 = require("./Oracle");
const ISO4217USDCodeInHex = '0x0000000000000000000000000000000000000348';
class ChainLinkOracle extends Oracle_1.Oracle {
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
                const round = await contracts_1.IChainLinkFeedRegistry__factory.connect(this.chainlinkRegistry.address, this.universe.provider).callStatic.latestAnswer(addrToLookup, ISO4217USDCodeInHex);
                return this.universe.usd.quantityFromBigInt(round.toBigInt());
            }
            catch (e) {
                return null;
            }
        });
        this.universe = universe;
        this.chainlinkRegistry = chainlinkRegistry;
    }
}
exports.ChainLinkOracle = ChainLinkOracle;
//# sourceMappingURL=ChainLinkOracle.js.map