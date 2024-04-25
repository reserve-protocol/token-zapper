"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupUniswapRouter = exports.UniswapRouterAction = void 0;
const tslib_1 = require("tslib");
const router_sdk_1 = require("@uniswap/router-sdk");
const sdk_core_1 = require("@uniswap/sdk-core");
const v3_sdk_1 = require("@uniswap/v3-sdk");
const default_token_list_1 = tslib_1.__importDefault(require("@uniswap/default-token-list"));
const smart_order_router_1 = require("@uniswap/smart-order-router");
const Action_1 = require("../action/Action");
const DexAggregator_1 = require("../aggregators/DexAggregator");
const Address_1 = require("../base/Address");
const Approval_1 = require("../base/Approval");
const constants_1 = require("../base/constants");
const contracts_1 = require("../contracts");
const Planner_1 = require("../tx-gen/Planner");
const portion_provider_1 = require("@uniswap/smart-order-router/build/main/providers/portion-provider");
const token_fee_fetcher_1 = require("@uniswap/smart-order-router/build/main/providers/token-fee-fetcher");
const ethers_1 = require("ethers");
const node_cache_1 = tslib_1.__importDefault(require("node-cache"));
const RouterAction_1 = require("../action/RouterAction");
const Swap_1 = require("../searcher/Swap");
const abi_1 = require("@ethersproject/abi");
const SLIPPAGE = new sdk_core_1.Percent(50, 10000);
class UniswapRouterAction extends (0, Action_1.Action)('Uniswap') {
    route;
    inputQty;
    outputQty;
    universe;
    get outputSlippage() {
        return 3000000n;
    }
    async planV3Trade(planner, trade, input) {
        if (trade.tradeType !== sdk_core_1.TradeType.EXACT_INPUT) {
            throw new Error('Not implemented');
        }
        const v3CalLRouterLib = this.gen.Contract.createLibrary(contracts_1.UniV3RouterCall__factory.connect(this.universe.config.addresses.uniV3Router.address, this.universe.provider));
        const minOut = this.outputQty.amount - this.outputQty.amount / 1000n;
        for (const { route } of trade.swaps) {
            const singleHop = route.pools.length === 1;
            if (singleHop) {
                const exactInputSingleParams = {
                    tokenIn: this.inputToken[0].address.address,
                    tokenOut: this.outputToken[0].address.address,
                    fee: route.pools[0].fee,
                    recipient: this.universe.execAddress.address,
                    amountIn: 0,
                    amountOutMinimum: minOut,
                    sqrtPriceLimitX96: 0,
                };
                const encoded = ethers_1.utils.defaultAbiCoder.encode([
                    'address',
                    'address',
                    'uint24',
                    'address',
                    'uint256',
                    'uint256',
                    'uint160',
                ], [
                    exactInputSingleParams.tokenIn,
                    exactInputSingleParams.tokenOut,
                    exactInputSingleParams.fee,
                    exactInputSingleParams.recipient,
                    0,
                    0,
                    exactInputSingleParams.sqrtPriceLimitX96,
                ]);
                return planner.add(v3CalLRouterLib.exactInputSingle(input, exactInputSingleParams.amountOutMinimum, this.route.methodParameters.to, encoded), `UniV3.exactInputSingle(${route.input.symbol} => ${route.output.symbol})`);
            }
            else {
                const path = (0, v3_sdk_1.encodeRouteToPath)(route, false);
                return planner.add(v3CalLRouterLib.exactInput(input, minOut, this.route.methodParameters.to, this.universe.execAddress.address, (0, v3_sdk_1.toHex)(path)), `UniV3.exactInput(${route.input.symbol} => ${route.output.symbol})`);
            }
        }
        throw new Error('Not implemented');
    }
    async plan(planner, [input], destination, [staticInput]) {
        let inp = input ?? (0, Planner_1.encodeArg)(staticInput.amount, abi_1.ParamType.from('uint256'));
        for (const { route, inputAmount, outputAmount } of this.route.trade.swaps) {
            if (route.protocol === router_sdk_1.Protocol.V3) {
                const v3Route = route;
                inp = await this.planV3Trade(planner, v3_sdk_1.Trade.createUncheckedTrade({
                    route: v3Route,
                    inputAmount: inputAmount,
                    outputAmount: outputAmount,
                    tradeType: sdk_core_1.TradeType.EXACT_INPUT,
                }), inp);
            }
            else {
                throw new Error('Not implemented');
            }
        }
        if (inp == null) {
            throw new Error('Failed to plan');
        }
        return [inp];
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
        const out = this.route.estimatedGasUsed.toBigInt();
        return out === 0n ? 300000n : out;
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
    const tokenCache = new smart_order_router_1.NodeJSCache(new node_cache_1.default({ stdTTL: 3600, useClones: false }));
    const multicall = new smart_order_router_1.UniswapMulticallProvider(universe.chainId, universe.provider, 25000000);
    const tokenProviderOnChain = new smart_order_router_1.TokenProvider(universe.chainId, multicall);
    const cachingTokenProvider = new smart_order_router_1.CachingTokenProviderWithFallback(universe.chainId, tokenCache, await smart_order_router_1.CachingTokenListProvider.fromTokenList(universe.chainId, default_token_list_1.default, tokenCache), tokenProviderOnChain);
    const gasPriceCache = new smart_order_router_1.NodeJSCache(new node_cache_1.default({ stdTTL: 15, useClones: true }));
    const v3PoolProvider = new smart_order_router_1.CachingV3PoolProvider(universe.chainId, new smart_order_router_1.V3PoolProvider(universe.chainId, multicall), new smart_order_router_1.NodeJSCache(new node_cache_1.default({ stdTTL: 360, useClones: false })));
    const tokenFeeFetcher = new token_fee_fetcher_1.OnChainTokenFeeFetcher(universe.chainId, universe.provider);
    const tokenPropertiesProvider = new smart_order_router_1.TokenPropertiesProvider(universe.chainId, new smart_order_router_1.NodeJSCache(new node_cache_1.default({ stdTTL: 360, useClones: false })), tokenFeeFetcher);
    const portionProvider = new portion_provider_1.PortionProvider();
    const v2PoolProvider = new smart_order_router_1.CachingV2PoolProvider(universe.chainId, new smart_order_router_1.V2PoolProvider(universe.chainId, multicall, tokenPropertiesProvider), new smart_order_router_1.NodeJSCache(new node_cache_1.default({ stdTTL: 360, useClones: false })));
    const router = new smart_order_router_1.LegacyRouter({
        chainId: universe.chainId,
        multicall2Provider: multicall,
        poolProvider: v3PoolProvider,
        quoteProvider: new smart_order_router_1.OnChainQuoteProvider(universe.chainId, universe.provider, multicall),
        tokenProvider: cachingTokenProvider,
    });
    /*new AlphaRouter({
      chainId: universe.chainId,
      provider: universe.provider,
      gasPriceProvider: new CachingGasStationProvider(
        universe.chainId,
        new OnChainGasPriceProvider(
          universe.chainId,
          new EIP1559GasPriceProvider(universe.provider),
          new LegacyGasPriceProvider(universe.provider)
        ),
        gasPriceCache
      ),
      multicall2Provider: multicall,
      portionProvider,
      v2PoolProvider: v2PoolProvider,
      v3PoolProvider: v3PoolProvider,
      tokenPropertiesProvider,
      tokenProvider: cachingTokenProvider,
    })*/
    const out = new DexAggregator_1.DexRouter('uniswap', async (src, dst, input, output, slippage) => {
        let outPath = null;
        const inp = tokenQtyToCurrencyAmt(universe, input);
        const outp = ourTokenToUni(universe, output);
        const route = await router.route(inp, outp, sdk_core_1.TradeType.EXACT_INPUT, {
            recipient: universe.execAddress.address,
            slippageTolerance: SLIPPAGE,
            deadline: Math.floor(Date.now() / 1000 + 1800),
            type: smart_order_router_1.SwapType.SWAP_ROUTER_02,
        });
        if (route == null || route.methodParameters == null) {
            throw new Error('Failed to find route');
        }
        const outamt = BigInt(route.trade.minimumAmountOut(SLIPPAGE).quotient.toString());
        const outputAmt = output.from(outamt);
        return await new Swap_1.SwapPlan(universe, [
            new UniswapRouterAction(route, input, outputAmt, universe),
        ]).quote([input], universe.execAddress);
    }, true);
    universe.dexAggregators.push(out);
    const routerAddr = Address_1.Address.from((0, sdk_core_1.SWAP_ROUTER_02_ADDRESSES)(universe.chainId));
    return {
        dex: out,
        addTradeAction: (inputToken, outputToken) => {
            universe.addAction(new ((0, RouterAction_1.RouterAction)('Uniswap'))(out, universe, routerAddr, inputToken, outputToken), routerAddr);
        },
    };
};
exports.setupUniswapRouter = setupUniswapRouter;
//# sourceMappingURL=setupUniswapRouter.js.map