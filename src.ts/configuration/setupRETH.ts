import { Universe } from '../Universe';
import { ETHToRETH, RETHToETH, REthRouter } from '../action/REth';
import { Address } from '../base/Address';


export const setupRETH = async (
  universe: Universe,
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

  universe.defineMintable(ethToREth, rEthtoEth);
};
