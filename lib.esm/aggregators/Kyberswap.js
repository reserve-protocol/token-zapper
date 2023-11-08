import { DexAggregator } from './DexAggregator';
import { SwapPlan } from '../searcher/Swap';
import { Address } from '..';
import { Action, DestinationOptions, InteractionConvention, } from '../action/Action';
import { ContractCall } from '../base/ContractCall';
import { Approval } from '../base/Approval';
import { parseHexStringIntoBuffer } from '../base/utils';
const idToSlug = {
    1: 'ethereum',
    8453: 'base',
};
class KyberAction extends Action {
    request;
    universe;
    slippage;
    outputQuantity = [];
    constructor(request, universe, slippage) {
        super(Address.from(request.req.data.routerAddress), [request.quantityIn.token], [request.output], InteractionConvention.ApprovalRequired, DestinationOptions.Recipient, [
            new Approval(request.quantityIn.token, Address.from(request.req.data.routerAddress)),
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
        return new ContractCall(parseHexStringIntoBuffer(this.request.swap.data.data), Address.from(this.request.req.data.routerAddress), 0n, this.gasEstimate(), `Kyberswap(${this.address}) (${inputs.join(",")}) -> (${this.outputQuantity})`);
    }
}
export const createKyberswap = (aggregatorName, universe, slippage) => {
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
    return new DexAggregator(aggregatorName, async (_, destination, input, output, __) => {
        const req = await getQuoteAndSwap(input, output, destination);
        return await new SwapPlan(universe, [
            new KyberAction(req, universe, slippage),
        ]).quote([input], destination);
    });
};
//# sourceMappingURL=Kyberswap.js.map