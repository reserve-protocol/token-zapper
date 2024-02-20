import { type Universe } from '../Universe'
import {
  BurnSAV3TokensAction,
  MintSAV3TokensAction,
} from '../action/SAV3Tokens'
import { IStaticAV3TokenLM__factory } from '../contracts/factories/contracts/ISAV3Token.sol/IStaticAV3TokenLM__factory'

import { type Token } from '../entities/Token'
import { setupMintableWithRate } from './setupMintableWithRate'

export const setupSAV3Token = async (
  universe: Universe,
  saToken: Token,
  underlying: Token
) => {
  await setupMintableWithRate(
    universe,
    IStaticAV3TokenLM__factory,
    saToken,
    async (rate, saInst) => {
      return {
        fetchRate: async () => (await saInst.rate()).toBigInt(),
        mint: new MintSAV3TokensAction(universe, underlying, saToken, rate),
        burn: new BurnSAV3TokensAction(universe, underlying, saToken, rate),
      }
    }
  )
}
