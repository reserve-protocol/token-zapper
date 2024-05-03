"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupUniswapRouter = exports.UniswapRouterAction = exports.UniswapTrade = void 0;
const tslib_1 = require("tslib");
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
const abi_1 = require("@ethersproject/abi");
const ethers_1 = require("ethers");
const node_cache_1 = tslib_1.__importDefault(require("node-cache"));
const RouterAction_1 = require("../action/RouterAction");
const Swap_1 = require("../searcher/Swap");
const utils_1 = require("ethers/lib/utils");
class UniswapPool {
    address;
    token0;
    token1;
    fee;
    constructor(address, token0, token1, fee) {
        this.address = address;
        this.token0 = token0;
        this.token1 = token1;
        this.fee = fee;
    }
    toString() {
        return `(${this.token0}.${this.fee}.${this.token1})`;
    }
}
class UniswapStep {
    pool;
    tokenIn;
    tokenOut;
    constructor(pool, tokenIn, tokenOut) {
        this.pool = pool;
        this.tokenIn = tokenIn;
        this.tokenOut = tokenOut;
    }
    toString() {
        return `${this.tokenIn} -> ${this.pool.address.toShortString()} -> ${this.tokenOut}`;
    }
}
class UniswapTrade {
    to;
    gasEstimate;
    input;
    output;
    swaps;
    addresses;
    outputWithSlippage;
    constructor(to, gasEstimate, input, output, swaps, addresses, outputWithSlippage) {
        this.to = to;
        this.gasEstimate = gasEstimate;
        this.input = input;
        this.output = output;
        this.swaps = swaps;
        this.addresses = addresses;
        this.outputWithSlippage = outputWithSlippage;
    }
    toString() {
        return `${this.input} -> [${this.swaps.join(' -> ')}] -> ${this.output}`;
    }
}
exports.UniswapTrade = UniswapTrade;
function encodeRouteToPath(route) {
    const firstInputToken = route.input.token;
    const { path, types } = route.swaps.reduce(({ inputToken, path, types, }, step, index) => {
        const outputToken = step.tokenOut;
        if (index === 0) {
            return {
                inputToken: outputToken,
                types: ['address', 'uint24', 'address'],
                path: [
                    inputToken.address.address,
                    step.pool.fee,
                    outputToken.address.address,
                ],
            };
        }
        else {
            return {
                inputToken: outputToken,
                types: [...types, 'uint24', 'address'],
                path: [...path, step.pool.fee, outputToken.address.address],
            };
        }
    }, { inputToken: firstInputToken, path: [], types: [] });
    return (0, utils_1.solidityPack)(types, path);
}
class UniswapRouterAction extends (0, Action_1.Action)('Uniswap') {
    currentQuote;
    universe;
    dex;
    get oneUsePrZap() {
        return true;
    }
    get outputSlippage() {
        return 0n;
    }
    async planV3Trade(planner, trade, input) {
        const v3CalLRouterLib = this.gen.Contract.createLibrary(contracts_1.UniV3RouterCall__factory.connect(this.universe.config.addresses.uniV3Router.address, this.universe.provider));
        const minOut = this.outputQty.amount;
        if (trade.swaps.length === 1) {
            const route = trade.swaps[0];
            const exactInputSingleParams = {
                tokenIn: this.inputToken[0].address.address,
                tokenOut: this.outputToken[0].address.address,
                fee: route.pool.fee,
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
            return planner.add(v3CalLRouterLib.exactInputSingle(input, minOut, this.currentQuote.to.address, encoded), `UniV3.exactInputSingle(${route})`);
        }
        const path = encodeRouteToPath(this.currentQuote);
        return planner.add(v3CalLRouterLib.exactInput(input, minOut, this.currentQuote.to.address, this.universe.execAddress.address, (0, v3_sdk_1.toHex)(path)), `UniV3.exactInput(${trade})`);
    }
    async plan(planner, [input], _, [staticInput]) {
        let inp = input ?? (0, Planner_1.encodeArg)(staticInput.amount, abi_1.ParamType.from('uint256'));
        return [await this.planV3Trade(planner, this.currentQuote, inp)];
    }
    createdBlock;
    constructor(currentQuote, universe, dex) {
        super(currentQuote.to, [currentQuote.input.token], [currentQuote.outputWithSlippage.token], Action_1.InteractionConvention.ApprovalRequired, Action_1.DestinationOptions.Callee, [new Approval_1.Approval(currentQuote.input.token, currentQuote.to)]);
        this.currentQuote = currentQuote;
        this.universe = universe;
        this.dex = dex;
        this.createdBlock = universe.currentBlock;
    }
    get inputQty() {
        return this.currentQuote.input;
    }
    get outputQty() {
        return this.currentQuote.outputWithSlippage;
    }
    toString() {
        return `UniRouter(${this.currentQuote})`;
    }
    get addressesInUse() {
        return this.currentQuote.addresses;
    }
    async quote([input]) {
        // if (
        //   Math.abs(this.createdBlock - this.universe.currentBlock) >
        //   this.universe.config.requoteTolerance
        // ) {
        //   this.currentQuote = await this.reQuote(input)
        // }
        return [this.outputQty];
    }
    get route() {
        return this.currentQuote;
    }
    gasEstimate() {
        const out = this.currentQuote.gasEstimate;
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
const uniTokenToOurs = async (universe, token) => {
    if (token.isNative) {
        return universe.nativeToken;
    }
    return await universe.getToken(Address_1.Address.from(token.address));
};
const uniAmtTokenToOurs = async (universe, token) => {
    const ourToken = await uniTokenToOurs(universe, token.currency);
    return ourToken.fromBigInt(BigInt(token.quotient.toString()));
};
const tokenQtyToCurrencyAmt = (universe, qty) => {
    const uniToken = ourTokenToUni(universe, qty.token);
    return smart_order_router_1.CurrencyAmount.fromRawAmount(uniToken, qty.amount.toString());
};
const setupUniswapRouter = async (universe) => {
    const tokenCache = new smart_order_router_1.NodeJSCache(new node_cache_1.default({ stdTTL: 3600, useClones: false }));
    const network = await universe.provider.getNetwork();
    const multicall = new smart_order_router_1.UniswapMulticallProvider(universe.chainId, universe.provider, Number(universe.config.blockGasLimit));
    const tokenProviderOnChain = new smart_order_router_1.TokenProvider(universe.chainId, multicall);
    const cachingTokenProvider = new smart_order_router_1.CachingTokenProviderWithFallback(universe.chainId, tokenCache, await smart_order_router_1.CachingTokenListProvider.fromTokenList(universe.chainId, default_token_list_1.default, tokenCache), tokenProviderOnChain);
    const v3PoolProvider = new smart_order_router_1.CachingV3PoolProvider(universe.chainId, new smart_order_router_1.V3PoolProvider(universe.chainId, multicall), new smart_order_router_1.NodeJSCache(new node_cache_1.default({ stdTTL: 360, useClones: false })));
    const router = new smart_order_router_1.LegacyRouter({
        chainId: universe.chainId,
        multicall2Provider: multicall,
        poolProvider: v3PoolProvider,
        quoteProvider: new smart_order_router_1.OnChainQuoteProvider(network.chainId, universe.provider, multicall),
        tokenProvider: cachingTokenProvider,
    });
    const pools = new Map();
    const parseRoute = async (route, inputTokenQuantity, slippage) => {
        const routes = route.route;
        const steps = await Promise.all(routes.map(async (v3Route) => {
            const stepPools = await Promise.all(v3Route.route.pools.map(async (pool, index) => {
                const addr = Address_1.Address.from(v3Route.poolAddresses[index]);
                const prev = pools.get(addr);
                if (prev) {
                    return prev;
                }
                const token0 = await universe.getToken(Address_1.Address.from(pool.token0.address));
                const token1 = await universe.getToken(Address_1.Address.from(pool.token1.address));
                const poolInst = new UniswapPool(addr, token0, token1, pool.fee);
                pools.set(addr, poolInst);
                return poolInst;
            }));
            const steps = [];
            for (let i = 0; i < stepPools.length; i++) {
                const tokenIn = await uniTokenToOurs(universe, v3Route.route.tokenPath[i]);
                const tokenOut = await uniTokenToOurs(universe, v3Route.route.tokenPath[i + 1]);
                steps.push(new UniswapStep(stepPools[i], tokenIn, tokenOut));
            }
            return steps;
        }));
        if (steps.length !== 1) {
            throw new Error(`We don't support univ3 with splits yet. Got ${steps.length} paths`);
        }
        const outputWithoutSlippage = await uniAmtTokenToOurs(universe, route.trade.outputAmount);
        const outputWithSlippage = await uniAmtTokenToOurs(universe, route.trade.minimumAmountOut(new sdk_core_1.Percent(Number(slippage), Number(constants_1.TRADE_SLIPPAGE_DENOMINATOR))));
        return new UniswapTrade(Address_1.Address.from(route.methodParameters.to), route.estimatedGasUsed.toBigInt(), inputTokenQuantity, outputWithoutSlippage, steps[0], new Set(steps[0].map((i) => i.pool.address)), outputWithSlippage);
    };
    const computeRoute = async (input, output, slippage) => {
        const inp = tokenQtyToCurrencyAmt(universe, input);
        const outp = ourTokenToUni(universe, output);
        const slip = new sdk_core_1.Percent(Number(slippage), Number(constants_1.TRADE_SLIPPAGE_DENOMINATOR));
        const route = await router.route(inp, outp, sdk_core_1.TradeType.EXACT_INPUT, {
            recipient: universe.execAddress.address,
            slippageTolerance: slip,
            deadline: Math.floor(Date.now() / 1000 + 1600),
            type: smart_order_router_1.SwapType.SWAP_ROUTER_02,
        });
        if (route == null || route.methodParameters == null) {
            throw new Error('Failed to find route');
        }
        const parsedRoute = await parseRoute(route, input, slippage);
        // console.log(`${input} -> ${output}: ${parsedRoute}`)
        return parsedRoute;
    };
    let out;
    out = new DexAggregator_1.DexRouter('uniswap', async (abort, src, dst, input, output, slippage) => {
        const route = await computeRoute(input, output, slippage);
        return await new Swap_1.SwapPlan(universe, [
            new UniswapRouterAction(route, universe, out),
        ]).quote([input], universe.execAddress);
    }, true);
    universe.dexAggregators.push(out);
    const routerAddr = Address_1.Address.from((0, sdk_core_1.SWAP_ROUTER_02_ADDRESSES)(universe.chainId));
    return {
        dex: out,
        addTradeAction: (inputToken, outputToken) => {
            universe.addAction(new ((0, RouterAction_1.RouterAction)('Uniswap'))(out, universe, routerAddr, inputToken, outputToken, universe.config.defaultInternalTradeSlippage), routerAddr);
        },
    };
};
exports.setupUniswapRouter = setupUniswapRouter;
//# sourceMappingURL=setupUniswapRouter.js.map