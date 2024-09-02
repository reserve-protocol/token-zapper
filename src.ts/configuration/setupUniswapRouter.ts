import {
  Currency,
  Ether,
  Percent,
  SWAP_ROUTER_02_ADDRESSES,
  TradeType,
  Token as UniToken,
} from '@uniswap/sdk-core'
import { toHex } from '@uniswap/v3-sdk'

import DEFAULT_TOKEN_LIST from '@uniswap/default-token-list'
import {
  AlphaRouter,
  CachingGasStationProvider,
  CachingTokenListProvider,
  CachingTokenProviderWithFallback,
  CachingV2PoolProvider,
  CachingV3PoolProvider,
  CurrencyAmount,
  EIP1559GasPriceProvider,
  EthEstimateGasSimulator,
  GasPrice,
  LegacyGasPriceProvider,
  LegacyRouter,
  NodeJSCache,
  OnChainGasPriceProvider,
  OnChainQuoteProvider,
  SwapRoute,
  SwapType,
  TokenPropertiesProvider,
  TokenProvider,
  UniswapMulticallProvider,
  V2PoolProvider,
  V3PoolProvider,
  V3RouteWithValidQuote,
} from '@uniswap/smart-order-router'
import { Universe } from '../Universe'
import {
  Action,
  DestinationOptions,
  InteractionConvention,
} from '../action/Action'
import { DexRouter, TradingVenue } from '../aggregators/DexAggregator'
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
import { PortionProvider } from '@uniswap/smart-order-router/build/main/providers/portion-provider'
import { OnChainTokenFeeFetcher } from '@uniswap/smart-order-router/build/main/providers/token-fee-fetcher'
import { utils } from 'ethers'
import { solidityPack } from 'ethers/lib/utils'
import NodeCache from 'node-cache'
import { RouterAction } from '../action/RouterAction'
import { SwapPlan } from '../searcher/Swap'

class UniswapPool {
  public constructor(
    public readonly address: Address,
    public readonly token0: Token,
    public readonly token1: Token,
    public readonly fee: number
  ) {}

  toString() {
    return `(${this.token0}.${this.fee}.${this.token1})`
  }
}
class UniswapStep {
  public constructor(
    public readonly pool: UniswapPool,
    public readonly tokenIn: Token,
    public readonly tokenOut: Token
  ) {}

  toString() {
    return `${this.tokenIn} -> ${this.pool.address.toString()} -> ${
      this.tokenOut
    }`
  }
}
export class UniswapTrade {
  public constructor(
    public readonly to: Address,
    public readonly gasEstimate: bigint,
    public readonly input: TokenQuantity,
    public readonly output: TokenQuantity,
    public readonly swaps: UniswapStep[],
    public readonly addresses: Set<Address>,
    public readonly outputWithSlippage: TokenQuantity
  ) {}

  toString() {
    return `${this.input} -> [${this.swaps.join(' -> ')}] -> ${this.output}`
  }
}

type UniQuote = {
  output: TokenQuantity
  slippage: bigint
  block: number
  slippagePercent: Percent
  addresses: Set<Address>
  parsedRoute: UniswapTrade
}

function encodeRouteToPath(route: UniswapTrade): string {
  const firstInputToken = route.input.token
  const { path, types } = route.swaps.reduce(
    (
      {
        inputToken,
        path,
        types,
      }: { inputToken: Token; path: (string | number)[]; types: string[] },
      step,
      index
    ): { inputToken: Token; path: (string | number)[]; types: string[] } => {
      const outputToken: Token = step.tokenOut
      if (index === 0) {
        return {
          inputToken: outputToken,
          types: ['address', 'uint24', 'address'],
          path: [
            inputToken.address.address,
            step.pool.fee,
            outputToken.address.address,
          ],
        }
      } else {
        return {
          inputToken: outputToken,
          types: [...types, 'uint24', 'address'],
          path: [...path, step.pool.fee, outputToken.address.address],
        }
      }
    },
    { inputToken: firstInputToken, path: [], types: [] }
  )
  return solidityPack(types, path)
}

