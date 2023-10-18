import { Address } from '../base/Address';
import { ChainLinkOracle } from '../oracles/ChainLinkOracle';
import { ZapperTokenQuantityPrice } from '../oracles/ZapperAggregatorOracle';
export const setupChainLink = (universe, registryAddress, remapped = [], derived = []) => {
    const chainLinkOracle = new ChainLinkOracle(universe, Address.from(registryAddress));
    for (const [token, addr] of remapped) {
        chainLinkOracle.mapTokenTo(token, addr);
    }
    for (const [deri, base] of derived) {
        chainLinkOracle.addDerived(deri, base.uoaToken, base.derivedTokenUnit);
    }
    universe.oracles.push(chainLinkOracle);
    universe.oracle = new ZapperTokenQuantityPrice(universe);
};
//# sourceMappingURL=setupChainLink.js.map