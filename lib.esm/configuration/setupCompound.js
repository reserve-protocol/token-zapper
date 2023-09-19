import { BurnCTokenAction, MintCTokenAction } from '../action/CTokens';
import { IComptroller__factory } from '../contracts/factories/ICToken.sol/IComptroller__factory';
import { ICToken__factory } from '../contracts/factories/ICToken.sol/ICToken__factory';
import { setupMintableWithRate } from './setupMintableWithRate';
export const loadCompoundMarketsFromRPC = async (comptrollerAddress, universe) => {
    const allCTokens = await IComptroller__factory.connect(comptrollerAddress.address, universe.provider).getAllMarkets();
    return allCTokens;
};
const ONE = 10n ** 18n;
export async function setupCompoundLike(universe, deployment, cTokens) {
    const ETH = universe.nativeToken;
    const cETH = deployment.cEth;
    if (cETH != null) {
        await setupMintableWithRate(universe, ICToken__factory, cETH, async (cEthRate, cInst) => {
            return {
                fetchRate: async () => (await cInst.exchangeRateStored()).toBigInt(),
                mint: new MintCTokenAction(universe, ETH, cETH, cEthRate),
                burn: new MintCTokenAction(universe, cETH, ETH, cEthRate),
            };
        });
    }
    for (const { wrappedToken, underlying, collaterals } of cTokens) {
        await setupMintableWithRate(universe, ICToken__factory, wrappedToken, async (rate, inst) => {
            return {
                fetchRate: async () => (await inst.exchangeRateStored()).toBigInt(),
                mint: new MintCTokenAction(universe, underlying, wrappedToken, rate),
                burn: new BurnCTokenAction(universe, underlying, wrappedToken, rate),
            };
        });
        for (const collateral of collaterals ?? []) {
            await setupMintableWithRate(universe, ICToken__factory, collateral, async (rate, inst) => {
                return {
                    fetchRate: async () => ONE,
                    mint: new MintCTokenAction(universe, wrappedToken, collateral, rate),
                    burn: new BurnCTokenAction(universe, wrappedToken, collateral, rate),
                };
            });
        }
    }
    return cTokens;
}
//# sourceMappingURL=setupCompound.js.map