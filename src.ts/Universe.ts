import { ethers } from 'ethers'

import {
  findTradeSize,
  type BaseAction as Action,
} from './action/Action'
import { LPToken } from './action/LPToken'
import { Address } from './base/Address'
import { DefaultMap } from './base/DefaultMap'
import {
  SimulateZapTransactionFunction,
  createSimulateZapTransactionUsingProvider,
  createSimulatorThatUsesOneOfReservesCallManyProxies,
  type Config,
} from './configuration/ChainConfiguration'
import {
  Token,
  type TokenQuantity,
} from './entities/Token'
import { TokenLoader, makeTokenLoader } from './entities/makeTokenLoader'
import { Graph } from './exchange-graph/Graph'
import { PriceOracle } from './oracles/PriceOracle'
import { ApprovalsStore } from './searcher/ApprovalsStore'

import EventEmitter from 'events'
import winston from 'winston'
import { CompoundV2Deployment } from './action/CTokens'
import { LidoDeployment } from './action/Lido'
import { RTokenDeployment } from './action/RTokens'
import { TradingVenue } from './aggregators/DexAggregator'
import { BlockCache } from './base/BlockBasedCache'
import {
  GAS_TOKEN_ADDRESS,
  USD_ADDRESS,
  simulationUrls,
} from './base/constants'
import { AaveV2Deployment } from './configuration/setupAaveV2'
import { AaveV3Deployment } from './configuration/setupAaveV3'
import { CompoundV3Deployment } from './configuration/setupCompV3'
import { ReserveConvex } from './configuration/setupConvexStakingWrappers'
import { CurveIntegration } from './configuration/setupCurve'
import { ZapperExecutor__factory } from './contracts'
import { TokenType, isAsset } from './entities/TokenClass'
import { ZapperTokenQuantityPrice } from './oracles/ZapperAggregatorOracle'
import { PerformanceMonitor } from './searcher/PerformanceMonitor'
import { SwapPath } from './searcher/Swap'
import { ToTransactionArgs } from './searcher/ToTransactionArgs'
import { Contract } from './tx-gen/Planner'

type TokenList<T> = {
  [K in keyof T]: Token
}
export type Integrations = Partial<{
  aaveV3: AaveV3Deployment
  aaveV2: AaveV2Deployment
  fluxFinance: CompoundV2Deployment
  compoundV2: CompoundV2Deployment
  compoundV3: CompoundV3Deployment
  uniswapV3: TradingVenue
  curve: CurveIntegration
  rocketpool: TradingVenue
  aerodrome: TradingVenue
  lido: LidoDeployment
  convex: ReserveConvex
}>
export class Universe<const UniverseConf extends Config = Config> {
  private emitter = new EventEmitter()
  private yieldPositionZaps: Map<Token, Token> = new Map();
  public defineYieldPositionZap(yieldPosition: Token, rTokenInput: Token) {
    this.yieldPositionZaps.set(yieldPosition, rTokenInput)
  }

  public readonly underlyingToken = new DefaultMap<Token, Promise<Token>>(async (token: Token): Promise<Token> => {
    if (token === this.nativeToken || token === this.wrappedNativeToken) {
      return this.wrappedNativeToken
    }
    const tokenType = await this.tokenType.get(token);

    if (tokenType === TokenType.LPToken) {
      return token
    }
    if (tokenType === TokenType.ETHLST || isAsset(tokenType)) {
      return token
    }
    if (this.mintableTokens.has(token)) {
      const mint = this.getMintAction(token)!;
      if (mint.inputToken.length === 1) {
        return this.underlyingToken.get(mint.inputToken[0])
      }
    }
    for(const [base, tok] of this.yieldPositionZaps.entries()) {
      if (tok === token) {
        return this.underlyingToken.get(base)
      }
    }
    
    return token
  })

  public readonly tokenType = new DefaultMap<Token, Promise<TokenType>>(async token => {
    if (token === this.nativeToken || token === this.wrappedNativeToken) {
      return TokenType.Asset
    }
    if (this.rTokensInfo.tokens.has(token)) {
      return TokenType.RToken
    }
    if (this.lpTokens.has(token)) {
      return TokenType.LPToken
    }
    const cls = await this.tokenClass.get(token)
    if (cls === this.nativeToken) {
      return TokenType.ETHLST
    }
    if (this.mintableTokens.has(token)) {
      return TokenType.OtherMintable
    }
    if (cls === this.usd) {
      return TokenType.Asset
    }
    return TokenType.Asset
  })

