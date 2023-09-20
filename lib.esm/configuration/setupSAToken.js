import { BurnSATokensAction, MintSATokensAction } from '../action/SATokens';
import { IStaticATokenLM__factory } from '../contracts/factories/ISAtoken.sol/IStaticATokenLM__factory';
import { setupMintableWithRate } from './setupMintableWithRate';
export const setupSAToken = async (universe, saToken, underlying) => {
    await setupMintableWithRate(universe, IStaticATokenLM__factory, saToken, async (rate, saInst) => {
        return {
            fetchRate: async () => (await saInst.rate()).toBigInt(),
            mint: new MintSATokensAction(universe, underlying, saToken, rate),
            burn: new BurnSATokensAction(universe, underlying, saToken, rate),
        };
    });
};
//# sourceMappingURL=setupSAToken.js.map