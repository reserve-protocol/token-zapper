import { Universe } from '../Universe';
import { Address } from '../base/Address';
import { Token } from '../entities';
import { ChainLinkOracle } from '../oracles/ChainLinkOracle';


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
};