  public readonly tokenClass = new DefaultMap<Token, Promise<Token>>(async (token: Token): Promise<Token> => {
    if (this.wrappedNativeToken === token || this.nativeToken === token) {
      return this.wrappedNativeToken
    }
    if (this.rTokensInfo.tokens.has(token)) {
      const basketTokenClasses = await Promise.all(this.rTokenDeployments.get(token)!.basket.map(t => this.tokenClass.get(t)));
      if (basketTokenClasses.every(t => t === basketTokenClasses[0])) {
        return basketTokenClasses[0]
      }
      return token;
    }
    if (this.mintableTokens.has(token)) {
      const classes = await Promise.all(this.getMintAction(token)!.inputToken.map(t => this.tokenClass.get(t)))
      if (classes.every(t => t === classes[0])) {
        return classes[0]
      }
      return token;
    }
    const tokenPrice = (await this.fairPrice(token.one))?.asNumber() ?? 0;
    if (tokenPrice == 0) {
      throw new Error('Failed to get price')
    }
    if (this.lpTokens.has(token)) {
      const poolTokens = (await this.lpTokens.get(token)!.lpRedeem(token.one)).map(i => i.token)
      const classes = await Promise.all(poolTokens.map(t => this.tokenClass.get(t)))
      if (classes.every(t => t === classes[0])) {
        return classes[0]
      }
      return token;
    }
    if (Math.abs(1 - tokenPrice) < 0.05) {
      return await this.getToken(this.config.addresses.usdc)
    }
    const ethPrice = (await this.fairPrice(this.wrappedNativeToken.one))?.asNumber() ?? 0;
    if (ethPrice == 0) {
      throw new Error('Failed to get eth price')
    }
    if (Math.abs(ethPrice - tokenPrice) < ethPrice * 0.15) {
      return this.wrappedNativeToken
    }
    return token
  })

  public _finishResolving: () => void = () => { }
  public initialized: Promise<void> = new Promise((resolve) => {
    this._finishResolving = resolve
  })
  get chainId(): UniverseConf['chainId'] {
    return this.config.chainId
  }

  private readonly caches: BlockCache<any, any>[] = []

  public readonly perf = new PerformanceMonitor()
  public prettyPrintPerfs(addContext = false) {
    this.logger.info('Performance Stats')
    for (const [_, value] of this.perf.stats.entries()) {
      this.logger.info('  ' + value.toString())
      if (addContext) {
        for (const context of value.contextStats) {
          this.logger.info('    ' + context.toString())
        }
      }
    }
  }
  public createCache<Input, Result, Key = Input>(
    fetch: (key: Input) => Promise<Result>,
    ttl: number = (12000 / this.config.requoteTolerance),
    keyFn?: (key: Input) => Key
  ): BlockCache<Input, Result, Key> {
    const cache = new BlockCache<Input, Result, Key>(fetch, ttl, Date.now(), keyFn as any)
    this.caches.push(cache)
    return cache
  }

  public createCachedProducer<Result>(
    fetch: () => Promise<Result>,
    ttl: number = (12000 / this.config.requoteTolerance)
  ): () => Promise<Result> {
    let lastFetch: number = 0
    let lastResult: Promise<Result> | null = null
    return async () => {
      if (lastResult == null || Date.now() - lastFetch > ttl) {
        lastFetch = Date.now()
        lastResult = fetch()
        void lastResult.catch(e => {
          lastResult = null
          throw e
        });
      }
      return await lastResult
    }
  }

  public readonly tokens = new Map<Address, Token>()
  public readonly lpTokens = new Map<Token, LPToken>()

  private _gasTokenPrice: TokenQuantity | null = null
  public get gasTokenPrice() {
    return this._gasTokenPrice ?? this.usd.from(3000)
  }

