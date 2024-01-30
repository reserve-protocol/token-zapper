import { ETHToRETH, RETHToETH, REthRouter } from '../action/REth';
import { Address } from '../base/Address';
import { type EthereumUniverse } from './ethereum';

export const setupRETH = async (
  universe: EthereumUniverse,
  rethAddress: string,
  rethRouterAddress: string
) => {
  const reth = await universe.getToken(
    Address.from(rethAddress)
  );
  const rethRouter = new REthRouter(
    universe,
    reth,
    Address.from(rethRouterAddress)
  );

  const ethToREth = new ETHToRETH(universe, rethRouter);
  const rEthtoEth = new RETHToETH(universe, rethRouter);

  universe.defineMintable(ethToREth, rEthtoEth, true);
};
