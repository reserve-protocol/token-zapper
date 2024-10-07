"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createKyberswap = void 0;
const __1 = require("..");
const Action_1 = require("../action/Action");
const Swap_1 = require("../searcher/Swap");
const DexAggregator_1 = require("./DexAggregator");
const Approval_1 = require("../base/Approval");
const ReserveAddresses_1 = require("../configuration/ReserveAddresses");
const utils_1 = require("ethers/lib/utils");
const utils_2 = require("../base/utils");
const idToSlug = {
    [ReserveAddresses_1.ChainIds.Mainnet]: 'ethereum',
    [ReserveAddresses_1.ChainIds.Base]: 'base',
    [ReserveAddresses_1.ChainIds.Arbitrum]: 'arbitrum',
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
            slippageTolerance: Number(slippage),
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
    const swap = await fetchSwap(control.signal, universe, req, dest, slippage * 10n);
    const addrs = new Set(req.data.routeSummary.route
        .map((i) => {
        const out = i.map((ii) => {
            try {
                if (!ii.pool.startsWith('0x')) {
                    const tok1 = __1.Address.from(ii.tokenIn);
                    const tok2 = __1.Address.from(ii.tokenOut);
                    const [a, b] = tok1.gt(tok2) ? [tok1, tok2] : [tok2, tok1];
                    const mix = (0, utils_2.parseHexStringIntoBuffer)((0, utils_1.hexZeroPad)('0x' + (a.integer ^ b.integer).toString(16), 20).toLowerCase());
                    const custom = __1.Address.from(mix);
                    return custom;
                }
                return __1.Address.from(ii.pool.toLowerCase());
            }
            catch (e) {
                console.log(e);
                console.log(ii.pool);
                return universe.wrappedNativeToken.address;
            }
        });
        return out;
    })
        .flat()
        .filter((i) => {
        const tok = universe.tokens.get(i);
        if (!tok) {
            return true;
        }
        return universe.lpTokens.has(tok);
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
class KyberAction extends (0, Action_1.Action)('Kyberswap') {
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
        return 30n;
    }
    async plan(planner, _, __, predicted) {
        try {
            const zapperLib = this.universe.weirollZapperExec;
            const minOut = await this.quoteWithSlippage(predicted);
            planner.add(zapperLib.rawCall(this.request.req.data.routerAddress, 0, this.request.swap.data.data), `kyberswap,router=${this.request.swap.data.routerAddress},swap=${predicted.join(', ')} -> ${minOut.join(', ')},pools=${[
                ...this.request.addresesInUse,
            ].join(', ')}`);
            return null;
        }
        catch (e) {
            console.log(e.stack);
            throw e;
        }
    }
    constructor(request, universe) {
        super(__1.Address.from(request.req.data.routerAddress), [request.quantityIn.token], [request.output], Action_1.InteractionConvention.ApprovalRequired, Action_1.DestinationOptions.Callee, [
            new Approval_1.Approval(request.quantityIn.token, __1.Address.from(request.req.data.routerAddress)),
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
const createKyberswap = (aggregatorName, universe) => {
    if (idToSlug[universe.chainId] == null) {
        throw new Error('Kyberswap: Unsupported chain');
    }
    const dex = new DexAggregator_1.DexRouter(aggregatorName, async (abort, input, output, slippage) => {
        const req = await getQuoteAndSwap(abort, universe, input, output, universe.execAddress, slippage);
        if (req.swap.data == null || req.swap.data.data == null) {
            throw new Error('Kyberswap: No swap data');
        }
        return await new Swap_1.SwapPlan(universe, [
            new KyberAction(req, universe),
        ]).quote([input], universe.execAddress);
    }, false).withMaxConcurrency(10);
    return new DexAggregator_1.TradingVenue(universe, dex);
};
exports.createKyberswap = createKyberswap;
//# sourceMappingURL=Kyberswap.js.map