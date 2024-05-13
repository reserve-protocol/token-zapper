import { ethers } from 'ethers'

import { type BaseAction as Action } from './action/Action'
import { LPToken } from './action/LPToken'
import { Address } from './base/Address'
import { DefaultMap } from './base/DefaultMap'
import { type Config } from './configuration/ChainConfiguration'
import { Refreshable } from './entities/Refreshable'
import {
  PricedTokenQuantity,
  Token,
  type TokenQuantity,
} from './entities/Token'
import { TokenLoader, makeTokenLoader } from './entities/makeTokenLoader'
import { Graph } from './exchange-graph/Graph'
import { LPTokenPriceOracle } from './oracles/LPTokenPriceOracle'
import { type PriceOracle } from './oracles/PriceOracle'
import { ApprovalsStore } from './searcher/ApprovalsStore'
import { SourcingRule } from './searcher/SourcingRule'

import EventEmitter from 'events'
import { TradingVenue } from './aggregators/DexAggregator'
import { GAS_TOKEN_ADDRESS, USD_ADDRESS } from './base/constants'
import { ZapperExecutor__factory } from './contracts'
import { Searcher } from './searcher/Searcher'
import { SwapPath } from './searcher/Swap'
import { Contract } from './tx-gen/Planner'
import { BlockCache } from './base/BlockBasedCache'
import { PerformanceMonitor } from './searcher/PerformanceMonitor'
import { AaveV3Deployment } from './configuration/setupAaveV3'
import { AaveV2Deployment } from './configuration/setupAaveV2'
import { CompoundV2Deployment } from './action/CTokens'
import { CompoundV3Deployment } from './configuration/setupCompV3'
import { RTokenDeployment } from './action/RTokens'
import { LidoDeployment } from './action/Lido'
import { ReserveConvex } from './configuration/setupConvexStakingWrappers'

type TokenList<T> = {
  [K in keyof T]: Token
}
interface OracleDef {
  quote: (qty: TokenQuantity) => Promise<TokenQuantity>
  quoteIn: (
    qty: TokenQuantity,
    tokenToQuoteWith: Token
  ) => Promise<TokenQuantity>
}
export type Integrations = Partial<{
  aaveV3: AaveV3Deployment
  aaveV2: AaveV2Deployment
  fluxFinance: CompoundV2Deployment
  compoundV2: CompoundV2Deployment
  compoundV3: CompoundV3Deployment
  uniswapV3: TradingVenue
  curve: TradingVenue
  rocketpool: TradingVenue
  aerodrome: TradingVenue
  lido: LidoDeployment
  convex: ReserveConvex
}>
export class Universe<const UniverseConf extends Config = Config> {
  private emitter = new EventEmitter()
  public _finishResolving: () => void = () => {}
  public initialized: Promise<void> = new Promise((resolve) => {
    this._finishResolving = resolve
  })
  get chainId(): UniverseConf['chainId'] {
    return this.config.chainId
  }

  private readonly caches: BlockCache<any, any>[] = []

  public readonly perf = new PerformanceMonitor()
  public prettyPrintPerfs(addContext = false) {
    console.log('Performance Stats')
    for (const [_, value] of this.perf.stats.entries()) {
      console.log('  ' + value.toString())
      if (addContext) {
        for (const context of value.contextStats) {
          console.log('    ' + context.toString())
        }
      }
    }
  }
  public createCache<Key, Result>(
    fetch: (key: Key) => Promise<Result>,
    ttl: number = this.config.requoteTolerance
  ): BlockCache<Key, Result> {
    const cache = new BlockCache(fetch, ttl, this.currentBlock)
    this.caches.push(cache)
    return cache
  }

  public readonly refreshableEntities = new Map<Address, Refreshable>()
  public readonly tokens = new Map<Address, Token>()
  public readonly lpTokens = new Map<Token, LPToken>()

  private _gasTokenPrice: TokenQuantity | null = null
  public get gasTokenPrice() {
    return this._gasTokenPrice ?? this.usd.from(3000)
  }

  public async quoteGas(units: bigint) {
    if (this._gasTokenPrice == null) {
      this._gasTokenPrice = await this.fairPrice(this.nativeToken.one)
    }
    const txFee = this.nativeToken.from(units * this.gasPrice)
    const txFeeUsd = txFee.into(this.usd).mul(this.gasTokenPrice)
    return {
      units,
      txFee,
      txFeeUsd,
    }
  }

  public readonly precursorTokenSourcingSpecialCases = new Map<
    Token,
    SourcingRule
  >()
  public readonly actions = new DefaultMap<Address, Action[]>(() => [])
  private readonly allActions = new Set<Action>()

