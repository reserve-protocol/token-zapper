import { Universe } from '../Universe';
import { Action } from '../action';
import { ethers } from 'ethers';
import { Token } from '../entities';

/**
 * Small helper to setup a mintable token with a rate provider
 * @param universe
 * @param factory
 * @param wrappedToken
 * @param initRateProvider
 */
export const setupMintableWithRate = async <R>(
  universe: Universe<any>,
  factory: {
    connect: (address: string, provider: ethers.providers.Provider) => R;
  },
  wrappedToken: Token,
  initRateProvider: (
    rate: { value: bigint; },
    inst: R
  ) => Promise<{
    fetchRate: () => Promise<bigint>;
    mint: Action;
    burn: Action;
  }>
) => {
  const rate = {
    value: 0n,
  };
  const inst = factory.connect(wrappedToken.address.address, universe.provider);
  const { fetchRate, mint, burn } = await initRateProvider(rate, inst);
  const updateRate = async () => {
    rate.value = await fetchRate();
  };
  const wrapped = mint.output[0];
  universe.createRefreshableEntity(wrapped.address, updateRate);
  universe.defineMintable(mint, burn);
};
