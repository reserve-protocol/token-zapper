import { Protocol } from '@uniswap/router-sdk'
import {
  Currency,
  Ether,
  Percent,
  SWAP_ROUTER_02_ADDRESSES,
  TradeType,
  Token as UniToken,
} from '@uniswap/sdk-core'
import {
  Trade,
  Trade as V3Trade,
  encodeRouteToPath,
  toHex,
} from '@uniswap/v3-sdk'

import DEFAULT_TOKEN_LIST from '@uniswap/default-token-list'
import {
  CachingTokenListProvider,
  CachingTokenProviderWithFallback,
  CachingV3PoolProvider,
  CurrencyAmount,
  LegacyRouter,
  NodeJSCache,
  OnChainQuoteProvider,
  SwapRoute,
  SwapType,
  TokenProvider,
  UniswapMulticallProvider,
  V3PoolProvider,
  V3Route,
} from '@uniswap/smart-order-router'
import { Universe } from '../Universe'
import {
  Action,
  DestinationOptions,
  InteractionConvention,
} from '../action/Action'
import { DexRouter } from '../aggregators/DexAggregator'
import { Address } from '../base/Address'
import { Approval } from '../base/Approval'
import {
  GAS_TOKEN_ADDRESS,
  TRADE_SLIPPAGE_DENOMINATOR,
} from '../base/constants'
import { UniV3RouterCall__factory } from '../contracts'
import { Token, TokenQuantity } from '../entities/Token'
import { Planner, Value, encodeArg } from '../tx-gen/Planner'

import { ParamType } from '@ethersproject/abi'
import { utils } from 'ethers'
import NodeCache from 'node-cache'
import { RouterAction } from '../action/RouterAction'
import { SwapPlan } from '../searcher/Swap'
type UniQuote = {
  route: SwapRoute
  input: TokenQuantity
  output: TokenQuantity
  slippage: bigint
  block: number
}
export class UniswapRouterAction extends Action('Uniswap') {
  get outputSlippage(): bigint {
    return this.currentQuote.slippage
  }
  async planV3Trade(
    planner: Planner,
    trade: V3Trade<Currency, Currency, TradeType>,
    input: Value,
    predicted: TokenQuantity
  ): Promise<Value> {
    if (trade.tradeType !== TradeType.EXACT_INPUT) {
      throw new Error('Not implemented')
    }

    const v3CalLRouterLib = this.gen.Contract.createLibrary(
      UniV3RouterCall__factory.connect(
        this.universe.config.addresses.uniV3Router.address,
        this.universe.provider
      )
    )
    const [minOut] = await this.quoteWithSlippage([predicted])
    for (const { route } of trade.swaps) {
      const singleHop = route.pools.length === 1
      if (singleHop) {
        const exactInputSingleParams = {
          tokenIn: this.inputToken[0].address.address,
          tokenOut: this.outputToken[0].address.address,
          fee: route.pools[0].fee,
          recipient: this.universe.execAddress.address,
          amountIn: 0,
          amountOutMinimum: minOut.amount,
          sqrtPriceLimitX96: 0,
        }

        const encoded = utils.defaultAbiCoder.encode(
          [
            'address',
            'address',
            'uint24',
            'address',
            'uint256',
            'uint256',
            'uint160',
          ],
          [
            exactInputSingleParams.tokenIn,
            exactInputSingleParams.tokenOut,
            exactInputSingleParams.fee,
            exactInputSingleParams.recipient,
            0,
            0,
            exactInputSingleParams.sqrtPriceLimitX96,
          ]
        )

        return planner.add(
          v3CalLRouterLib.exactInputSingle(
            input,
            minOut.amount,
            this.route.methodParameters!.to,
            encoded
          ),
          `UniV3.exactInputSingle(${route.input.symbol} => ${route.output.symbol})`
        )!
      } else {
        const path = encodeRouteToPath(route, false)
        return planner.add(
          v3CalLRouterLib.exactInput(
            input,
            minOut.amount,
            this.route.methodParameters!.to,
            this.universe.execAddress.address,
            toHex(path)
          ),
          `UniV3.exactInput(${route.input.symbol} => ${route.output.symbol})`
        )!
      }
    }
    throw new Error('Not implemented')
  }
  async plan(
    planner: Planner,
    [input]: Value[],
    _: Address,
    [staticInput]: TokenQuantity[]
  ): Promise<Value[]> {
    let inp = input ?? encodeArg(staticInput.amount, ParamType.from('uint256'))

    for (const { route, inputAmount, outputAmount } of this.route.trade.swaps) {
      if (route.protocol === Protocol.V3) {
        const v3Route: V3Route = route as unknown as V3Route
        inp = await this.planV3Trade(
          planner,
          V3Trade.createUncheckedTrade({
            route: v3Route,
            inputAmount: inputAmount,
            outputAmount: outputAmount,
            tradeType: TradeType.EXACT_INPUT,
          }),
          inp,
          staticInput
        )
      } else {
        throw new Error('Not implemented')
      }
    }
    if (inp == null) {
      throw new Error('Failed to plan')
    }
    return this.outputBalanceOf(this.universe, planner)
  }
  public createdBlock: number
  constructor(
    public currentQuote: UniQuote,
    public readonly universe: Universe,
    private reQuote: (input: TokenQuantity) => Promise<UniQuote>
  ) {
    super(
      Address.from(currentQuote.route.methodParameters!.to),
      [currentQuote.input.token],
      [currentQuote.output.token],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Callee,
      [
        new Approval(
          currentQuote.input.token,
          Address.from(currentQuote.route.methodParameters!.to)
        ),
      ]
    )
    this.createdBlock = universe.currentBlock
  }
  get inputQty() {
    return this.currentQuote.input
  }
  get outputQty() {
    return this.currentQuote.output
  }
  toString() {
    return `Uniswap(${this.inputQty} => ${this.outputQty})`
  }
  async quote([input]: TokenQuantity[]): Promise<TokenQuantity[]> {
    // if (
    //   Math.abs(this.createdBlock - this.universe.currentBlock) >
    //   this.universe.config.requoteTolerance
    // ) {
    //   this.currentQuote = await this.reQuote(input)
    // }
    return [this.outputQty]
  }
  get route() {
    return this.currentQuote.route
  }
  gasEstimate(): bigint {
    const out = this.route.estimatedGasUsed.toBigInt()
    return out === 0n ? 300000n : out
  }
}

