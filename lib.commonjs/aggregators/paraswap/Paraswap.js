"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createParaswap = void 0;
const paraswap_1 = require("paraswap");
const DexAggregator_1 = require("../DexAggregator");
const Swap_1 = require("../../searcher/Swap");
const ParaswapAction_1 = require("../../action/ParaswapAction");
const API_URL = "https://apiv5.paraswap.io";
const createParaswap = (aggregatorName, universe) => {
    const client = new paraswap_1.ParaSwap(universe.chainId, API_URL, universe.provider);
    return new DexAggregator_1.DexAggregator(aggregatorName, async (_, destination, input, output, slippage) => {
        let rate = await client.getRate(input.token.address.address, output.address.address, input.amount.toString(), undefined, undefined, {
            maxImpact: slippage,
        });
        if (rate.message != null) {
            throw new Error(rate.toString());
        }
        rate = rate;
        const tx = await client.buildTx(input.token.address.address, output.address.address, input.amount.toString(), rate.destAmount.toString(), rate, destination.address);
        if (tx.message != null) {
            throw new Error(rate.toString());
        }
        return await new Swap_1.SwapPlan(universe, [
            ParaswapAction_1.ParaswapAction.createAction(universe, input, output.from(rate.destAmount), tx),
        ]).quote([input], destination);
    });
};
exports.createParaswap = createParaswap;
//# sourceMappingURL=Paraswap.js.map