  public readonly tokenTradeSpecialCases = new Map<
    Token,
    (amount: TokenQuantity, destination: Address) => Promise<SwapPath | null>
  >()

  // The GAS token for the EVM chain, set by the StaticConfig
  public readonly nativeToken: Token
  public readonly wrappedNativeToken: Token

  // 'Virtual' token used for pricing things
  public readonly usd: Token = Token.createToken(
    this.tokens,
    Address.fromHexString(USD_ADDRESS),
    'USD',
    'USD Dollar',
    8
  )

  private fairPriceCache: BlockCache<TokenQuantity, TokenQuantity>

  public readonly graph: Graph = new Graph()
  public readonly wrappedTokens = new Map<
    Token,
    { mint: Action; burn: Action; allowAggregatorSearcher: boolean }
  >()
  public readonly oracles: PriceOracle[] = []

  private tradeVenues: TradingVenue[] = []
  private readonly tradingVenuesSupportingDynamicInput: TradingVenue[] = []
  public addTradeVenue(venue: TradingVenue) {
    if (venue.supportsDynamicInput) {
      this.tradingVenuesSupportingDynamicInput.push(venue)
      this.tradeVenues.push(venue)
    } else {
      this.tradeVenues = [venue, ...this.tradeVenues]
    }
  }
  public getTradingVenues(
    input: TokenQuantity,
    output: Token,
    dynamicInput: boolean
  ) {
    const venues = dynamicInput
      ? this.tradingVenuesSupportingDynamicInput
      : this.tradeVenues
    const out = venues.filter((venue) =>
      venue.router.supportsSwap(input, output)
    )
    if (out.length !== 0) {
      return out
    }
    if (dynamicInput) {
      throw new Error(
        `Failed to find any trading venues for ${input.token} -> ${output} where dynamic input is allowed`
      )
    } else {
      throw new Error(
        `Failed to find any trading venues for ${input.token} -> ${output}`
      )
    }
  }

  public async swaps(
    input: TokenQuantity,
    output: Token,
    onResult: (result: SwapPath) => Promise<void>,
    opts: {
      slippage: bigint
      dynamicInput: boolean
      abort: AbortSignal
    }
  ) {
    const wrapper = this.wrappedTokens.get(input.token)
    if (wrapper?.allowAggregatorSearcher === false) {
      return
    }
    const aggregators = this.getTradingVenues(input, output, opts.dynamicInput)
    const tradeName = `${input.token} -> ${output}`

    await Promise.all(
      shuffle(aggregators).map(async (venue) => {
        try {
          const res = await this.perf.measurePromise(
            venue.name,
            venue.router.swap(opts.abort, input, output, opts.slippage),
            tradeName
          )
          // console.log(`${venue.name} ok: ${res.steps[0].action.toString()}`)
          await onResult(res)
        } catch (e: any) {
          // console.log(`${router.name} failed for case: ${tradeName}`)
          // console.log(e.message)
        }
      })
    )
  }

  // Sentinel token used for pricing things
  public readonly rTokens = {} as TokenList<
    UniverseConf['addresses']['rTokens']
  >
  public readonly commonTokens = {} as TokenList<
    UniverseConf['addresses']['commonTokens']
  >

  public readonly integrations: Integrations = {}
  private readonly rTokenDeployments = new Map<Token, RTokenDeployment>()
  public async defineRToken(rTokenAddress: Address) {
    const rToken = await this.getToken(rTokenAddress)
    if (this.rTokenDeployments.has(rToken)) {
      throw new Error(`RToken ${rToken} already defined`)
    }
    let facade = this.config.addresses.facadeAddress
    if (facade === Address.ZERO) {
      facade = Address.from(this.config.addresses.oldFacadeAddress)
    }

    const rtokenDeployment = await RTokenDeployment.load(this, facade, rToken)
    this.rTokenDeployments.set(rToken, rtokenDeployment)
  }

  public getRTokenDeployment(token: Token) {
    const out = this.rTokenDeployments.get(token)
    if (out == null) {
      throw new Error(`${token} is not a known RToken`)
    }
    return out
  }

  public addIntegration<K extends keyof Integrations>(
    key: K,
    value: Integrations[K]
  ) {
    if (this.integrations[key] != null) {
      throw new Error(`Integration ${key} already defined`)
    }
    this.integrations[key] = value
    return value!
  }

  async refresh(entity: Address) {
    const refreshable = this.refreshableEntities.get(entity)
    if (refreshable == null) {
      return
    }
    await refreshable.refresh(this.currentBlock)
  }

  createRefreshableEntity(
    address: Address,
    refresh: Refreshable['refreshAddress']
  ) {
    this.refreshableEntities.set(address, new Refreshable(address, -1, refresh))
  }

  private readonly blockState = {
    currentBlock: 0,
    gasPrice: 0n,
  }

