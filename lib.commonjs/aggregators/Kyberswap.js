"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createKyberswap = void 0;
const DexAggregator_1 = require("./DexAggregator");
const Swap_1 = require("../searcher/Swap");
const __1 = require("..");
const Action_1 = require("../action/Action");
const ContractCall_1 = require("../base/ContractCall");
const Approval_1 = require("../base/Approval");
const utils_1 = require("../base/utils");
const idToSlug = {
    1: 'ethereum',
    8453: 'base',
};
class KyberAction extends Action_1.Action {
    request;
    universe;
    slippage;
    outputQuantity = [];
    constructor(request, universe, slippage) {
        super(__1.Address.from(request.req.data.routerAddress), [request.quantityIn.token], [request.output], Action_1.InteractionConvention.ApprovalRequired, Action_1.DestinationOptions.Recipient, [
            new Approval_1.Approval(request.quantityIn.token, __1.Address.from(request.req.data.routerAddress)),
        ]);
        this.request = request;
        this.universe = universe;
        this.slippage = slippage;
        const amount = BigInt(this.request.swap.data.amountOut);
        const minOut = amount - (amount / 10000n * BigInt(this.slippage));
        const out = this.output[0].from(minOut);
        this.outputQuantity = [out];
    }
    toString() {
        return `Kyberswap(${this.request.quantityIn} => ${this.request.output})`;
    }
    async quote(_) {
        return this.outputQuantity;
    }
    gasEstimate() {
        return BigInt(this.request.req.data.routeSummary.gas);
    }
    async encode(inputs, __) {
        return new ContractCall_1.ContractCall((0, utils_1.parseHexStringIntoBuffer)(this.request.swap.data.data), __1.Address.from(this.request.req.data.routerAddress), 0n, this.gasEstimate(), `Kyberswap(${this.address}) (${inputs.join(",")}) -> (${this.outputQuantity})`);
    }
}
const createKyberswap = (aggregatorName, universe, slippage) => {
    if (idToSlug[universe.chainId] == null) {
        throw new Error('Kyberswap: Unsupported chain');
    }
    const GET_ROUTE_SWAP = `https://aggregator-api.kyberswap.com/${idToSlug[universe.chainId]}/api/v1/routes`;
    const POST_GET_SWAP = `https://aggregator-api.kyberswap.com/${idToSlug[universe.chainId]}/api/v1/route/build`;
    const fetchRoute = async (quantityIn, tokenOut) => {
        const url = `${GET_ROUTE_SWAP}?source=register&amountIn=${quantityIn.amount}&tokenIn=${quantityIn.token.address.address}&tokenOut=${tokenOut.address.address}`;
        return fetch(url, {
            method: 'GET',
            headers: {
                'x-client-id': 'register',
            },
        }).then((res) => res.json());
    };
    const fetchSwap = async (req, recipient) => {
        return fetch(`${POST_GET_SWAP}?source=register`, {
            method: 'POST',
            body: JSON.stringify({
                ...req.data,
                sender: universe.config.addresses.executorAddress.address,
                recipient: recipient.address,
                skipSimulateTx: true,
                slippageTolerance: slippage,
                source: "register"
            }),
            headers: {
                'Content-Type': 'application/json',
                'x-client-id': 'register',
            },
        }).then((res) => res.json());
    };
    const getQuoteAndSwap = async (quantityIn, tokenOut, recipient) => {
        const req = await fetchRoute(quantityIn, tokenOut);
        const swap = await fetchSwap(req, recipient);
        return {
            quantityIn,
            output: tokenOut,
            swap,
            req,
        };
    };
    return new DexAggregator_1.DexAggregator(aggregatorName, async (_, destination, input, output, __) => {
        const req = await getQuoteAndSwap(input, output, destination);
        return await new Swap_1.SwapPlan(universe, [
            new KyberAction(req, universe, slippage),
        ]).quote([input], destination);
    });
};
exports.createKyberswap = createKyberswap;
//# sourceMappingURL=Kyberswap.js.map