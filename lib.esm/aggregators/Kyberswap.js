import { Address } from '..';
import { Action, DestinationOptions, InteractionConvention, } from '../action/Action';
import { SwapPlan } from '../searcher/Swap';
import { DexRouter, TradingVenue } from './DexAggregator';
import { Approval } from '../base/Approval';
import { ZapperExecutor__factory } from '../contracts';
import { ChainIds } from '../configuration/ReserveAddresses';
const idToSlug = {
    [ChainIds.Mainnet]: 'ethereum',
    [ChainIds.Base]: 'base',
    [ChainIds.Arbitrum]: 'arbitrum',
};
const fetchRoute = async (abort, universe, quantityIn, tokenOut) => {
    const GET_ROUTE_SWAP = `https://aggregator-api.kyberswap.com/${idToSlug[universe.chainId]}/api/v1/routes`;
    const url = `${GET_ROUTE_SWAP}?source=register&amountIn=${quantityIn.amount}&tokenIn=${quantityIn.token.address.address}&tokenOut=${tokenOut.address.address}`;
    return fetch(url, {
        method: 'GET',
        signal: abort,
        headers: {
            'x-client-id': 'register',
        },
    }).then((res) => res.json());
};
const fetchSwap = async (abort, universe, req, recipient, slippage) => {
    const POST_GET_SWAP = `https://aggregator-api.kyberswap.com/${idToSlug[universe.chainId]}/api/v1/route/build`;
    return fetch(`${POST_GET_SWAP}?source=register`, {
        method: 'POST',
        signal: abort,
        body: JSON.stringify({
            ...req.data,
            sender: universe.execAddress.address,
            recipient: recipient.address,
            skipSimulateTx: true,
            slippageTolerance: Number(slippage) / 10,
            source: 'register',
        }),
        headers: {
            'Content-Type': 'application/json',
            'x-client-id': 'register',
        },
    }).then((res) => res.json());
};
const getQuoteAndSwap = async (abort, universe, quantityIn, tokenOut, _, slippage) => {
    const dest = universe.execAddress;
    const control = new AbortController();
    abort.addEventListener('abort', () => {
        if (control.signal.aborted)
            return;
        control.abort();
    });
    setTimeout(() => {
        if (control.signal.aborted)
            return;
        control.abort();
    }, universe.config.routerDeadline);
    const req = await fetchRoute(control.signal, universe, quantityIn, tokenOut);
    const swap = await fetchSwap(control.signal, universe, req, dest, slippage);
    const addrs = new Set(req.data.routeSummary.route
        .map((i) => {
        // console.log(JSON.stringify(i, null, 2))
        const out = i.map((ii) => {
            try {
                return Address.from(ii.pool);
            }
            catch (e) {
                // console.log(ii.pool)
                return universe.wrappedNativeToken.address;
            }
        });
        return out;
    })
        .flat()
        .filter((i) => {
        if (!universe.tokens.has(i)) {
            return true;
        }
        const tok = universe.tokens.get(i);
        if (universe.lpTokens.has(tok)) {
            return true;
        }
        return false;
    }));
    return {
        block: universe.currentBlock,
        quantityIn,
        output: tokenOut,
        swap,
        req,
        addresesInUse: addrs,
        slippage,
    };
};
class KyberAction extends Action('Kyberswap') {
    request;
    universe;
    get oneUsePrZap() {
        return true;
    }
    get returnsOutput() {
        return false;
    }
    get addressesInUse() {
        return this.request.addresesInUse;
    }
    get outputSlippage() {
        return 1n;
    }
    async plan(planner, _, __, predicted) {
        try {
            const zapperLib = this.gen.Contract.createLibrary(ZapperExecutor__factory.connect(this.universe.config.addresses.executorAddress.address, this.universe.provider));
            const minOut = await this.quoteWithSlippage(predicted);
            planner.add(zapperLib.rawCall(this.request.req.data.routerAddress, 0, this.request.swap.data.data), `kyberswap,router=${this.request.swap.data.routerAddress},swap=${predicted.join(', ')} -> ${minOut.join(', ')},pools=${[...this.request.addresesInUse].join(", ")}`);
            return null;
        }
        catch (e) {
            console.log(e.stack);
            throw e;
        }
    }
    constructor(request, universe) {
        super(Address.from(request.req.data.routerAddress), [request.quantityIn.token], [request.output], InteractionConvention.ApprovalRequired, DestinationOptions.Callee, [
            new Approval(request.quantityIn.token, Address.from(request.req.data.routerAddress)),
        ]);
        this.request = request;
        this.universe = universe;
    }
    get supportsDynamicInput() {
        return false;
    }
    get outputQty() {
        return this.request.output.from(BigInt(this.request.req.data.routeSummary.amountOut));
    }
    toString() {
        return `Kyberswap(${this.request.quantityIn} => ${this.outputQty})`;
    }
    async quote(_) {
        return [this.outputQty];
    }
    gasEstimate() {
        return BigInt(this.request.req.data.routeSummary.gas);
    }
}
export const createKyberswap = (aggregatorName, universe) => {
    if (idToSlug[universe.chainId] == null) {
        throw new Error('Kyberswap: Unsupported chain');
    }
    const dex = new DexRouter(aggregatorName, async (abort, input, output, slippage) => {
        const req = await getQuoteAndSwap(abort, universe, input, output, universe.execAddress, slippage);
        if (req.swap.data == null || req.swap.data.data == null) {
            throw new Error('Kyberswap: No swap data');
        }
        return await new SwapPlan(universe, [
            new KyberAction(req, universe),
        ]).quote([input], universe.execAddress);
    }, false).withMaxConcurrency(4);
    return new TradingVenue(universe, dex);
};
//# sourceMappingURL=Kyberswap.js.map