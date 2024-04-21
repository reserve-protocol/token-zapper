import { GAS_TOKEN_ADDRESS } from '../base/constants';
import { AlphaRouter, CurrencyAmount, SwapType, } from '@uniswap/smart-order-router';
import { DexAggregator } from '../aggregators/DexAggregator';
import { Token as UniToken, Ether, TradeType, Percent, } from '@uniswap/sdk-core';
import { Action, DestinationOptions, InteractionConvention, } from '../action/Action';
import { ZapperExecutor__factory } from '../contracts';
import { Address } from '../base/Address';
import { Approval } from '../base/Approval';
import { SwapPlan } from '../searcher/Swap';
export class UniswapRouterAction extends Action {
    route;
    inputQty;
    outputQty;
    universe;
    encode(amountsIn, destination, bytes) {
        throw new Error('Deprecated');
    }
    async plan(planner, _, destination) {
        const zapperLib = this.gen.Contract.createContract(ZapperExecutor__factory.connect(this.universe.config.addresses.executorAddress.address, this.universe.provider));
        if (destination === this.universe.config.addresses.executorAddress) {
            planner.add(zapperLib.rawCall(this.route.methodParameters.to, this.route.methodParameters.value, this.route.methodParameters.calldata), `UniswapSmartRouter ${this.inputQty} => ${this.outputQty}`);
            const out = this.genUtils.erc20.balanceOf(this.universe, planner, this.output[0], destination, 'UniswapRouter,after swap', `bal_${this.output[0].symbol}_after`);
            planner.add(zapperLib.assertLarger(out, this.outputQty.amount - this.outputQty.amount / 100n), 'UniswapRouter,assert minimum output');
            return [out];
        }
        planner.add(zapperLib.rawCall(this.route.methodParameters.to, this.route.methodParameters.value, this.route.methodParameters.calldata), `UniswapSmartRouter ${this.inputQty} => ${this.outputQty}`);
        return [];
    }
    constructor(route, inputQty, outputQty, universe) {
        super(Address.from(route.methodParameters.to), [inputQty.token], [outputQty.token], InteractionConvention.ApprovalRequired, DestinationOptions.Recipient, [new Approval(inputQty.token, Address.from(route.methodParameters.to))]);
        this.route = route;
        this.inputQty = inputQty;
        this.outputQty = outputQty;
        this.universe = universe;
    }
    toString() {
        return `Uniswap(${this.inputQty} => ${this.outputQty})`;
    }
    async quote(_) {
        return [this.outputQty];
    }
    gasEstimate() {
        return this.route.estimatedGasUsed.toBigInt();
    }
}
const ourTokenToUni = (universe, token) => {
    if (token.address.address === GAS_TOKEN_ADDRESS) {
        return Ether.onChain(universe.chainId);
    }
    return new UniToken(universe.chainId, token.address.address, token.decimals, token.symbol, token.name);
};
const tokenQtyToCurrencyAmt = (universe, qty) => {
    const uniToken = ourTokenToUni(universe, qty.token);
    return CurrencyAmount.fromRawAmount(uniToken, qty.amount.toString());
};
export const setupUniswapRouter = async (universe) => {
    const router = new AlphaRouter({
        chainId: universe.chainId,
        provider: universe.provider,
    });
    universe.dexAggregators.push(new DexAggregator('uniswap', async (src, dst, input, output, slippage) => {
        const inp = tokenQtyToCurrencyAmt(universe, input);
        const outp = ourTokenToUni(universe, output);
        const route = await router.route(inp, outp, TradeType.EXACT_INPUT, {
            recipient: dst.address,
            slippageTolerance: new Percent(50, 10000),
            deadline: Math.floor(Date.now() / 1000 + 1800),
            type: SwapType.SWAP_ROUTER_02,
        });
        if (route == null || route.methodParameters == null) {
            throw new Error('Failed to find route');
        }
        const outputAmt = output.fromBigInt(BigInt(route.trade.outputAmount.quotient.toString()));
        // console.log(
        //   `Uniswap: ${input} -> ${outputAmt} via ${routeAmountsToString(route.route)}`
        // )
        return await new SwapPlan(universe, [
            new UniswapRouterAction(route, input, outputAmt, universe),
        ]).quote([input], dst);
    }));
};
//# sourceMappingURL=setupUniswapRouter.js.map