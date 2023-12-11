"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupChainLink = void 0;
const Address_1 = require("../base/Address");
const ChainLinkOracle_1 = require("../oracles/ChainLinkOracle");
const ZapperAggregatorOracle_1 = require("../oracles/ZapperAggregatorOracle");
const setupChainLink = (universe, registryAddress, remapped = [], derived = []) => {
    const chainLinkOracle = new ChainLinkOracle_1.ChainLinkOracle(universe, Address_1.Address.from(registryAddress));
    for (const [token, addr] of remapped) {
        chainLinkOracle.mapTokenTo(token, addr);
    }
    for (const [deri, base] of derived) {
        chainLinkOracle.addDerived(deri, base.uoaToken, base.derivedTokenUnit);
    }
    universe.oracles.push(chainLinkOracle);
    universe.oracle = new ZapperAggregatorOracle_1.ZapperTokenQuantityPrice(universe);
};
exports.setupChainLink = setupChainLink;
//# sourceMappingURL=setupChainLink.js.map