  public getMintAction(token: Token) {
    return this.mintableTokens.get(token)
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

  public readonly actions = new DefaultMap<Address, Action[]>(() => [])
  private readonly allActions = new Set<Action>()

  public readonly tokenTradeSpecialCases = new Map<
    Token,
    (amount: TokenQuantity, destination: Address) => Promise<SwapPath | null>
  >()

  public readonly tokenFromTradeSpecialCases = new Map<
    Token,
    (amount: TokenQuantity, output: Token) => Promise<SwapPath | null>
  >()

  // The GAS token for the EVM chain, set by the StaticConfig
  public readonly nativeToken: Token
  public readonly wrappedNativeToken: Token

  // 'Virtual' token used for pricing things
  public readonly usd: Token = Token.createToken(
    this,
    Address.fromHexString(USD_ADDRESS),
    'USD',
    'USD Dollar',
    8
  )

  private fairPriceCache: BlockCache<TokenQuantity, TokenQuantity, string>

  public readonly graph: Graph = new Graph()
  public readonly wrappedTokens = new Map<
    Token,
    { mint: Action; burn: Action; allowAggregatorSearcher: boolean }
  >()
  public readonly mintableTokens = new Map<
    Token,
    Action
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
  public getTradingVenues(input: TokenQuantity, output: Token) {
    const venues = this.tradeVenues
    const out = venues.filter((venue) =>
      venue.router.supportsSwap(input, output)
    )
    if (out.length !== 0) {
      return out
    }

    throw new Error(
      `Failed to find any trading venues for ${input.token} -> ${output}`
    )
  }

  public async swap(
    input: TokenQuantity,
    output: Token,
    opts?: {
      slippage: bigint
      dynamicInput: boolean
      abort: AbortSignal
    }
  ) {
    const out: SwapPath[] = []
    await this.swaps(
      input,
      output,
      async (res) => {
        out.push(res)
      },
      {
        ...opts,
        slippage: this.config.defaultInternalTradeSlippage,
        dynamicInput: true,
        abort: AbortSignal.timeout(this.config.routerDeadline),
      }
    )
    out.sort((l, r) => l.compare(r))
    return out[0]
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
    const tradeSize = await this.fairPrice(input)
    const wrapper = this.wrappedTokens.get(input.token)
    if (wrapper?.allowAggregatorSearcher === false) {
      return
    }
    const aggregators = this.getTradingVenues(input, output)

    const tradeName = `${input.token} -> ${output}`
    const stopSearch = new AbortController()
    const stopWork = new Promise((resolve) => {
      stopSearch.signal.addEventListener('abort', () => {
        resolve(null)
      })
    })

    let results = 0;
    const start = Date.now()
    const tradeValue = tradeSize?.asNumber() ?? 0;
    const work = Promise.all(
      shuffle(aggregators).map(async (venue) => {
        try {
          let inp = input
          if (
            opts.dynamicInput && !venue.supportsDynamicInput
          ) {
            inp = inp.mul(inp.token.from(0.99999))
          }
          const res = await this.perf.measurePromise(
            venue.name,
            venue.router.swap(opts.abort, inp, output, opts.slippage),
            tradeName
          )
          const outValue = res.outputValue.asNumber();
          if (outValue >= tradeValue * 0.96) {
            // IF trade does not loose more than 4% value, count the result
            results += 1;
          }


          // For small trades, allow us to bail before the timeout
          if (tradeSize && tradeSize.amount < 50000_00000000n) {
            if (results >= this.config.routerMinResults) {
              const delta = Date.now() - start

              // We're essentially 
              const toWait = delta > 2500 ? 500 : (2500 - delta) / 2 + 500;

              setTimeout(() => {
                if (!stopSearch.signal.aborted) {
                  stopSearch.abort()
                }
              }, toWait)
            }
          }



          if (stopSearch.signal.aborted || opts.abort.aborted) {
            return;
          }
          // console.log(`${venue.name} ok: ${res.steps[0].action.toString()}`)
          await onResult(res)

        } catch (e: any) {
          // console.log(`${venue.name} failed for case: ${tradeName}`)
          // console.log(e.message)
        }
      })
    )

    await Promise.race([work, stopWork])

  }

  // Sentinel token used for pricing things
  public readonly rTokens = {} as TokenList<
    UniverseConf['addresses']['rTokens']
  >
  public readonly commonTokens = {} as TokenList<
    UniverseConf['addresses']['commonTokens']
  >

  private commonTokensSet_: Set<Token> | null = null
  public get commonTokensInfo() {
    if (this.commonTokensSet_ == null) {
      this.commonTokensSet_ = new Set(Object.values(this.commonTokens))
    }
    return {
      addresses: new Set([...this.commonTokensSet_].map((i) => i.address)),
      tokens: this.commonTokensSet_,
    }
  }
  private rTokensSet_: Set<Token> | null = null
  public get rTokensInfo() {
    if (this.rTokensSet_ == null) {
      this.rTokensSet_ = new Set(Object.values(this.rTokens))
    }
    return {
      addresses: new Set([...this.rTokensSet_].map((i) => i.address)),
      tokens: this.rTokensSet_,
    }
  }

  public preferredRTokenInputToken = new DefaultMap<Token, Set<Token>>(() => new Set())
  public preferredToken = new Map<Token, Token>()
  public addPreferredRTokenInputToken(token: Token, inputToken: Token) {
    this.preferredRTokenInputToken.get(token).add(inputToken)
    if (!this.preferredToken.has(token)) {
      this.preferredToken.set(token, inputToken)
    }
  }


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
    this.rTokensInfo.addresses.add(rToken.address)
    this.rTokensInfo.tokens.add(rToken)
    return rToken
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

  public async balanceOf(token: Token, account: Address) {
    return await this.approvalsStore.queryBalance(token, account, this)
  }

  private readonly blockState = {
    currentBlock: 0,
    gasPrice: 0n,
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
  public readonly oracle: ZapperTokenQuantityPrice

  public readonly singleTokenPriceOracles = new Map<Token, PriceOracle>()
  public async addSingleTokenPriceOracle(opts: {
    token: Token
    oracleAddress: Address
    priceToken: Token
  }) {
    const { token, oracleAddress, priceToken = this.usd } = opts;
    const oracle = await PriceOracle.createSingleTokenOracleChainLinkLike(
      this,
      token,
      oracleAddress,
      priceToken
    )
    this.singleTokenPriceOracles.set(token, oracle)
    // this.oracles.push(oracle)
    return oracle
  }
  public addSingleTokenPriceSource(opts: {
    token: Token
    priceFn: () => Promise<TokenQuantity>
  }) {
    const { token, priceFn } = opts;
    const oracle = PriceOracle.createSingleTokenOracle(
      this,
      token,
      priceFn
    )
    this.singleTokenPriceOracles.set(token, oracle)
    return oracle
  }
  async fairPrice(qty: TokenQuantity) {
    const perfStart = this.perf.begin('fairPrice', qty.token.symbol)
    let out: TokenQuantity | null = await this.fairPriceCache.get(qty)
    if (out.amount === 0n) {
      out = null
    }
    perfStart()
    return out
  }

  async quoteIn(qty: TokenQuantity, tokenToQuoteWith: Token) {
    return this.oracle?.quoteIn(qty, tokenToQuoteWith).catch(() => null) ?? null
  }

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
        this,
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
      this,
      address,
      symbol,
      name,
      decimals
    )
    return token
  }

