import { constructSimpleSDK, SwapSide } from '@paraswap/sdk';
import { Action, DestinationOptions, InteractionConvention, } from '../action/Action';
import { Address } from '../base/Address';
import { ZapperExecutor__factory } from '../contracts/factories/contracts/Zapper.sol/ZapperExecutor__factory';
import { Approval } from '../base/Approval';
import { DexRouter, TradingVenue } from './DexAggregator';
import { SwapPlan } from '../searcher/Swap';
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
        try {
            const zapperLib = this.gen.Contract.createLibrary(ZapperExecutor__factory.connect(this.universe.config.addresses.executorAddress.address, this.universe.provider));
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
        super(Address.from(request.request.tx.to), [request.quantityIn.token], [request.output], InteractionConvention.ApprovalRequired, DestinationOptions.Callee, [
            new Approval(request.quantityIn.token, Address.from(request.request.tx.to)),
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
export const createParaswap = (aggregatorName, universe) => {
    const client = constructSimpleSDK({
        chainId: universe.chainId,
        fetch: fetch,
        version: '5',
    });
    const router = new DexRouter(aggregatorName, async (abort, input, output, slippage) => {
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
                    for (const addr of exchange.poolAddresses?.map(Address.from) ??
                        []) {
                        const token = universe.tokens.get(addr);
                        if (token) {
                            if (universe.lpTokens.has(token)) {
                                addrs.add(addr);
                            }
                            else {
                                // console.log('para ' + addr)
                            }
                            continue;
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
    }, false).withMaxConcurrency(8);
    return new TradingVenue(universe, router);
};
//# sourceMappingURL=Paraswap.js.map