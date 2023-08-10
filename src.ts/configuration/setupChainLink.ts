import { type Universe } from '../Universe';
import { Address } from '../base/Address';
import { type Token } from '../entities/Token';
import { ChainLinkOracle } from '../oracles/ChainLinkOracle';
import { ZapperOracleAggregator, ZapperTokenQuantityPrice } from '../oracles/ZapperAggregatorOracle';

export const setupChainLink = (
  universe: Universe,
  registryAddress: string,
  remapped: [Token, Address][]
) => {
  const chainLinkOracle = new ChainLinkOracle(
    universe,
    Address.from(registryAddress)
  );

  universe.oracles.push(chainLinkOracle);
  for (const [token, addr] of remapped) {
    chainLinkOracle.mapTokenTo(token, addr);
  }
  universe.oracle = new ZapperTokenQuantityPrice(universe)
};
