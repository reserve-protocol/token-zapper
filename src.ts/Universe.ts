import { ethers } from 'ethers'

import { type BaseAction as Action } from './action/Action'
import { Address } from './base/Address'
import { Graph } from './exchange-graph/Graph'
import {
  PricedTokenQuantity,
  Token,
  type TokenQuantity,
} from './entities/Token'
import { TokenLoader, makeTokenLoader } from './entities/makeTokenLoader'
import { type Config } from './configuration/ChainConfiguration'
import { DefaultMap } from './base/DefaultMap'
import { type PriceOracle } from './oracles/PriceOracle'
import { LPTokenPriceOracle } from './oracles/LPTokenPriceOracle'
import { Refreshable } from './entities/Refreshable'
import { ApprovalsStore } from './searcher/ApprovalsStore'
import { LPToken } from './action/LPToken'
import { SourcingRule } from './searcher/SourcingRule'

import { GAS_TOKEN_ADDRESS, USD_ADDRESS } from './base/constants'
import { SwapPath } from './searcher/Swap'
import { MintRTokenAction } from './action/RTokens'
import { Searcher } from './searcher/Searcher'
import { findPrecursorTokenSet } from './searcher/Searcher'
import EventEmitter from 'events'
import { DexAggregator } from '.'

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
export class Universe<const UniverseConf extends Config = Config> {
  private emitter = new EventEmitter()
  public _finishResolving: () => void = () => {}
  public initialized: Promise<void> = new Promise((resolve) => {
    this._finishResolving = resolve
  })
  get chainId(): UniverseConf['chainId'] {
    return this.config.chainId
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

  public readonly graph: Graph = new Graph()
  public readonly wrappedTokens = new Map<
    Token,
    { mint: Action; burn: Action; allowAggregatorSearcher: boolean }
  >()
  public readonly oracles: PriceOracle[] = []

  public readonly dexAggregators: DexAggregator[] = []

  // Sentinel token used for pricing things
  public readonly rTokens = {} as TokenList<
    UniverseConf['addresses']['rTokens']
  >
  public readonly commonTokens = {} as TokenList<
    UniverseConf['addresses']['commonTokens']
  >

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
    const out =
      (await this.oracle?.quote(qty).catch(() => {
        return null
      })) ?? null

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
    // this.defineMintable(
    //   lpTokenInstance.mintAction,
    //   lpTokenInstance.burnAction,
    //   true
    // )
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
    const output = mint.outputToken[0]
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
  }

  public async updateBlockState(block: number, gasPrice: bigint) {
    if (block <= this.blockState.currentBlock) {
      return
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

    initialize(universe).then(() => {
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
      Address.from(signerAddress)
    )
  }

  public async zapETH(amountIn: bigint, rToken: string, signerAddress: string) {
    const inputTokenQty = this.nativeToken.from(amountIn)
    const outputToken = await this.getToken(Address.from(rToken))

    return this.searcher.findSingleInputToRTokenZap(
      inputTokenQty,
      outputToken,
      Address.from(signerAddress)
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
      Address.from(signerAddress)
    )
  }
}
