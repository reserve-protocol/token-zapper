"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupChainlinkRegistry = void 0;
const Address_1 = require("../base/Address");
const ChainLinkOracle_1 = require("../oracles/ChainLinkOracle");
const setupChainlinkRegistry = (universe, registryAddress, remapped = [], derived = []) => {
    const chainLinkOracle = new ChainLinkOracle_1.ChainLinkOracle(universe, Address_1.Address.from(registryAddress));
    for (const [token, addr] of remapped) {
        chainLinkOracle.mapTokenTo(token, addr);
    }
    for (const [deri, base] of derived) {
        chainLinkOracle.addDerived(deri, base.uoaToken, base.derivedTokenUnit);
    }
    universe.oracles.push(chainLinkOracle);
};
exports.setupChainlinkRegistry = setupChainlinkRegistry;
//# sourceMappingURL=setupChainLink.js.map