  public addAction(action: Action, actionAddress?: Address) {
    if (this.allActions.has(action)) {
      return this
    }
    this.allActions.add(action)
    if (actionAddress != null) {
      this.actions.get(actionAddress).push(action)
    } else {
      this.actions.get(action.address).push(action)
    }
    this.graph.addEdge(action);

    return this
  }

  public async defineLPToken(
    lpToken: Token,
    burn: (a: TokenQuantity) => Promise<TokenQuantity[]>,
    mint: (a: TokenQuantity[]) => Promise<TokenQuantity>) {
    const underlyingPrLP = await burn(lpToken.one)
    const positionTokens = underlyingPrLP.map(i => i.token);

    const inst = new LPToken(
      lpToken,
      positionTokens,
      burn,
      mint
    )

    this.addSingleTokenPriceSource({
      token: lpToken,
      priceFn: async () => {
        const underlyings = (await burn(lpToken.one))
        const prices = await Promise.all(
          underlyings.map(async (i) => {
            const p = await this.fairPrice(i)
            if (p == null) {
              throw new Error(`Cannot price ${lpToken}: Failed to price ${i}`)
            }
            return p
          })
        )
        return prices.reduce((l, r) => l.add(r), this.usd.zero)
      },
    })
    this.lpTokens.set(lpToken, inst)
  }

  public weirollZapperExec
  public weirollZapperExecContract

  findBurnActions(token: Token) {
    const out = this.actions
      .get(token.address)
      .filter((i) => i.inputToken.length === 1 && i.inputToken[0] === token)
    return [...out]
  }
  get execAddress() {
    return this.config.addresses.executorAddress
  }
  get zapperAddress() {
    return this.config.addresses.zapperAddress
  }

  public defineMintable(
    mint: Action,
    burn: Action,
    allowAggregatorSearcher = false
  ) {
    if (mint.outputToken.length === 1) {
      this.mintableTokens.set(mint.outputToken[0], mint)
    }
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
    if (this.wrappedTokens.has(output)) {
      throw new Error('Token already mintable')
    }
    this.addAction(mint)
    this.addAction(burn)

    const out = {
      mint,
      burn,
      allowAggregatorSearcher,
    }
    this.wrappedTokens.set(output, out)
    return out
  }

