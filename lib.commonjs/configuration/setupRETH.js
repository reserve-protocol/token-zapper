"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupRETH = void 0;
const REth_1 = require("../action/REth");
const DexAggregator_1 = require("../aggregators/DexAggregator");
const Address_1 = require("../base/Address");
const Swap_1 = require("../searcher/Swap");
const setupRETH = async (universe, rethAddress, rethRouterAddress) => {
    const reth = await universe.getToken(Address_1.Address.from(rethAddress));
    const rethRouter = new REth_1.REthRouter(universe, reth, Address_1.Address.from(rethRouterAddress));
    universe.dexAggregators.push(new DexAggregator_1.DexRouter('RocketpoolRouter:swapTo', async (abort, payer, dest, input) => {
        if (input.token == universe.wrappedNativeToken) {
            return await new Swap_1.SwapPlan(universe, [rethRouter.mintViaWETH]).quote([input], dest);
        }
        return await new Swap_1.SwapPlan(universe, [rethRouter.mintViaETH]).quote([input], dest);
    }, true, new Set([universe.wrappedNativeToken, universe.nativeToken]), new Set([reth])));
    universe.dexAggregators.push(new DexAggregator_1.DexRouter('RocketpoolRouter:swapFrom', async (____, _, dest, input, output) => {
        if (output == universe.wrappedNativeToken) {
            return await new Swap_1.SwapPlan(universe, [rethRouter.burnToWETH]).quote([input], dest);
        }
        return await new Swap_1.SwapPlan(universe, [rethRouter.burnToETH]).quote([input], dest);
    }, true, new Set([reth]), new Set([universe.wrappedNativeToken, universe.nativeToken])));
};
exports.setupRETH = setupRETH;
//# sourceMappingURL=setupRETH.js.map