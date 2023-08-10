import { Address } from '../base/Address';
import { ChainLinkOracle } from '../oracles/ChainLinkOracle';
import { ZapperTokenQuantityPrice } from '../oracles/ZapperAggregatorOracle';
export const setupChainLink = (universe, registryAddress, remapped) => {
    const chainLinkOracle = new ChainLinkOracle(universe, Address.from(registryAddress));
    universe.oracles.push(chainLinkOracle);
    for (const [token, addr] of remapped) {
        chainLinkOracle.mapTokenTo(token, addr);
    }
    universe.oracle = new ZapperTokenQuantityPrice(universe);
};
//# sourceMappingURL=setupChainLink.js.map