  public defineTokenSourcingRule(precursor: Token, rule: SourcingRule) {
    this.precursorTokenSourcingSpecialCases.set(precursor, rule)
  }

  /**
   * This method try to price a given token in USD.
   * It will first try and see if there is an canonical way to mint/burn the token,
   * if there is, it will recursively unwrap the token until it finds a what the token consists of.
   *
   * Once the token is fully unwrapped, it will query the oracles to find the price of each underlying
   * quantity, and sum them up.
   *
   * @param qty quantity to price
   * @returns The price of the qty in USD, or null if the price cannot be determined
   */
  public oracle?: OracleDef = undefined
  async fairPrice(qty: TokenQuantity) {
    const perfStart = this.perf.begin('fairPrice', qty.token.symbol)
    let out: TokenQuantity | null = await this.fairPriceCache.get(qty)
    if (out.amount === 0n) {
      out = null
    }
    perfStart()
    return out
  }
  async priceQty(qty: TokenQuantity) {
    const out = await this.fairPrice(qty)

    return new PricedTokenQuantity(qty, out)
  }
  async quoteIn(qty: TokenQuantity, tokenToQuoteWith: Token) {
    return this.oracle?.quoteIn(qty, tokenToQuoteWith).catch(() => null) ?? null
  }

  public readonly searcher: Searcher<Universe<any>>

  get currentBlock() {
    return this.blockState.currentBlock
  }

  get gasPrice() {
    return this.blockState.gasPrice
  }

  public async getToken(address: Address): Promise<Token> {
    let previous = this.tokens.get(address)
    if (previous == null) {
      const data = await this.loadToken(address)
      previous = Token.createToken(
        this.tokens,
        address,
        data.symbol,
        data.symbol,
        data.decimals
      )
      this.tokens.set(address, previous)
    }
    return previous
  }

  public createToken(
    address: Address,
    symbol: string,
    name: string,
    decimals: number
  ) {
    const token = Token.createToken(
      this.tokens,
      address,
      symbol,
      name,
      decimals
    )
    return token
  }

  public addAction(action: Action, actionAddress?: Address) {
    console.log('Adding action ' + action)
    if (this.allActions.has(action)) {
      return this
    }
    this.allActions.add(action)
    if (actionAddress != null) {
      this.actions.get(actionAddress).push(action)
    }
    if (action.addToGraph) {
      this.graph.addEdge(action)
    }
    return this
  }

  public defineLPToken(lpTokenInstance: LPToken) {
    this.lpTokens.set(lpTokenInstance.token, lpTokenInstance)
    this.addAction(lpTokenInstance.mintAction)
    // this.addAction(lpTokenInstance.burnAction)
    // this.defineMintable(
    //   lpTokenInstance.mintAction,
    //   lpTokenInstance.burnAction,
    //   true
    // )
  }

  public weirollZapperExec

  get execAddress() {
    return this.config.addresses.executorAddress
  }
  get zapperAddress() {
    return this.config.addresses.zapperAddress
  }

  public async createTradeEdge(tokenIn: Token, tokenOut: Token) {
    const edges: Action[] = []
    for (const venue of this.tradeVenues) {
      if (
        !venue.supportsDynamicInput ||
        !venue.supportsEdges ||
        !venue.canCreateEdgeBetween(tokenIn, tokenOut)
      ) {
        continue
      }
      const edge = await venue.createTradeEdge(tokenIn, tokenOut)
      if (edge != null) {
        edges.push(edge)
      }
    }

    if (edges.length === 0) {
      throw new Error(`No trade edge found for ${tokenIn} -> ${tokenOut}`)
    }
    return edges
  }
  public defineMintable(
    mint: Action,
    burn: Action,
    allowAggregatorSearcher = false
  ) {
    const output = mint.outputToken[0]
    if (
      !mint.outputToken.every((i, index) => burn.inputToken[index] === i) ||
      !burn.outputToken.every((i, index) => mint.inputToken[index] === i)
    ) {
      throw new Error(
        `Invalid mintable: mint: (${mint.inputToken.join(
          ', '
        )}) -> ${mint} -> (${mint.outputToken.join(
          ', '
        )}), burn: (${burn.inputToken.join(
          ', '
        )}) -> ${burn} -> (${burn.outputToken.join(', ')})`
      )
    }

    // console.log(
    //   `Defining mintable ${mint.outputToken.join(
    //     ', '
    //   )} via ${mint.inputToken.join(', ')}`
    // )
    if (this.wrappedTokens.has(output)) {
      throw new Error('Token already mintable')
    }
    this.addAction(mint, output.address)
    this.addAction(burn, output.address)
    const out = {
      mint,
      burn,
      allowAggregatorSearcher,
    }
    this.wrappedTokens.set(output, out)
    return out
  }

