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
    constructor(request, universe) {
        super(Address.from(request.req.data.routerAddress), [request.quantityIn.token], [request.output], InteractionConvention.ApprovalRequired, DestinationOptions.Recipient, [
            new Approval(request.quantityIn.token, Address.from(request.req.data.routerAddress)),
        ]);
        this.request = request;
        this.universe = universe;
    }
    async quote(_) {
        const out = this.output[0].from(BigInt(this.request.swap.data.amountOut));
        return [out];
    }
    gasEstimate() {
        return 200000n;
    }
    async encode(inputs, __) {
        return new ContractCall(parseHexStringIntoBuffer(this.request.swap.data.data), Address.from(this.request.req.data.routerAddress), 0n, this.gasEstimate(), `Kyberswap(${this.address}) (${inputs.join(",")}) -> (${await this.quote(inputs)})`);
    }
}
export const createKyberswap = (aggregatorName, universe) => {
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
                slippageTolerance: 10,
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
    return new DexAggregator(aggregatorName, async (_, destination, input, output, slippage) => {
        const req = await getQuoteAndSwap(input, output, destination);
        return await new SwapPlan(universe, [
            new KyberAction(req, universe),
        ]).quote([input], destination);
    });
};
//# sourceMappingURL=Kyberswap.js.map