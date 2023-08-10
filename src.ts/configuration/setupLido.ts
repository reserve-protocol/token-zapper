import { Universe } from '../Universe';
import { BurnStETH, MintStETH, StETHRateProvider } from '../action/StEth';
import { BurnWStETH, MintWStETH, WStETHRateProvider } from '../action/WStEth';
import { Address } from '../base/Address';


export const setupLido = async (
  universe: Universe,
  stakedTokenAddress: string,
  wrappedStakedAddress: string
) => {
  const stakedToken = await universe.getToken(
    Address.from(stakedTokenAddress)
  );
  const stRate = new StETHRateProvider(universe, stakedToken);
  universe.defineMintable(
    new MintStETH(universe, stakedToken, stRate),
    new BurnStETH(universe, stakedToken, stRate)
  );
  const wrappedStakedToken = await universe.getToken(
    Address.from(wrappedStakedAddress)
  );
  const wstRate = new WStETHRateProvider(universe, stakedToken, wrappedStakedToken);
  universe.defineMintable(
    new MintWStETH(universe, stakedToken, wrappedStakedToken, wstRate),
    new BurnWStETH(universe, stakedToken, wrappedStakedToken, wstRate)
  );
};
