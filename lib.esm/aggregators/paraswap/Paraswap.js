import { ParaSwap } from "paraswap";
import { DexRouter } from "../DexAggregator";
import { SwapPlan } from "../../searcher/Swap";
import { ParaswapAction } from "../../action/ParaswapAction";
const API_URL = "https://apiv5.paraswap.io";
export const createParaswap = (aggregatorName, universe) => {
    const client = new ParaSwap(universe.chainId, API_URL, universe.provider);
    return new DexRouter(aggregatorName, async (_, destination, input, output, slippage) => {
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
        return await new SwapPlan(universe, [
            ParaswapAction.createAction(universe, input, output.from(rate.destAmount), tx),
        ]).quote([input], destination);
    });
};
//# sourceMappingURL=Paraswap.js.map