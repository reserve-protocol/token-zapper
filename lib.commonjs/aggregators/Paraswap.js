"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createParaswap = void 0;
const sdk_1 = require("@paraswap/sdk");
const Action_1 = require("../action/Action");
const Address_1 = require("../base/Address");
const ZapperExecutor__factory_1 = require("../contracts/factories/contracts/Zapper.sol/ZapperExecutor__factory");
const Approval_1 = require("../base/Approval");
const DexAggregator_1 = require("./DexAggregator");
const Swap_1 = require("../searcher/Swap");
class ParaswapAction extends (0, Action_1.Action)('Kyberswap') {
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
            const zapperLib = this.gen.Contract.createLibrary(ZapperExecutor__factory_1.ZapperExecutor__factory.connect(this.universe.config.addresses.executorAddress.address, this.universe.provider));
            const minOut = await this.quoteWithSlippage(predicted);
            planner.add(zapperLib.rawCall(this.request.request.tx.to, 0, this.request.request.tx.data), `paraswap,router=${this.request.request.tx.to},swap=${predicted.join(', ')} -> ${minOut.join(', ')},pools=${[...this.request.addresesInUse].join(', ')}`);
            return null;
        }
        catch (e) {
            console.log(e.stack);
            throw e;
        }
    }
    constructor(request, universe) {
        super(Address_1.Address.from(request.request.tx.to), [request.quantityIn.token], [request.output], Action_1.InteractionConvention.ApprovalRequired, Action_1.DestinationOptions.Callee, [
            new Approval_1.Approval(request.quantityIn.token, Address_1.Address.from(request.request.tx.to)),
        ]);
        this.request = request;
        this.universe = universe;
    }
    get supportsDynamicInput() {
        return false;
    }
    get outputQty() {
        return this.request.quantityOut;
    }
    toString() {
        return `Kyberswap(${this.request.quantityIn} => ${this.outputQty})`;
    }
    async quote(_) {
        return [this.outputQty];
    }
    gasEstimate() {
        return BigInt(this.request.request.rate.gasCost);
    }
}
const createParaswap = (aggregatorName, universe) => {
    const client = (0, sdk_1.constructSimpleSDK)({
        chainId: universe.chainId,
        fetch: fetch,
        version: '5',
    });
    const router = new DexAggregator_1.DexRouter(aggregatorName, async (abort, input, output, slippage) => {
        let rate = await client.swap.getRate({
            userAddress: universe.execAddress.address,
            srcDecimals: input.token.decimals,
            destDecimals: output.decimals,
            srcToken: input.token.address.address,
            destToken: output.address.address,
            amount: input.amount.toString(),
            side: sdk_1.SwapSide.SELL,
        }, abort);
        const tx = await client.swap.buildTx({
            srcToken: input.token.address.address,
            destToken: output.address.address,
            destAmount: rate.destAmount,
            srcAmount: input.amount.toString(),
            priceRoute: rate,
            userAddress: universe.execAddress.address,
        }, {
            ignoreAllowance: true,
            ignoreGasEstimate: true,
            ignoreChecks: true,
        });
        const addrs = new Set();
        for (const route of rate.bestRoute) {
            for (const swap of route.swaps) {
                for (const exchange of swap.swapExchanges) {
                    for (const addr of exchange.poolAddresses?.map(Address_1.Address.from) ??
                        []) {
                        if (universe.tokens.has(addr)) {
                            continue;
                        }
                        addrs.add(addr);
                    }
                }
            }
        }
        const out = await new Swap_1.SwapPlan(universe, [
            new ParaswapAction({
                addresesInUse: addrs,
                quantityIn: input,
                quantityOut: output.from(BigInt(rate.destAmount)),
                output: output,
                request: {
                    rate,
                    tx: tx,
                },
            }, universe),
        ]).quote([input], universe.execAddress);
        return out;
    }, false).withMaxConcurrency(8);
    return new DexAggregator_1.TradingVenue(universe, router);
};
exports.createParaswap = createParaswap;
//# sourceMappingURL=Paraswap.js.map