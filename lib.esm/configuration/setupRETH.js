import { REthRouter } from '../action/REth';
import { DexRouter } from '../aggregators/DexAggregator';
import { Address } from '../base/Address';
import { SwapPlan } from '../searcher/Swap';
export const setupRETH = async (universe, rethAddress, rethRouterAddress) => {
    const reth = await universe.getToken(Address.from(rethAddress));
    const rethRouter = new REthRouter(universe, reth, Address.from(rethRouterAddress));
    universe.dexAggregators.push(new DexRouter('RocketpoolRouter:swapTo', async (abort, payer, dest, input) => {
        if (input.token == universe.wrappedNativeToken) {
            return await new SwapPlan(universe, [rethRouter.mintViaWETH]).quote([input], dest);
        }
        return await new SwapPlan(universe, [rethRouter.mintViaETH]).quote([input], dest);
    }, true, new Set([universe.wrappedNativeToken, universe.nativeToken]), new Set([reth])));
    universe.dexAggregators.push(new DexRouter('RocketpoolRouter:swapFrom', async (____, _, dest, input, output) => {
        if (output == universe.wrappedNativeToken) {
            return await new SwapPlan(universe, [rethRouter.burnToWETH]).quote([input], dest);
        }
        return await new SwapPlan(universe, [rethRouter.burnToETH]).quote([input], dest);
    }, true, new Set([reth]), new Set([universe.wrappedNativeToken, universe.nativeToken])));
};
//# sourceMappingURL=setupRETH.js.map