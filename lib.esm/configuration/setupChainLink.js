import { Address } from '../base/Address';
import { ChainLinkOracle } from '../oracles/ChainLinkOracle';
export const setupChainlinkRegistry = (universe, registryAddress, remapped = [], derived = []) => {
    const chainLinkOracle = new ChainLinkOracle(universe, Address.from(registryAddress));
    for (const [token, addr] of remapped) {
        chainLinkOracle.mapTokenTo(token, addr);
    }
    for (const [deri, base] of derived) {
        chainLinkOracle.addDerived(deri, base.uoaToken, base.derivedTokenUnit);
    }
    universe.oracles.push(chainLinkOracle);
};
//# sourceMappingURL=setupChainLink.js.map