const ourTokenToUni = (universe: Universe, token: Token): Currency => {
  if (token.address.address === GAS_TOKEN_ADDRESS) {
    return Ether.onChain(universe.chainId)
  }
  return new UniToken(
    universe.chainId,
    token.address.address,
    token.decimals,
    token.symbol,
    token.name
  )
}
const tokenQtyToCurrencyAmt = (
  universe: Universe,
  qty: TokenQuantity
): CurrencyAmount => {
  const uniToken = ourTokenToUni(universe, qty.token)
  return CurrencyAmount.fromRawAmount(uniToken, qty.amount.toString())
}
export const setupUniswapRouter = async (universe: Universe) => {
  const tokenCache = new NodeJSCache<UniToken>(
    new NodeCache({ stdTTL: 3600, useClones: false })
  )
  const network = await universe.provider.getNetwork()

  const multicall = new UniswapMulticallProvider(
    universe.chainId,
    universe.provider,
    Number(universe.config.blockGasLimit)
  )
  const tokenProviderOnChain = new TokenProvider(universe.chainId, multicall)
  const cachingTokenProvider = new CachingTokenProviderWithFallback(
    universe.chainId,
    tokenCache,
    await CachingTokenListProvider.fromTokenList(
      universe.chainId,
      DEFAULT_TOKEN_LIST,
      tokenCache
    ),
    tokenProviderOnChain
  )

  const v3PoolProvider = new CachingV3PoolProvider(
    universe.chainId,
    new V3PoolProvider(universe.chainId, multicall),
    new NodeJSCache(new NodeCache({ stdTTL: 360, useClones: false }))
  )

  const router = new LegacyRouter({
    chainId: universe.chainId,
    multicall2Provider: multicall,
    poolProvider: v3PoolProvider,
    quoteProvider: new OnChainQuoteProvider(
      network.chainId,
      universe.provider,
      multicall
    ),
    tokenProvider: cachingTokenProvider,
  })

  const computeRoute = async (
    input: TokenQuantity,
    output: Token,
    slippage: bigint
  ): Promise<UniQuote> => {
    const inp = tokenQtyToCurrencyAmt(universe, input)
    const outp = ourTokenToUni(universe, output)

    const route = await router.route(inp, outp, TradeType.EXACT_INPUT, {
      recipient: universe.execAddress.address,
      slippageTolerance: new Percent(Number(slippage), Number(TRADE_SLIPPAGE_DENOMINATOR)),
      deadline: Math.floor(Date.now() / 1000 + 1600),
      type: SwapType.SWAP_ROUTER_02,
    })
    if (route == null || route.methodParameters == null) {
      throw new Error('Failed to find route')
    }

    const outputAmt = output.fromBigInt(
      BigInt(route.trade.outputAmount.quotient.toString())
    )

    return {
      route,
      input,
      output: outputAmt,
      slippage: slippage,
      block: universe.currentBlock,
    }
  }

  const out = new DexRouter(
    'uniswap',
    async (abort, src, dst, input, output, slippage) => {
      const route = await computeRoute(input, output, slippage)
      return await new SwapPlan(universe, [
        new UniswapRouterAction(
          route,
          universe,
          async (inp) => await computeRoute(inp, output, slippage)
        ),
      ]).quote([input], universe.execAddress)
    },
    true
  )
  universe.dexAggregators.push(out)
  const routerAddr = Address.from(SWAP_ROUTER_02_ADDRESSES(universe.chainId))
  return {
    dex: out,
    addTradeAction: (inputToken: Token, outputToken: Token) => {
      universe.addAction(
        new (RouterAction('Uniswap'))(
          out,
          universe,
          routerAddr,
          inputToken,
          outputToken,
          universe.config.defaultInternalTradeSlippage
        ),
        routerAddr
      )
    },
  }
}
