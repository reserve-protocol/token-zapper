"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupRETH = void 0;
const __1 = require("..");
const REth_1 = require("../action/REth");
const Address_1 = require("../base/Address");
const Swap_1 = require("../searcher/Swap");
const setupRETH = async (universe, rethAddress, rethRouterAddress) => {
    const reth = await universe.getToken(Address_1.Address.from(rethAddress));
    const rethRouter = new REth_1.REthRouter(universe, reth, Address_1.Address.from(rethRouterAddress));
    const ethToREth = new REth_1.ETHToRETH(universe, rethRouter);
    const rEthtoEth = new REth_1.RETHToETH(universe, rethRouter);
    universe.dexAggregators.push(new __1.DexAggregator('reth', async (_, dest, input, output, __) => {
        if (input.token === universe.nativeToken && output === reth) {
            return await new Swap_1.SwapPlan(universe, [ethToREth]).quote([input], dest);
        }
        if (input.token === reth && output === universe.nativeToken) {
            return await new Swap_1.SwapPlan(universe, [rEthtoEth]).quote([input], dest);
        }
        throw new Error('Unsupported trade');
    }));
};
exports.setupRETH = setupRETH;
//# sourceMappingURL=setupRETH.js.map