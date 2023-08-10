import { Universe } from '../Universe';
import { BurnSATokensAction, MintSATokensAction } from '../action/SATokens';
import { IStaticATokenLM__factory } from '../contracts';
import { Token } from '../entities';
import { setupMintableWithRate } from './setupMintableWithRate';


export const setupSAToken = async (
  universe: Universe,
  saToken: Token,
  underlying: Token
) => {
  await setupMintableWithRate(
    universe,
    IStaticATokenLM__factory,
    saToken,
    async (rate, saInst) => {
      return {
        fetchRate: async () => (await saInst.rate()).toBigInt(),
        mint: new MintSATokensAction(universe, underlying, saToken, rate),
        burn: new BurnSATokensAction(universe, underlying, saToken, rate),
      };
    }
  );
};
