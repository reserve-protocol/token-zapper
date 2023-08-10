"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChainLinkOracle = void 0;
const IChainLinkFeedRegistry__factory_1 = require("../contracts/factories/IChainLinkFeedRegistry__factory");
const PriceOracle_1 = require("./PriceOracle");
const ISO4217USDCodeInHex = '0x0000000000000000000000000000000000000348';
class ChainLinkOracle extends PriceOracle_1.PriceOracle {
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
            const lastestAnswer = await IChainLinkFeedRegistry__factory_1.IChainLinkFeedRegistry__factory.connect(this.chainlinkRegistry.address, this.universe.provider).callStatic.latestAnswer(addrToLookup, ISO4217USDCodeInHex);
            return universe.usd.fromEthersBn(lastestAnswer);
        }, () => universe.currentBlock);
        this.universe = universe;
        this.chainlinkRegistry = chainlinkRegistry;
    }
}
exports.ChainLinkOracle = ChainLinkOracle;
//# sourceMappingURL=ChainLinkOracle.js.map