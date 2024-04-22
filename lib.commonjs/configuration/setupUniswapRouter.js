"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupUniswapRouter = exports.UniswapRouterAction = void 0;
const constants_1 = require("../base/constants");
const smart_order_router_1 = require("@uniswap/smart-order-router");
const DexAggregator_1 = require("../aggregators/DexAggregator");
const sdk_core_1 = require("@uniswap/sdk-core");
const Action_1 = require("../action/Action");
const contracts_1 = require("../contracts");
const Address_1 = require("../base/Address");
const Approval_1 = require("../base/Approval");
const Swap_1 = require("../searcher/Swap");
class UniswapRouterAction extends Action_1.Action {
    route;
    inputQty;
    outputQty;
    universe;
    async plan(planner, _, destination) {
        const zapperLib = this.gen.Contract.createContract(contracts_1.ZapperExecutor__factory.connect(this.universe.config.addresses.executorAddress.address, this.universe.provider));
        planner.add(zapperLib.rawCall(this.route.methodParameters.to, this.route.methodParameters.value, this.route.methodParameters.calldata), `UniswapSmartRouter ${this.inputQty} => ${this.outputQty}`);
        const out = this.genUtils.erc20.balanceOf(this.universe, planner, this.output[0], destination, 'UniswapRouter,after swap', `bal_${this.output[0].symbol}_after`);
        return [out];
    }
    constructor(route, inputQty, outputQty, universe) {
        super(Address_1.Address.from(route.methodParameters.to), [inputQty.token], [outputQty.token], Action_1.InteractionConvention.ApprovalRequired, Action_1.DestinationOptions.Callee, [new Approval_1.Approval(inputQty.token, Address_1.Address.from(route.methodParameters.to))]);
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
exports.UniswapRouterAction = UniswapRouterAction;
const ourTokenToUni = (universe, token) => {
    if (token.address.address === constants_1.GAS_TOKEN_ADDRESS) {
        return sdk_core_1.Ether.onChain(universe.chainId);
    }
    return new sdk_core_1.Token(universe.chainId, token.address.address, token.decimals, token.symbol, token.name);
};
const tokenQtyToCurrencyAmt = (universe, qty) => {
    const uniToken = ourTokenToUni(universe, qty.token);
    return smart_order_router_1.CurrencyAmount.fromRawAmount(uniToken, qty.amount.toString());
};
const setupUniswapRouter = async (universe) => {
    const router = new smart_order_router_1.AlphaRouter({
        chainId: universe.chainId,
        provider: universe.provider,
    });
    universe.dexAggregators.push(new DexAggregator_1.DexAggregator('uniswap', async (src, dst, input, output, slippage) => {
        const inp = tokenQtyToCurrencyAmt(universe, input);
        const outp = ourTokenToUni(universe, output);
        const route = await router.route(inp, outp, sdk_core_1.TradeType.EXACT_INPUT, {
            recipient: universe.execAddress.address,
            slippageTolerance: new sdk_core_1.Percent(50, 10000),
            deadline: Math.floor(Date.now() / 1000 + 1800),
            type: smart_order_router_1.SwapType.SWAP_ROUTER_02,
        });
        if (route == null || route.methodParameters == null) {
            throw new Error('Failed to find route');
        }
        const outputAmt = output.fromBigInt(BigInt(route.trade.outputAmount.quotient.toString()));
        return await new Swap_1.SwapPlan(universe, [
            new UniswapRouterAction(route, input, outputAmt, universe),
        ]).quote([input], dst);
    }));
};
exports.setupUniswapRouter = setupUniswapRouter;
//# sourceMappingURL=setupUniswapRouter.js.map