export class UniswapRouterAction extends Action('Uniswap') {
  public get oneUsePrZap() {
    return true
  }
  public get returnsOutput() {
    return true
  }
  public get supportsDynamicInput() {
    return true
  }
  get outputSlippage() {
    return 0n
  }
  async planV3Trade(
    planner: Planner,
    trade: UniswapTrade,
    input: Value | bigint
  ): Promise<Value> {
    const v3CalLRouterLib = this.gen.Contract.createContract(
      UniV3RouterCall__factory.connect(
        this.universe.config.addresses.uniV3Router.address,
        this.universe.provider
      )
    )
    const minOut = this.outputQty.amount
    if (trade.swaps.length === 1) {
      const route = trade.swaps[0]
      const exactInputSingleParams = {
        tokenIn: this.inputToken[0].address.address,
        tokenOut: this.outputToken[0].address.address,
        fee: route.pool.fee,
        recipient: this.universe.execAddress.address,
        amountIn: 0,
        amountOutMinimum: minOut,
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
          minOut,
          this.currentQuote.to.address,
          encoded
        ),
        `UniV3.exactInputSingle(${route})`
      )!
    }
    const path = encodeRouteToPath(this.currentQuote)
    return planner.add(
      v3CalLRouterLib.exactInput(
        input,
        minOut,
        this.currentQuote.to.address,
        this.universe.execAddress.address,
        toHex(path)
      ),
      `UniV3.exactInput(${trade})`
    )!
  }

  async plan(
    planner: Planner,
    [input]: Value[],
    _: Address,
    [staticInput]: TokenQuantity[]
  ): Promise<Value[]> {
    let inp = input ?? encodeArg(staticInput.amount, ParamType.from('uint256'))
    return [await this.planV3Trade(planner, this.currentQuote, inp)]
  }
  public createdBlock: number
  constructor(
    public currentQuote: UniswapTrade,
    public readonly universe: Universe,
    public readonly dex: DexRouter
  ) {
    super(
      currentQuote.to,
      [currentQuote.input.token],
      [currentQuote.outputWithSlippage.token],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Callee,
      [new Approval(currentQuote.input.token, currentQuote.to)]
    )
    this.createdBlock = universe.currentBlock
  }
  get inputQty() {
    return this.currentQuote.input
  }
  get outputQty() {
    return this.currentQuote.outputWithSlippage
  }
  toString() {
    return `UniRouter(${this.currentQuote})`
  }
  public get addressesInUse() {
    return this.currentQuote.addresses
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
    return this.currentQuote
  }
  gasEstimate(): bigint {
    const out = this.currentQuote.gasEstimate
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

const uniTokenToOurs = async (universe: Universe, token: Currency) => {
  if (token.isNative) {
    return universe.nativeToken
  }
  return await universe.getToken(Address.from(token.address))
}
const uniAmtTokenToOurs = async (universe: Universe, token: CurrencyAmount) => {
  const ourToken = await uniTokenToOurs(universe, token.currency)
  const out = token.toFixed(ourToken.decimals)
  return ourToken.fromDecimal(out)
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
  await universe.provider.getNetwork()

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

  const tokenFeeFetcher = new OnChainTokenFeeFetcher(
    universe.chainId,
    universe.provider
  )
  const tokenPropertiesProvider = new TokenPropertiesProvider(
    universe.chainId,
    new NodeJSCache(new NodeCache({ stdTTL: 360, useClones: false })),
    tokenFeeFetcher
  )

  const v2PoolProvider = new CachingV2PoolProvider(
    universe.chainId,
    new V2PoolProvider(universe.chainId, multicall, tokenPropertiesProvider),
    new NodeJSCache(new NodeCache({ stdTTL: 360, useClones: false }))
  )

  const v3PoolProvider = new CachingV3PoolProvider(
    universe.chainId,
    new V3PoolProvider(universe.chainId, multicall),
    new NodeJSCache(new NodeCache({ stdTTL: 360, useClones: false }))
  )

  const portionProvider = new PortionProvider()

  const ethEstimateGasSimulator = new EthEstimateGasSimulator(
    universe.chainId,
    universe.provider,
    v2PoolProvider,
    v3PoolProvider,
    portionProvider
  )

  const gasPriceCache = new NodeJSCache<GasPrice>(
    new NodeCache({ stdTTL: 15, useClones: true })
  )

  const gasPriceProvider = new CachingGasStationProvider(
    universe.chainId,
    new OnChainGasPriceProvider(
      universe.chainId,
      new EIP1559GasPriceProvider(universe.provider),
      new LegacyGasPriceProvider(universe.provider)
    ),
    gasPriceCache
  )
  const legacy = new LegacyRouter({
    chainId: universe.chainId,
    multicall2Provider: multicall,
    poolProvider: v3PoolProvider,
    quoteProvider: new OnChainQuoteProvider(
      universe.chainId,
      universe.provider,
      multicall
    ),
    tokenProvider: cachingTokenProvider,
  })
  const router = new AlphaRouter({
    chainId: universe.chainId,
    multicall2Provider: multicall,
    provider: universe.provider,
    simulator: ethEstimateGasSimulator,
    gasPriceProvider: gasPriceProvider,
    tokenProvider: cachingTokenProvider,
  })

  const pools: Map<Address, UniswapPool> = new Map()

  const parseRoute = async (
    abort: AbortSignal,
    route: SwapRoute,
    inputTokenQuantity: TokenQuantity,
    slippage: bigint
  ) => {
    const routes = route.route as V3RouteWithValidQuote[]
    const steps = await Promise.all(
      routes.map(async (v3Route) => {
        if (abort.aborted) {
          throw new Error('Aborted')
        }
        const stepPools = await Promise.all(
          v3Route.route.pools.map(async (pool, index) => {
            if (abort.aborted) {
              throw new Error('Aborted')
            }
            const addr = Address.from(v3Route.poolAddresses[index])
            const prev = pools.get(addr)
            if (prev) {
              return prev
            }
            const token0 = await universe.getToken(
              Address.from(pool.token0.address)
            )
            const token1 = await universe.getToken(
              Address.from(pool.token1.address)
            )
            const poolInst = new UniswapPool(addr, token0, token1, pool.fee)
            pools.set(addr, poolInst)
            return poolInst
          })
        )

        const steps: UniswapStep[] = []
        for (let i = 0; i < stepPools.length; i++) {
          const tokenIn = await uniTokenToOurs(
            universe,
            v3Route.route.tokenPath[i]
          )
          const tokenOut = await uniTokenToOurs(
            universe,
            v3Route.route.tokenPath[i + 1]
          )
          steps.push(new UniswapStep(stepPools[i], tokenIn, tokenOut))
        }
        return steps
      })
    )
    if (steps.length !== 1) {
      throw new Error(
        `We don't support univ3 with splits yet. Got ${steps.length} paths`
      )
    }

    const outputWithoutSlippage = await uniAmtTokenToOurs(
      universe,
      route.trade.outputAmount
    )
    const outputWithSlippage = await uniAmtTokenToOurs(
      universe,
      route.trade.minimumAmountOut(
        new Percent(Number(slippage), Number(TRADE_SLIPPAGE_DENOMINATOR))
      )
    )
    if (outputWithSlippage.amount === 0n) {
      throw new Error('No output')
    }
    return new UniswapTrade(
      Address.from(route.methodParameters!.to),
      route.estimatedGasUsed.toBigInt(),
      inputTokenQuantity,
      outputWithoutSlippage,
      steps[0],
      new Set(steps[0].map((i) => i.pool.address)),
      outputWithSlippage
    )
  }

  const computeRoute = async (
    abort: AbortSignal,
    input: TokenQuantity,
    output: Token,
    slippage: bigint
  ): Promise<UniswapTrade> => {
    const inp = tokenQtyToCurrencyAmt(universe, input)
    const outp = ourTokenToUni(universe, output)
    const slip = new Percent(
      Number(slippage),
      Number(TRADE_SLIPPAGE_DENOMINATOR)
    )

    if (abort.aborted) {
      throw new Error('Aborted')
    }
    const route = await legacy.route(
      inp,
      outp,
      TradeType.EXACT_INPUT,
      {
        recipient: universe.execAddress.address,
        slippageTolerance: slip,
        deadline: Math.floor(Date.now() / 1000 + 10000),
        type: SwapType.SWAP_ROUTER_02,
      }
      // {
      //   protocols: [Protocol.V3],
      // }
    )

    if (route == null || route.methodParameters == null) {
      // console.log(
      //   router
      // )
      // console.log(v3PoolProvider)
      throw new Error('Failed to find route')
    }

    if (abort.aborted) {
      throw new Error('Aborted')
    }
    const parsedRoute = await parseRoute(abort, route, input, slippage)
    return parsedRoute
  }
  let out!: DexRouter
  out = new DexRouter(
    'uniswap',
    async (abort, input, output, slippage) => {
      try {
        const route = await computeRoute(abort, input, output, slippage)
        if (
          route.output.amount <= 1000n ||
          route.outputWithSlippage.amount <= 1000n
        ) {
          throw new Error('No output')
        }
        const plan = await new SwapPlan(universe, [
          new UniswapRouterAction(route, universe, out),
        ]).quote([input], universe.execAddress)
        if (plan.outputs[0].amount === 0n) {
          throw new Error('No output')
        }
        return plan
      } catch (e: any) {
        // console.error(e)
        throw e
      }
    },
    true
  )
  const routerAddr = Address.from(SWAP_ROUTER_02_ADDRESSES(universe.chainId))

  return new TradingVenue(
    universe,
    out,
    async (inputToken: Token, outputToken: Token) => {
      try {
        await computeRoute(
          AbortSignal.timeout(universe.config.routerDeadline),
          inputToken.one,
          outputToken,
          universe.config.defaultInternalTradeSlippage
        )
      } catch (e: any) {
        return null
      }

      return new RouterAction(
        out,
        universe,
        routerAddr,
        inputToken,
        outputToken,
        universe.config.defaultInternalTradeSlippage
      )
    }
  )
}