  private constructor(
    public readonly provider: ethers.providers.JsonRpcProvider,
    public readonly config: UniverseConf,
    public readonly approvalsStore: ApprovalsStore,
    public readonly loadToken: TokenLoader
  ) {
    const nativeToken = config.nativeToken
    this.searcher = new Searcher(this as any)
    this.nativeToken = Token.createToken(
      this.tokens,
      Address.fromHexString(GAS_TOKEN_ADDRESS),
      nativeToken.symbol,
      nativeToken.name,
      nativeToken.decimals
    )

    this.wrappedNativeToken = Token.createToken(
      this.tokens,
      config.addresses.wrappedNative,
      'W' + nativeToken.symbol,
      'Wrapped ' + nativeToken.name,
      nativeToken.decimals
    )

    this.weirollZapperExec = Contract.createLibrary(
      ZapperExecutor__factory.connect(this.execAddress.address, this.provider)
    )
    this.fairPriceCache = this.createCache<TokenQuantity, TokenQuantity>(
      async (qty: TokenQuantity) => {
        return (
          (await this.oracle?.quote(qty).catch(() => this.usd.zero)) ??
          this.usd.zero
        )
      },
      this.config.requoteTolerance
    )
  }

  public async updateBlockState(block: number, gasPrice: bigint) {
    if (block <= this.blockState.currentBlock) {
      return
    }
    for (const router of this.tradeVenues) {
      router.router.onBlock(block)
    }
    for (const cache of this.caches) {
      cache.onBlock(block)
    }
    this.blockState.currentBlock = block
    this.blockState.gasPrice = gasPrice
    this._gasTokenPrice = await this.fairPrice(this.nativeToken.one)
  }

  static async createWithConfig<const C extends Config>(
    provider: ethers.providers.JsonRpcProvider,
    config: C,
    initialize: (universe: Universe<C>) => Promise<void>,
    opts: Partial<{
      tokenLoader?: TokenLoader
      approvalsStore?: ApprovalsStore
    }> = {}
  ) {
    const universe = new Universe<C>(
      provider,
      config,
      opts.approvalsStore ?? new ApprovalsStore(provider),
      opts.tokenLoader ?? makeTokenLoader(provider)
    )
    universe.oracles.push(new LPTokenPriceOracle(universe))

    initialize(universe).then(async () => {
      // Load all predefined rTokens
      await Promise.all(
        Object.values(universe.config.addresses.rTokens).map(
          async (rTokenAddress) => {
            await universe.defineRToken(rTokenAddress)
          }
        )
      )
      universe._finishResolving()
    })

    return universe
  }

  // Used for analytics to track interesting zapper events
  public emitEvent(object: { type: string; params: Record<string, any> }) {
    this.emitter.emit('event', {
      ...object,
      chainId: this.chainId,
    })
  }

  public onEvent(
    cb: (event: {
      type: string
      params: Record<string, any>
      chainId: number
    }) => void
  ): () => void {
    this.emitter.on('event', cb)
    return () => {
      this.emitter.off('event', cb)
    }
  }

  get approvalAddress() {
    return this.config.addresses.zapperAddress.address
  }

  public async zap(
    tokenIn: string,
    amountIn: bigint,
    rToken: string,
    signerAddress: string
  ) {
    const [inputTokenQty, outputToken] = await Promise.all([
      this.getToken(Address.from(tokenIn)).then((tok) => tok.from(amountIn)),
      this.getToken(Address.from(rToken)),
    ])

    return this.searcher.findSingleInputToRTokenZap(
      inputTokenQty,
      outputToken,
      Address.from(signerAddress),
      this.config.defaultInternalTradeSlippage
    )
  }

  public async zapETH(amountIn: bigint, rToken: string, signerAddress: string) {
    const inputTokenQty = this.nativeToken.from(amountIn)
    const outputToken = await this.getToken(Address.from(rToken))

    return this.searcher.findSingleInputToRTokenZap(
      inputTokenQty,
      outputToken,
      Address.from(signerAddress),
      this.config.defaultInternalTradeSlippage
    )
  }

  public async redeem(
    rToken: string,
    amount: bigint,
    output: string,
    signerAddress: string
  ) {
    const [inputTokenQty, outputToken] = await Promise.all([
      this.getToken(Address.from(rToken)).then((tok) => tok.from(amount)),
      this.getToken(Address.from(output)),
    ])
    return this.searcher.findRTokenIntoSingleTokenZap(
      inputTokenQty,
      outputToken,
      Address.from(signerAddress),
      this.config.defaultInternalTradeSlippage
    )
  }
}
function shuffle<T>(array: T[]): T[] {
  const out = [...array]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}
