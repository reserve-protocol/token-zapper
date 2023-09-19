import { ethers } from 'ethers'

import { type Action } from './action/Action'
import { Address } from './base/Address'
import { Graph } from './exchange-graph/Graph'
import { Token, type TokenQuantity } from './entities/Token'
import { TokenLoader, makeTokenLoader } from './entities/makeTokenLoader'
import { type Config } from './configuration/ChainConfiguration'
import { DefaultMap } from './base/DefaultMap'
import { type PriceOracle } from './oracles/PriceOracle'
import { Refreshable } from './entities/Refreshable'
import { ApprovalsStore } from './searcher/ApprovalsStore'
import { LPToken } from './action/LPToken'
import { SourcingRule } from './searcher/SourcingRule'

import { GAS_TOKEN_ADDRESS, USD_ADDRESS } from './base/constants'
import { SwapPath } from './searcher/Swap'
import { type SwapSignature } from './aggregators/SwapSignature'

type TokenList<T> = {
  [K in keyof T]: Token
}
interface OracleDef {
  quote: (qty: TokenQuantity) => Promise<TokenQuantity>,
  quoteIn: (qty: TokenQuantity, tokenToQuoteWith: Token) => Promise<TokenQuantity>,
}
export class Universe<const UniverseConf extends Config = Config> {
  get chainId(): UniverseConf["chainId"] { return this.config.chainId }

  public readonly refreshableEntities = new Map<Address, Refreshable>()
  public readonly tokens = new Map<Address, Token>()
  public readonly lpTokens = new Map<Token, LPToken>()

  public readonly precursorTokenSourcingSpecialCases = new DefaultMap<
    Token,
    Map<Token, SourcingRule>
  >(() => new Map())
  public readonly actions = new DefaultMap<Address, Action[]>(() => [])
  private readonly allActions = new Set<Action>()

  public readonly tokenTradeSpecialCases = new Map<
    Token,
    (amount: TokenQuantity, destination: Address) => Promise<SwapPath | null>
  >()

  // The GAS token for the EVM chain, set by the StaticConfig
  public readonly nativeToken: Token

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
    { mint: Action; burn: Action, allowAggregatorSearcher: boolean }
  >()
  public readonly oracles: PriceOracle[] = []

  public readonly dexAggregators: {swap: SwapSignature}[] = []

  // Sentinel token used for pricing things
  public readonly rTokens = {} as TokenList<UniverseConf["addresses"]["rTokens"]>
  public readonly commonTokens = {} as TokenList<UniverseConf["addresses"]["commonTokens"]>

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

  public defineTokenSourcingRule(
    rToken: Token,
    precursor: Token,
    rule: SourcingRule
  ) {
    this.precursorTokenSourcingSpecialCases.get(rToken).set(precursor, rule)
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
    return this.oracle?.quote(qty).catch(() => null) ?? null
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
    this.defineMintable(lpTokenInstance.mintAction, lpTokenInstance.burnAction)
  }

  public defineMintable(mint: Action, burn: Action, allowAggregatorSearcher = false) {
    const output = mint.output[0]
    this.addAction(mint, output.address)
    this.addAction(burn, output.address)
    const out = {
      mint,
      burn,
      allowAggregatorSearcher
    }
    this.wrappedTokens.set(output, out)
    return out
  }

  private constructor(
    public readonly provider: ethers.providers.Provider,
    public readonly config: UniverseConf,
    public readonly approvalsStore: ApprovalsStore,
    public readonly loadToken: TokenLoader,
  ) {
    const nativeToken = config.nativeToken
    this.nativeToken = Token.createToken(
      this.tokens,
      Address.fromHexString(GAS_TOKEN_ADDRESS),
      nativeToken.symbol,
      nativeToken.name,
      nativeToken.decimals
    )
  }

  public updateBlockState(block: number, gasPrice: bigint) {
    if (block <= this.blockState.currentBlock) {
      return
    }
    this.blockState.currentBlock = block
    this.blockState.gasPrice = gasPrice
  }

  static async createWithConfig<const C extends Config>(
    provider: ethers.providers.Provider,
    config: C,
    initialize: (universe: Universe<C>) => Promise<void>,
    opts: Partial<{
      tokenLoader?: TokenLoader
      approvalsStore?: ApprovalsStore
    }> = {},
  ) {
    const universe = new Universe<C>(
      provider,
      config,
      opts.approvalsStore ?? new ApprovalsStore(provider),
      opts.tokenLoader ?? makeTokenLoader(provider),
    )

    await initialize(universe)

    return universe
  }
}