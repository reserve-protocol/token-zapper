import { constructSimpleSDK, SwapSide } from '@paraswap/sdk';
import { Action, DestinationOptions, InteractionConvention, } from '../action/Action';
import { Address } from '../base/Address';
import { Approval } from '../base/Approval';
import { SwapPlan } from '../searcher/Swap';
import { DexRouter, TradingVenue } from './DexAggregator';
class ParaswapAction extends Action('Paraswap') {
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
        return 0n;
    }
    async plan(planner, _, __, predicted) {
        const minOut = await this.quoteWithSlippage(predicted);
        const zapperLib = this.universe.weirollZapperExec;
        planner.add(zapperLib.rawCall(this.request.request.tx.to, 0, this.request.request.tx.data), `paraswap,router=${this.request.request.tx.to},swap=${predicted.join(', ')} -> ${minOut.join(', ')},pools=${[...this.addressesInUse].join(', ')}`);
        return null;
    }
    constructor(request, universe) {
        super(Address.from(request.request.tx.to), [request.quantityIn.token], [request.output], InteractionConvention.ApprovalRequired, DestinationOptions.Callee, [
            new Approval(request.quantityIn.token, Address.from(request.request.rate.tokenTransferProxy)),
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
        return `Paraswap(${this.request.quantityIn} => ${this.outputQty})`;
    }
    async quote(_) {
        return [this.outputQty];
    }
    gasEstimate() {
        return BigInt(this.request.request.rate.gasCost);
    }
}
export const createParaswap = (aggregatorName, universe) => {
    const client = constructSimpleSDK({
        chainId: universe.chainId,
        fetch: fetch,
        version: '5',
    });
    const router = new DexRouter(aggregatorName, async (abort, input, output, slippage) => {
        try {
            let rate = await client.swap.getRate({
                userAddress: universe.execAddress.address,
                srcDecimals: input.token.decimals,
                destDecimals: output.decimals,
                srcToken: input.token.address.address,
                destToken: output.address.address,
                amount: input.amount.toString(),
                side: SwapSide.SELL,
            }, abort);
            const tx = await client.swap.buildTx({
                srcToken: input.token.address.address,
                destToken: output.address.address,
                slippage: Number(slippage),
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
                        for (const addr of (exchange.poolAddresses ?? []).map(Address.from)) {
                            const tok = universe.tokens.get(addr);
                            if (tok != null) {
                                if (!universe.lpTokens.has(tok)) {
                                    continue;
                                }
                            }
                            addrs.add(addr);
                        }
                    }
                }
            }
            const out = await new SwapPlan(universe, [
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
        }
        catch (e) {
            throw e;
        }
    }, false).withMaxConcurrency(4);
    return new TradingVenue(universe, router);
};
//# sourceMappingURL=Paraswap.js.map