import { Ether, Percent, SWAP_ROUTER_02_ADDRESSES, TradeType, Token as UniToken, } from '@uniswap/sdk-core';
import { toHex } from '@uniswap/v3-sdk';
import DEFAULT_TOKEN_LIST from '@uniswap/default-token-list';
import { CachingTokenListProvider, CachingTokenProviderWithFallback, CachingV3PoolProvider, CurrencyAmount, LegacyRouter, NodeJSCache, OnChainQuoteProvider, SwapType, TokenProvider, UniswapMulticallProvider, V3PoolProvider, } from '@uniswap/smart-order-router';
import { Action, DestinationOptions, InteractionConvention, } from '../action/Action';
import { DexRouter, TradingVenue } from '../aggregators/DexAggregator';
import { Address } from '../base/Address';
import { Approval } from '../base/Approval';
import { GAS_TOKEN_ADDRESS, TRADE_SLIPPAGE_DENOMINATOR, } from '../base/constants';
import { UniV3RouterCall__factory } from '../contracts';
import { encodeArg } from '../tx-gen/Planner';
import { ParamType } from '@ethersproject/abi';
import { utils } from 'ethers';
import { solidityPack } from 'ethers/lib/utils';
import NodeCache from 'node-cache';
import { RouterAction } from '../action/RouterAction';
import { SwapPlan } from '../searcher/Swap';
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
export class UniswapTrade {
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
    return solidityPack(types, path);
}
export class UniswapRouterAction extends Action('Uniswap') {
    currentQuote;
    universe;
    dex;
    get oneUsePrZap() {
        return true;
    }
    get returnsOutput() {
        return true;
    }
    get supportsDynamicInput() {
        return true;
    }
    get outputSlippage() {
        return 50n;
    }
    async planV3Trade(planner, trade, input) {
        const v3CalLRouterLib = this.gen.Contract.createLibrary(UniV3RouterCall__factory.connect(this.universe.config.addresses.uniV3Router.address, this.universe.provider));
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
            const encoded = utils.defaultAbiCoder.encode([
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
        return planner.add(v3CalLRouterLib.exactInput(input, minOut, this.currentQuote.to.address, this.universe.execAddress.address, toHex(path)), `UniV3.exactInput(${trade})`);
    }
    async plan(planner, [input], _, [staticInput]) {
        let inp = input ?? encodeArg(staticInput.amount, ParamType.from('uint256'));
        return [await this.planV3Trade(planner, this.currentQuote, inp)];
    }
    createdBlock;
    constructor(currentQuote, universe, dex) {
        super(currentQuote.to, [currentQuote.input.token], [currentQuote.outputWithSlippage.token], InteractionConvention.ApprovalRequired, DestinationOptions.Callee, [new Approval(currentQuote.input.token, currentQuote.to)]);
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
const ourTokenToUni = (universe, token) => {
    if (token.address.address === GAS_TOKEN_ADDRESS) {
        return Ether.onChain(universe.chainId);
    }
    return new UniToken(universe.chainId, token.address.address, token.decimals, token.symbol, token.name);
};
const uniTokenToOurs = async (universe, token) => {
    if (token.isNative) {
        return universe.nativeToken;
    }
    return await universe.getToken(Address.from(token.address));
};
const uniAmtTokenToOurs = async (universe, token) => {
    const ourToken = await uniTokenToOurs(universe, token.currency);
    return ourToken.fromBigInt(BigInt(token.quotient.toString()));
};
const tokenQtyToCurrencyAmt = (universe, qty) => {
    const uniToken = ourTokenToUni(universe, qty.token);
    return CurrencyAmount.fromRawAmount(uniToken, qty.amount.toString());
};
export const setupUniswapRouter = async (universe) => {
    const tokenCache = new NodeJSCache(new NodeCache({ stdTTL: 3600, useClones: false }));
    const network = await universe.provider.getNetwork();
    const multicall = new UniswapMulticallProvider(universe.chainId, universe.provider, Number(universe.config.blockGasLimit));
    const tokenProviderOnChain = new TokenProvider(universe.chainId, multicall);
    const cachingTokenProvider = new CachingTokenProviderWithFallback(universe.chainId, tokenCache, await CachingTokenListProvider.fromTokenList(universe.chainId, DEFAULT_TOKEN_LIST, tokenCache), tokenProviderOnChain);
    const v3PoolProvider = new CachingV3PoolProvider(universe.chainId, new V3PoolProvider(universe.chainId, multicall), new NodeJSCache(new NodeCache({ stdTTL: 360, useClones: false })));
    const router = new LegacyRouter({
        chainId: universe.chainId,
        multicall2Provider: multicall,
        poolProvider: v3PoolProvider,
        quoteProvider: new OnChainQuoteProvider(network.chainId, universe.provider, multicall),
        tokenProvider: cachingTokenProvider,
    });
    const pools = new Map();
    const parseRoute = async (abort, route, inputTokenQuantity, slippage) => {
        const routes = route.route;
        const steps = await Promise.all(routes.map(async (v3Route) => {
            if (abort.aborted) {
                throw new Error('Aborted');
            }
            const stepPools = await Promise.all(v3Route.route.pools.map(async (pool, index) => {
                if (abort.aborted) {
                    throw new Error('Aborted');
                }
                const addr = Address.from(v3Route.poolAddresses[index]);
                const prev = pools.get(addr);
                if (prev) {
                    return prev;
                }
                const token0 = await universe.getToken(Address.from(pool.token0.address));
                const token1 = await universe.getToken(Address.from(pool.token1.address));
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
        const outputWithSlippage = await uniAmtTokenToOurs(universe, route.trade.minimumAmountOut(new Percent(Number(slippage), Number(TRADE_SLIPPAGE_DENOMINATOR))));
        return new UniswapTrade(Address.from(route.methodParameters.to), route.estimatedGasUsed.toBigInt(), inputTokenQuantity, outputWithoutSlippage, steps[0], new Set(steps[0].map((i) => i.pool.address)), outputWithSlippage);
    };
    const computeRoute = async (abort, input, output, slippage) => {
        const inp = tokenQtyToCurrencyAmt(universe, input);
        const outp = ourTokenToUni(universe, output);
        const slip = new Percent(Number(slippage), Number(TRADE_SLIPPAGE_DENOMINATOR));
        if (abort.aborted) {
            throw new Error('Aborted');
        }
        const route = await router.route(inp, outp, TradeType.EXACT_INPUT, {
            recipient: universe.execAddress.address,
            slippageTolerance: slip,
            deadline: Math.floor(Date.now() / 1000 + 2500),
            type: SwapType.SWAP_ROUTER_02,
        });
        if (route == null || route.methodParameters == null) {
            // console.log(
            //   router
            // )
            // console.log(v3PoolProvider)
            throw new Error('Failed to find route');
        }
        if (abort.aborted) {
            throw new Error('Aborted');
        }
        const parsedRoute = await parseRoute(abort, route, input, slippage);
        // console.log(`${input} -> ${output}: ${parsedRoute}`)
        return parsedRoute;
    };
    let out;
    out = new DexRouter('uniswap', async (abort, input, output, slippage) => {
        try {
            const route = await computeRoute(abort, input, output, slippage);
            return await new SwapPlan(universe, [
                new UniswapRouterAction(route, universe, out),
            ]).quote([input], universe.execAddress);
        }
        catch (e) {
            // console.error(e)
            throw e;
        }
    }, true);
    const routerAddr = Address.from(SWAP_ROUTER_02_ADDRESSES(universe.chainId));
    return new TradingVenue(universe, out, async (inputToken, outputToken) => {
        try {
            await computeRoute(AbortSignal.timeout(universe.config.routerDeadline), inputToken.one, outputToken, universe.config.defaultInternalTradeSlippage);
        }
        catch (e) {
            return null;
        }
        return new RouterAction(out, universe, routerAddr, inputToken, outputToken, universe.config.defaultInternalTradeSlippage);
    });
};
//# sourceMappingURL=setupUniswapRouter.js.map