  public simulateZapFn: SimulateZapTransactionFunction

  public mintRate: BlockCache<Token, TokenQuantity>;
  public mintRateProviders = new Map<Token, () => Promise<TokenQuantity>>()
  public midPrices: BlockCache<Action, TokenQuantity>;
  private _maxTradeSizes: DefaultMap<Action, Promise<BlockCache<number, TokenQuantity>>> = new DefaultMap(async edge => {
    if (!edge.is1to1) {
      throw new Error('Edge is not 1-to-1')
    }
    const inputToken = edge.inputToken[0]
    const liquidity = (await edge.liquidity()) * 0.5
    if (!isFinite(liquidity)) {
      throw new Error('Liquidity is not finite')
    }

    const inputTokenPrice = (await inputToken.price).asNumber()
    const maxSize = inputToken.from(liquidity / inputTokenPrice)

    return this.createCache(
      async (limit: number) => {
        // const inputTokenPrice = (await inputToken.price).asNumber()
        // const outputTokenPrice = (await edge.outputToken[0].price).asNumber()
        // const txFeePrice = (await this.nativeToken.from(edge.gasEstimate() * this.gasPrice).price()).asNumber()

        return inputToken.from(
          await findTradeSize(edge, maxSize, limit)
        )
      }
    )
  })

  public async getMaxTradeSize(edge: Action, limit: number) {
    return (await this._maxTradeSizes.get(edge)).get(limit)
  }

  private constructor(
    public readonly provider: ethers.providers.JsonRpcProvider,
    public readonly config: UniverseConf,
    public readonly approvalsStore: ApprovalsStore,
    public readonly loadToken: TokenLoader,
    private readonly simulateZapFn_: SimulateZapTransactionFunction,
    public readonly logger: winston.Logger = winston.createLogger({
      level: process.env.LOG_LEVEL ?? "info",
      format: winston.format.json(),
      silent: process.env.DEV !== '1',
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    })
  ) {
    const nativeToken = config.nativeToken
    this.nativeToken = Token.createToken(
      this,
      Address.fromHexString(GAS_TOKEN_ADDRESS),
      nativeToken.symbol,
      nativeToken.name,
      nativeToken.decimals
    )

    this.midPrices = this.createCache(async (edge: Action) => {
      if (!edge.is1to1) {
        throw new Error(`${edge} is not 1to1`)
      }
      const inputToken = edge.inputToken[0]
      const outputToken = edge.outputToken[0]
      const outputSize = (await edge.quote([inputToken.one.scalarMul(10n)]))[0]
      return outputToken.from(outputSize.asNumber() / 10)
    }, 12000)

    

    this.wrappedNativeToken = Token.createToken(
      this,
      config.addresses.wrappedNative,
      'W' + nativeToken.symbol,
      'Wrapped ' + nativeToken.name,
      nativeToken.decimals
    )

    this.weirollZapperExec = Contract.createLibrary(
      ZapperExecutor__factory.connect(
        this.config.addresses.executorAddress.address,
        this.provider
      )
    )
    this.weirollZapperExecContract = Contract.createContract(
      ZapperExecutor__factory.connect(
        this.config.addresses.executorAddress.address,
        this.provider
      )
    )
    this.oracle = new ZapperTokenQuantityPrice(this)
    this.fairPriceCache = this.createCache<TokenQuantity, TokenQuantity, string>(
      async (qty: TokenQuantity) => {
        const out = await this.oracle.quote(qty).catch((e) => {
            console.log(e)
            return this.usd.zero
          })
        return out
      },
      this.config.requoteTolerance,
      i => i.toString()
    )
    const pending = new Map<string, Promise<string>>()
    this.simulateZapFn = async (params) => {
      const keyObj = {
        data: params.data?.toString(),
        value: params.value?.toString(),
        block: this.currentBlock,
        setup: {
          inputTokenAddress: params.setup.inputTokenAddress,
          amount: params.setup.userBalanceAndApprovalRequirements.toString(),
        },
      }
      const k = JSON.stringify(keyObj)
      const prev = pending.get(k)
      if (prev != null) {
        return prev
      }
      const p = this.simulateZapFn_(params, this)

      pending.set(k, p)

      p.then(() => {
        if (pending.get(k) === p) {
          pending.delete(k)
        }
      })
      return p
    }

    const native = this.nativeToken
    const wrappedNative = this.wrappedNativeToken
    this.mintRate = this.createCache(async (token: Token) => {
      if (this.mintRateProviders.has(token)) {
        return await this.mintRateProviders.get(token)!()
      }
      if (token === wrappedNative) {
        return native.one
        }
        if (!this.mintableTokens.has(token)) {
          throw new Error(`${token} is not mintable`)
        }
        const mint = this.mintableTokens.get(token)!
        if (mint.inputToken.length !== 1) {
          if (this.rTokenDeployments.has(token)) {
            const deployment = this.rTokenDeployments.get(token)!
            return await deployment.exchangeRate()
          }
          const underlying = await mint.inputProportions()
          const outToken = await this.tokenClass.get(token)
          let sum = 0.0
          while(underlying.length !== 0) {
            const rate =  underlying.pop()!
            if (this.mintableTokens.has(rate.token)) {
              const newRate = await this.mintRate.get(rate.token)
              underlying.push(newRate.mul(rate.into(newRate.token)))
            } else {
              sum += rate.asNumber()
            }
          }
          return outToken.from(sum)
        }
        const out = await mint.quote([mint.inputToken[0].one])
        if (out.length !== 1) {
          throw new Error(`${mint} returned ${out.length} outputs, expected 1`)
        }
        const outN = 1 / out[0].asNumber()
        
        const rate = mint.inputToken[0].from(outN)
        const ratePrice = (await rate.price()).asNumber()
        const inputTokenPrice = (await mint.inputToken[0].price).asNumber()
        
        return mint.inputToken[0].from(
          1/(ratePrice/inputTokenPrice)
        )
      }
    )
  }


