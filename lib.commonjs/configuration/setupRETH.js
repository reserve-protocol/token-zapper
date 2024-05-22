"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupRETH = void 0;
const REth_1 = require("../action/REth");
const DexAggregator_1 = require("../aggregators/DexAggregator");
const Address_1 = require("../base/Address");
const Swap_1 = require("../searcher/Swap");
const setupRETH = async (universe, config) => {
    const rethAddress = Address_1.Address.from(config.reth);
    const rethRouterAddress = Address_1.Address.from(config.router);
    const reth = await universe.getToken(Address_1.Address.from(rethAddress));
    const rethRouter = new REth_1.REthRouter(universe, reth, Address_1.Address.from(rethRouterAddress));
    const actions = [
        rethRouter.burnToETH,
        rethRouter.burnToWETH,
        rethRouter.mintViaETH,
        rethRouter.mintViaWETH,
    ];
    const rocketPoolRouter = new DexAggregator_1.DexRouter('RocketpoolRouter:swapTo', async (abort, input, output) => {
        for (const action of actions) {
            if (action.outputToken[0] != output ||
                action.inputToken[0] != input.token) {
                continue;
            }
            return await new Swap_1.SwapPlan(universe, [action]).quote([input], universe.execAddress);
        }
        throw new Error('Unsupported');
    }, true, new Set([reth, universe.wrappedNativeToken, universe.nativeToken]), new Set([reth, universe.wrappedNativeToken, universe.nativeToken]));
    return new DexAggregator_1.TradingVenue(universe, rocketPoolRouter);
};
exports.setupRETH = setupRETH;
//# sourceMappingURL=setupRETH.js.map