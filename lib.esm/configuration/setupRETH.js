import { REthRouter } from '../action/REth';
import { DexRouter, TradingVenue } from '../aggregators/DexAggregator';
import { Address } from '../base/Address';
import { SwapPlan } from '../searcher/Swap';
export const setupRETH = async (universe, config) => {
    const rethAddress = Address.from(config.reth);
    const rethRouterAddress = Address.from(config.router);
    const reth = await universe.getToken(Address.from(rethAddress));
    const rethRouter = new REthRouter(universe, reth, Address.from(rethRouterAddress));
    const actions = [
        rethRouter.burnToETH,
        rethRouter.burnToWETH,
        rethRouter.mintViaETH,
        rethRouter.mintViaWETH,
    ];
    const rocketPoolRouter = new DexRouter('RocketpoolRouter:swapTo', async (abort, input, output) => {
        for (const action of actions) {
            if (action.outputToken[0] != output ||
                action.inputToken[0] != input.token) {
                continue;
            }
            return await new SwapPlan(universe, [action]).quote([input], universe.execAddress);
        }
        throw new Error('Unsupported');
    }, true, new Set([reth, universe.wrappedNativeToken, universe.nativeToken]), new Set([reth, universe.wrappedNativeToken, universe.nativeToken]));
    return new TradingVenue(universe, rocketPoolRouter);
};
//# sourceMappingURL=setupRETH.js.map