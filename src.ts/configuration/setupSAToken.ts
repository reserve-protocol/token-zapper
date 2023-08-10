import { type Universe } from '../Universe';
import { BurnSATokensAction, MintSATokensAction } from '../action/SATokens';
import { IStaticATokenLM__factory } from '../contracts/factories/contracts/ISAtoken.sol/IStaticATokenLM__factory';

import { type Token } from '../entities/Token';
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
