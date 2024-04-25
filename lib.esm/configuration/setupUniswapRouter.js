import { Protocol } from '@uniswap/router-sdk';
import { Ether, Percent, SWAP_ROUTER_02_ADDRESSES, TradeType, Token as UniToken, } from '@uniswap/sdk-core';
import { Trade as V3Trade, encodeRouteToPath, toHex } from '@uniswap/v3-sdk';
import DEFAULT_TOKEN_LIST from '@uniswap/default-token-list';
import { CachingTokenListProvider, CachingTokenProviderWithFallback, CachingV2PoolProvider, CachingV3PoolProvider, CurrencyAmount, LegacyRouter, NodeJSCache, OnChainQuoteProvider, SwapType, TokenPropertiesProvider, TokenProvider, UniswapMulticallProvider, V2PoolProvider, V3PoolProvider, } from '@uniswap/smart-order-router';
import { Action, DestinationOptions, InteractionConvention, } from '../action/Action';
import { DexRouter } from '../aggregators/DexAggregator';
import { Address } from '../base/Address';
import { Approval } from '../base/Approval';
import { GAS_TOKEN_ADDRESS } from '../base/constants';
import { UniV3RouterCall__factory } from '../contracts';
import { encodeArg } from '../tx-gen/Planner';
import { PortionProvider } from '@uniswap/smart-order-router/build/main/providers/portion-provider';
import { OnChainTokenFeeFetcher } from '@uniswap/smart-order-router/build/main/providers/token-fee-fetcher';
import { utils } from 'ethers';
import NodeCache from 'node-cache';
import { RouterAction } from '../action/RouterAction';
import { SwapPlan } from '../searcher/Swap';
import { ParamType } from '@ethersproject/abi';
const SLIPPAGE = new Percent(50, 10000);
export class UniswapRouterAction extends Action('Uniswap') {
    route;
    inputQty;
    outputQty;
    universe;
    get outputSlippage() {
        return 3000000n;
    }
    async planV3Trade(planner, trade, input) {
        if (trade.tradeType !== TradeType.EXACT_INPUT) {
            throw new Error('Not implemented');
        }
        const v3CalLRouterLib = this.gen.Contract.createLibrary(UniV3RouterCall__factory.connect(this.universe.config.addresses.uniV3Router.address, this.universe.provider));
        const minOut = this.outputQty.amount;
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
                return planner.add(v3CalLRouterLib.exactInputSingle(input, exactInputSingleParams.amountOutMinimum, this.route.methodParameters.to, encoded), `UniV3.exactInputSingle(${route.input.symbol} => ${route.output.symbol})`);
            }
            else {
                const path = encodeRouteToPath(route, false);
                return planner.add(v3CalLRouterLib.exactInput(input, minOut, this.route.methodParameters.to, this.universe.execAddress.address, toHex(path)), `UniV3.exactInput(${route.input.symbol} => ${route.output.symbol})`);
            }
        }
        throw new Error('Not implemented');
    }
    async plan(planner, [input], destination, [staticInput]) {
        let inp = input ?? encodeArg(staticInput.amount, ParamType.from('uint256'));
        for (const { route, inputAmount, outputAmount } of this.route.trade.swaps) {
            if (route.protocol === Protocol.V3) {
                const v3Route = route;
                inp = await this.planV3Trade(planner, V3Trade.createUncheckedTrade({
                    route: v3Route,
                    inputAmount: inputAmount,
                    outputAmount: outputAmount,
                    tradeType: TradeType.EXACT_INPUT,
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
        super(Address.from(route.methodParameters.to), [inputQty.token], [outputQty.token], InteractionConvention.ApprovalRequired, DestinationOptions.Callee, [new Approval(inputQty.token, Address.from(route.methodParameters.to))]);
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
    const tokenCache = new NodeJSCache(new NodeCache({ stdTTL: 3600, useClones: false }));
    const multicall = new UniswapMulticallProvider(universe.chainId, universe.provider, 25000000);
    const tokenProviderOnChain = new TokenProvider(universe.chainId, multicall);
    const cachingTokenProvider = new CachingTokenProviderWithFallback(universe.chainId, tokenCache, await CachingTokenListProvider.fromTokenList(universe.chainId, DEFAULT_TOKEN_LIST, tokenCache), tokenProviderOnChain);
    const gasPriceCache = new NodeJSCache(new NodeCache({ stdTTL: 15, useClones: true }));
    const v3PoolProvider = new CachingV3PoolProvider(universe.chainId, new V3PoolProvider(universe.chainId, multicall), new NodeJSCache(new NodeCache({ stdTTL: 360, useClones: false })));
    const tokenFeeFetcher = new OnChainTokenFeeFetcher(universe.chainId, universe.provider);
    const tokenPropertiesProvider = new TokenPropertiesProvider(universe.chainId, new NodeJSCache(new NodeCache({ stdTTL: 360, useClones: false })), tokenFeeFetcher);
    const portionProvider = new PortionProvider();
    const v2PoolProvider = new CachingV2PoolProvider(universe.chainId, new V2PoolProvider(universe.chainId, multicall, tokenPropertiesProvider), new NodeJSCache(new NodeCache({ stdTTL: 360, useClones: false })));
    const router = new LegacyRouter({
        chainId: universe.chainId,
        multicall2Provider: multicall,
        poolProvider: v3PoolProvider,
        quoteProvider: new OnChainQuoteProvider(universe.chainId, universe.provider, multicall),
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
    const out = new DexRouter('uniswap', async (src, dst, input, output, slippage) => {
        let outPath = null;
        const inp = tokenQtyToCurrencyAmt(universe, input);
        const outp = ourTokenToUni(universe, output);
        const route = await router.route(inp, outp, TradeType.EXACT_INPUT, {
            recipient: universe.execAddress.address,
            slippageTolerance: SLIPPAGE,
            deadline: Math.floor(Date.now() / 1000 + 1800),
            type: SwapType.SWAP_ROUTER_02,
        });
        if (route == null || route.methodParameters == null) {
            console.log('Failed to find route for ' + input + ' -> ' + output);
            throw new Error('Failed to find route');
        }
        const outamt = BigInt(route.trade.minimumAmountOut(SLIPPAGE).quotient.toString());
        const outputAmt = output.from(outamt);
        return await new SwapPlan(universe, [
            new UniswapRouterAction(route, input, outputAmt, universe),
        ]).quote([input], universe.execAddress);
    }, true);
    universe.dexAggregators.push(out);
    const routerAddr = Address.from(SWAP_ROUTER_02_ADDRESSES(universe.chainId));
    return {
        dex: out,
        addTradeAction: (inputToken, outputToken) => {
            universe.addAction(new (RouterAction('Uniswap'))(out, universe, routerAddr, inputToken, outputToken), routerAddr);
        },
    };
};
//# sourceMappingURL=setupUniswapRouter.js.map