  public async updateBlockState(block: number, gasPrice: bigint) {
    if (block <= this.blockState.currentBlock) {
      return
    }
    for (const router of this.tradeVenues) {
      router.router.onBlock(block, this.config.requoteTolerance)
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
      logger?: winston.Logger
      tokenLoader?: TokenLoader
      approvalsStore?: ApprovalsStore
      simulateZapFn?: SimulateZapTransactionFunction
    }> = {}
  ) {

    const network = await provider.getNetwork()
    let simulateZapFunction = opts.simulateZapFn

    if (simulateZapFunction == null) {
      simulateZapFunction =
        opts.simulateZapFn ?? simulationUrls[network.chainId]
          ? createSimulatorThatUsesOneOfReservesCallManyProxies(network.chainId)
          : createSimulateZapTransactionUsingProvider(provider)
    }

    const universe = new Universe<C>(
      provider,
      config,
      opts.approvalsStore ?? new ApprovalsStore(provider),
      opts.tokenLoader ?? makeTokenLoader(provider),
      simulateZapFunction,
      opts.logger
    )
    // universe.oracles.push(new LPTokenPriceOracle(universe))
    await Promise.all(
      Object.values(universe.config.addresses.rTokens).map(
        async (rTokenAddress) => {
          await universe.defineRToken(rTokenAddress)
        }
      )
    )
    initialize(universe).then(async () => {
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

  public async zap(
    userInput: TokenQuantity,
    rToken: Token | string,
    userAddress: Address | string,
    opts?: ToTransactionArgs
  ) {
    if (typeof userAddress === 'string') {
      userAddress = Address.from(userAddress)
    }
    if (typeof rToken === 'string') {
      rToken = await this.getToken(Address.from(rToken))
    }
    throw new Error("...")
    // const out = await this.searcher.zapIntoRToken(
    //   userInput,
    //   rToken,
    //   userAddress,
    //   opts
    // )
    // return out.bestZapTx.tx
  }
  public async redeem(
    rTokenQuantity: TokenQuantity,
    outputToken: Token | string,
    userAddress: Address | string,
    opts?: ToTransactionArgs
  ) {
    if (typeof userAddress === 'string') {
      userAddress = Address.from(userAddress)
    }
    if (typeof outputToken === 'string') {
      outputToken = await this.getToken(Address.from(outputToken))
    }
    throw new Error("...")
    // const out = await this.searcher.redeem(
    //   rTokenQuantity,
    //   outputToken,
    //   userAddress,
    //   opts
    // )
    // return out.bestZapTx.tx
  }

  get approvalAddress() {
    return this.config.addresses.zapperAddress.address
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
