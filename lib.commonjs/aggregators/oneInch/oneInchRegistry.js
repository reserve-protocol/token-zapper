"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initOneInch = exports.createEthereumRouter = void 0;
const OneInch_1 = require("../../action/OneInch");
const Swap_1 = require("../../searcher/Swap");
const DexAggregator_1 = require("../DexAggregator");
const oneInchEthApi_1 = require("./eth/oneInchEthApi");
const createEthereumRouter = (baseUrl) => {
    const api = new oneInchEthApi_1.Api({ baseUrl });
    return {
        quote: async (inputQrt, output) => {
            const out = await api.v50.exchangeControllerGetQuote({
                fromTokenAddress: inputQrt.token.address.address,
                toTokenAddress: output.address.address,
                amount: inputQrt.amount.toString(),
            });
            return out.data;
        },
        swap: async (fromAddress, toAddress, inputQty, output, slippage) => {
            const params = {
                fromAddress: fromAddress.address,
                fromTokenAddress: inputQty.token.address.address,
                toTokenAddress: output.address.address,
                destReceiver: toAddress.address,
                slippage,
                amount: inputQty.amount.toString(),
                disableEstimate: true,
            };
            const out = await api.v50.exchangeControllerGetSwap(params);
            return out.data;
        },
    };
};
exports.createEthereumRouter = createEthereumRouter;
const initOneInch = (universe, baseUrl) => {
    const oneInchRouter = (0, exports.createEthereumRouter)(baseUrl);
    return new DexAggregator_1.DexAggregator('1inch', async (user, destination, input, output, slippage) => {
        const swap = await oneInchRouter.swap(user, destination, input, output, slippage);
        return await new Swap_1.SwapPlan(universe, [
            OneInch_1.OneInchAction.createAction(universe, input.token, output, swap),
        ]).quote([input], destination);
    });
};
exports.initOneInch = initOneInch;
//# sourceMappingURL=oneInchRegistry.js.map