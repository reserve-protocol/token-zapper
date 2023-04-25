import { BurnCTokenAction, MintCTokenAction } from '../action/CTokens';
import { Address } from '../base/Address';
import {
  IComptroller__factory,
  ICToken__factory
} from '../contracts';
import { Universe } from '../Universe';
import { setupMintableWithRate } from './setupMintableWithRate';
import { Token } from '../entities';


const loadCompoundTokens = async (
  cEther: Token | null,
  comptrollerAddress: Address,
  universe: Universe,
  underlyingTokens: { [address: string]: string }
) => {
  const allCTokens = await IComptroller__factory.connect(
    comptrollerAddress.address,
    universe.provider
  ).getAllMarkets();
  return await Promise.all(
    allCTokens
      .map(Address.from)
      .filter((address) => (cEther != null ? address !== cEther.address : true))
      .map(async (address) => {
        const [cToken, underlying] = await Promise.all([
          universe.getToken(address),
          universe.getToken(Address.from(underlyingTokens[address.address])),
        ]);
        return { underlying, cToken };
      })
  );
};
export async function setupCompoundLike(
  universe: Universe,
  underlying: { [address: string]: string },
  deployment: { cEth?: Address; comptroller: Address; }) {
  const ETH = universe.nativeToken;
  const cEther = deployment.cEth != null ? await universe.getToken(deployment.cEth) : null;
  if (cEther) {
    await setupMintableWithRate(
      universe,
      ICToken__factory,
      cEther,
      async (cEthRate, cInst) => {
        return {
          fetchRate: async () => (await cInst.exchangeRateStored()).toBigInt(),
          mint: new MintCTokenAction(universe, ETH, cEther, cEthRate),
          burn: new MintCTokenAction(universe, cEther, ETH, cEthRate),
        };
      }
    );
  }

  const cTokens = await loadCompoundTokens(
    cEther,
    deployment.comptroller,
    universe,
    underlying
  );

  for (const { cToken, underlying } of cTokens) {
    await setupMintableWithRate(
      universe,
      ICToken__factory,
      cToken,
      async (rate, inst) => {
        return {
          fetchRate: async () => (await inst.exchangeRateStored()).toBigInt(),
          mint: new MintCTokenAction(universe, underlying, cToken, rate),
          burn: new BurnCTokenAction(universe, underlying, cToken, rate),
        };
      }
    );
  }
  return cTokens
}
