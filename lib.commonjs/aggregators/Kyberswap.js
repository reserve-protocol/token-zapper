"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createKyberswap = void 0;
const __1 = require("..");
const Action_1 = require("../action/Action");
const Swap_1 = require("../searcher/Swap");
const DexAggregator_1 = require("./DexAggregator");
const Approval_1 = require("../base/Approval");
const contracts_1 = require("../contracts");
const ReserveAddresses_1 = require("../configuration/ReserveAddresses");
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
    const req = await fetchRoute(abort, universe, quantityIn, tokenOut);
    const swap = await fetchSwap(abort, universe, req, dest, slippage);
    return {
        block: universe.currentBlock,
        quantityIn,
        output: tokenOut,
        swap,
        req,
        addresesInUse: new Set(req.data.routeSummary.route
            .map((i) => i.map((ii) => __1.Address.from(ii.pool)))
            .flat()
            .filter((i) => universe.tokens.has(i))),
        slippage,
    };
};
class KyberAction extends (0, Action_1.Action)('Kyberswap') {
    request;
    universe;
    get oneUsePrZap() {
        return true;
    }
    get addressesInUse() {
        return this.request.addresesInUse;
    }
    get outputSlippage() {
        return 100n;
    }
    async plan(planner, _, __, predicted) {
        try {
            const zapperLib = this.gen.Contract.createContract(contracts_1.ZapperExecutor__factory.connect(this.universe.config.addresses.executorAddress.address, this.universe.provider));
            const minOut = await this.quoteWithSlippage(predicted);
            planner.add(zapperLib.rawCall(this.request.req.data.routerAddress, 0, this.request.swap.data.data), `kyberswap,router=${this.request.swap.data.routerAddress},swap=${predicted.join(', ')} -> ${minOut.join(', ')},route=${this.request.req.data.routeSummary.route
                .flat()
                .map((i) => `(${i.poolType})`)
                .join(' -> ')}`);
            return this.outputBalanceOf(this.universe, planner);
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
    return new DexAggregator_1.DexRouter(aggregatorName, async (abort, _, destination, input, output, slippage) => {
        const req = await getQuoteAndSwap(abort, universe, input, output, destination, slippage);
        if (req?.swap?.data?.data == null) {
            throw new Error('Failed');
        }
        // console.log(JSON.stringify(req.req.data, null, 2))
        return await new Swap_1.SwapPlan(universe, [
            new KyberAction(req, universe),
        ]).quote([input], destination);
    }, false);
};
exports.createKyberswap = createKyberswap;
//# sourceMappingURL=Kyberswap.js.map