import { DexAggregator } from '..';
import { ETHToRETH, RETHToETH, REthRouter } from '../action/REth';
import { Address } from '../base/Address';
import { SwapPlan } from '../searcher/Swap';
export const setupRETH = async (universe, rethAddress, rethRouterAddress) => {
    const reth = await universe.getToken(Address.from(rethAddress));
    const rethRouter = new REthRouter(universe, reth, Address.from(rethRouterAddress));
    const ethToREth = new ETHToRETH(universe, rethRouter);
    const rEthtoEth = new RETHToETH(universe, rethRouter);
    universe.dexAggregators.push(new DexAggregator('reth', async (_, dest, input, output, __) => {
        if (input.token === universe.nativeToken && output === reth) {
            return await new SwapPlan(universe, [ethToREth]).quote([input], dest);
        }
        if (input.token === reth && output === universe.nativeToken) {
            return await new SwapPlan(universe, [rEthtoEth]).quote([input], dest);
        }
        throw new Error('Unsupported trade');
    }));
};
//# sourceMappingURL=setupRETH.js.map