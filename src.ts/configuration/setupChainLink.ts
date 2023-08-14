import { type Universe } from '../Universe';
import { Address } from '../base/Address';
import { type Token } from '../entities/Token';
import { ChainLinkOracle } from '../oracles/ChainLinkOracle';
import { ZapperTokenQuantityPrice } from '../oracles/ZapperAggregatorOracle';

export const setupChainLink = (
  universe: Universe,
  registryAddress: string,
  remapped: [Token, Address][] = [],
  derived: [Token, {uoaToken: Token, derivedTokenUnit: Address}][] = []
) => {
  const chainLinkOracle = new ChainLinkOracle(
    universe,
    Address.from(registryAddress)
  );

  for (const [token, addr] of remapped) {
    chainLinkOracle.mapTokenTo(token, addr);
  }
  for (const [deri, base] of derived) {
    chainLinkOracle.addDerived(deri, base.uoaToken, base.derivedTokenUnit);
  }
  universe.oracles.push(chainLinkOracle);
  universe.oracle = new ZapperTokenQuantityPrice(universe)

  
};
