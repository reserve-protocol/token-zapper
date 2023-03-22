"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEthereumRouter = void 0;
const oneInchEthApi_1 = require("./eth/oneInchEthApi");
const createEthereumRouter = () => {
    const api = new oneInchEthApi_1.Api({ baseUrl: 'https://api.1inch.io' });
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
//# sourceMappingURL=oneInchRegistry.js.map