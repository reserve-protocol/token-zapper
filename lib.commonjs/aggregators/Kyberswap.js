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
    constructor(request, universe, slippage) {
        super(__1.Address.from(request.req.data.routerAddress), [request.quantityIn.token], [request.output], Action_1.InteractionConvention.ApprovalRequired, Action_1.DestinationOptions.Recipient, [
            new Approval_1.Approval(request.quantityIn.token, __1.Address.from(request.req.data.routerAddress)),
        ]);
        this.request = request;
        this.universe = universe;
        this.slippage = slippage;
    }
    async quote(_) {
        const amount = BigInt(this.request.swap.data.amountOut);
        const out = this.output[0].from(amount - amount / 100000n * BigInt(this.slippage));
        return [out];
    }
    gasEstimate() {
        return 200000n;
    }
    async encode(inputs, __) {
        return new ContractCall_1.ContractCall((0, utils_1.parseHexStringIntoBuffer)(this.request.swap.data.data), __1.Address.from(this.request.req.data.routerAddress), 0n, this.gasEstimate(), `Kyberswap(${this.address}) (${inputs.join(",")}) -> (${await this.quote(inputs)})`);
    }
}
const createKyberswap = (aggregatorName, universe, slippage) => {
    if (idToSlug[universe.chainId] == null) {
        throw new Error('Kyberswap: Unsupported chain');
    }
    const GET_ROUTE_SWAP = `https://aggregator-api.kyberswap.com/${idToSlug[universe.chainId]}/api/v1/routes`;
    const POST_GET_SWAP = `https://aggregator-api.kyberswap.com/${idToSlug[universe.chainId]}/api/v1/route/build`;
    const fetchRoute = async (quantityIn, tokenOut) => {
        return fetch(`${GET_ROUTE_SWAP}?source=register&amountIn=${quantityIn.amount}&tokenIn=${quantityIn.token.address.address}&tokenOut=${tokenOut.address.address}`, {
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
                recipient: recipient.address,
                slippageTolerance: slippage,
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