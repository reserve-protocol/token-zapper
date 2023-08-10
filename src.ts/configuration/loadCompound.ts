import { BurnCTokenAction, MintCTokenAction } from '../action/CTokens';
import { Address } from '../base/Address';
import {
  IComptroller__factory,
  ICToken__factory
} from '../contracts';
import { Universe } from '../Universe';
import { setupMintableWithRate } from './setupMintableWithRate';
import { Token } from '../entities';

export const loadCompoundMarketsFromRPC = async (
  comptrollerAddress: Address,
  universe: Universe<any>,
) => {
  const allCTokens = await IComptroller__factory.connect(
    comptrollerAddress.address,
    universe.provider
  ).getAllMarkets();
  return allCTokens
};
export async function setupCompoundLike(
  universe: Universe<any>,
  deployment: { cEth?: Token; comptroller: Address; },
  cTokens: {underlying: Token, wrappedToken: Token }[]
) {
  const ETH = universe.nativeToken;
  const cETH = deployment.cEth

  if (cETH != null) {
    await setupMintableWithRate(
      universe,
      ICToken__factory,
      cETH,
      async (cEthRate, cInst) => {
        return {
          fetchRate: async () => (await cInst.exchangeRateStored()).toBigInt(),
          mint: new MintCTokenAction(universe, ETH, cETH, cEthRate),
          burn: new MintCTokenAction(universe, cETH, ETH, cEthRate),
        };
      }
    );
  }

  for (const { wrappedToken, underlying } of cTokens) {
    await setupMintableWithRate(
      universe,
      ICToken__factory,
      wrappedToken,
      async (rate, inst) => {
        return {
          fetchRate: async () => (await inst.exchangeRateStored()).toBigInt(),
          mint: new MintCTokenAction(universe, underlying, wrappedToken, rate),
          burn: new BurnCTokenAction(universe, underlying, wrappedToken, rate),
        };
      }
    );
  }
  return cTokens
}
