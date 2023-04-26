import { ethers } from 'ethers'
import { id } from 'ethers/lib/utils'

import { type Action } from './action/Action'
import { Address } from './base/Address'
import { predefinedConfigurations } from './configuration/chainConfigRegistry'
import { Graph } from './exchange-graph/Graph'
import { Token, type TokenQuantity } from './entities/Token'
import { type ChainConfiguration } from './configuration/ChainConfiguration'
import { CommonTokens, RTokens } from './configuration'

import { DefaultMap } from './base/DefaultMap'
import { ERC20__factory, IMain__factory } from './contracts'
import { type Oracle } from './oracles/Oracle'
import { type DexAggregator } from './aggregators/DexAggregator'
import { parseHexStringIntoBuffer } from './base'
import { Refreshable } from './entities/Refreshable'
import { ApprovalsStore } from './searcher/ApprovalsStore'
import { TokenBasket } from './entities/TokenBasket'
import { MintRTokenAction, BurnRTokenAction } from './action'
import { LPToken } from './action/LPToken'

export class Universe {
  public chainId = 0
  public readonly refreshableEntities = new Map<Address, Refreshable>()
  public approvalStore: ApprovalsStore

  public readonly tokens = new Map<Address, Token>()
  public readonly lpTokens = new Map<Token, LPToken>()
  public readonly actions = new DefaultMap<Address, Action[]>(() => [])

  // The GAS token for the EVM chain, set by the StaticConfig
  public readonly nativeToken: Token

  // Sentinel token used for pricing things
  public readonly usd: Token = Token.createToken(
    this.tokens,
    Address.fromHexString('0x0000000000000000000000000000000000000348'),
    'USD',
    'USD Dollar',
    8
  )

  public readonly graph: Graph = new Graph()
  public readonly wrappedTokens = new Map<
    Token,
    { mint: Action; burn: Action }
  >()
  public readonly oracles: Oracle[] = []

  public readonly dexAggregators: DexAggregator[] = []

  // Sentinel token used for pricing things
  public readonly rTokens: {
    [P in keyof RTokens]: Token | null
  } = {} as any
  public readonly commonTokens: {
    [P in keyof CommonTokens]: Token | null
  } = {
    USDC: null,
    USDT: null,
    DAI: null,
    WBTC: null,
    ERC20ETH: null,
    ERC20GAS: null,
  }

  async refresh(entity: Address) {
    const refreshable = this.refreshableEntities.get(entity)
    if (refreshable == null) {
      return
    }
    await refreshable.refresh(this.currentBlock)
  }
  createRefreshableEntitity(
    address: Address,
    refresh: Refreshable['refreshAddress']
  ) {
    this.refreshableEntities.set(address, new Refreshable(address, -1, refresh))
  }

  get config() {
    return this.chainConfig.config
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
  async fairPrice(qty: TokenQuantity): Promise<TokenQuantity | null> {
    const wrappedToken = this.wrappedTokens.get(qty.token)
    if (wrappedToken != null) {
      const outTokens = await wrappedToken.burn.quote([qty])
      const sums = await Promise.all(
        outTokens.map(
          async (qty) =>
            await this.fairPrice(qty).then((i) => i ?? this.usd.zero)
        )
      )
      return sums.reduce((l, r) => l.add(r))
    } else {
      for (const oracle of this.oracles) {
        const price = await oracle.fairTokenPrice(this.currentBlock, qty.token)
        if (price != null) {
          const out = price.into(qty.token).mul(qty).into(this.usd)
          return out
        }
      }
    }
    return null
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
      const data = await loadERC20FromChain(this.provider, address)
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

  public defineMintable(mint: Action, burn: Action) {
    const output = mint.output[0]
    this.addAction(mint, output.address)
    this.addAction(burn, output.address)
    this.wrappedTokens.set(output, {
      mint,
      burn,
    })
  }

  private constructor(
    public readonly provider: ethers.providers.Provider,
    public readonly chainConfig: ChainConfiguration,
    approvalsStore: ApprovalsStore
  ) {
    const nativeToken = chainConfig.config.nativeToken
    this.approvalStore = approvalsStore
    this.nativeToken = Token.createToken(
      this.tokens,
      Address.fromHexString('0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'),
      nativeToken.symbol,
      nativeToken.name,
      nativeToken.decimals
    )
  }

  public async updateBlockState(block: number, gasPrice: bigint) {
    if (block <= this.blockState.currentBlock) {
      return
    }
    this.blockState.currentBlock = block
    this.blockState.gasPrice = gasPrice
  }

  static async create(provider: ethers.providers.Provider): Promise<Universe> {
    const network = await provider.getNetwork()
    const config = predefinedConfigurations[network.chainId]
    if (config == null) {
      throw new Error(`
Library does not come pre-shipped with config for chainId: ${network.chainId}.
But can set up your own config with 'createWithConfig'`)
    }

    return await Universe.createWithConfig(provider, config, network)
  }

  static async createWithConfig(
    provider: ethers.providers.Provider,
    config: ChainConfiguration,
    network: ethers.providers.Network
  ): Promise<Universe> {
    const universe = new Universe(
      provider,
      config,
      new ApprovalsStore(provider)
    )
    universe.chainId = network.chainId

    const [currentBlock, gasPrice] = [
      await provider.getBlockNumber(),
      await provider.getGasPrice(),
    ]
    universe.updateBlockState(currentBlock, gasPrice.toBigInt())
    await config.initialize(universe)

    return universe
  }

  static async createForTest(config: ChainConfiguration) {
    const universe = new Universe(null as any, config, {
      async needsApproval(_: Token, __: Address, ___: Address) {
        return true
      },
    } as ApprovalsStore)
    return universe
  }

  async defineRToken(mainAddress: Address) {
    const mainInst = IMain__factory.connect(mainAddress.address, this.provider)
    const [rTokenAddr, basketHandlerAddress] = await Promise.all([
      mainInst.rToken(),
      mainInst.basketHandler(),
    ])
    const token = await this.getToken(Address.from(rTokenAddr))
    const basketHandler = new TokenBasket(
      this,
      Address.from(basketHandlerAddress),
      token
    )
    this.rTokens[token.symbol as keyof RTokens] = token
    await basketHandler.update()
    this.createRefreshableEntitity(basketHandler.address, () =>
      basketHandler.update()
    )

    this.defineMintable(
      new MintRTokenAction(this, basketHandler),
      new BurnRTokenAction(this, basketHandler)
    )
  }
}

async function loadERC20FromChain(
  provider: ethers.providers.Provider,
  address: Address
) {
  const erc20 = ERC20__factory.connect(address.address, provider)
  let [symbol, decimals] = await Promise.all([
    provider.call({
      to: address.address,
      data: id('symbol()').slice(0, 10),
    }),
    erc20.decimals().catch(() => 0),
  ])

  if (symbol.length === 66) {
    let buffer = parseHexStringIntoBuffer(symbol)
    let last = buffer.indexOf(0)
    if (last == -1) {
      last = buffer.length
    }
    buffer = buffer.subarray(0, last)
    symbol = buffer.toString('utf8')
  } else {
    symbol = ethers.utils.defaultAbiCoder.decode(['string'], symbol)[0]
  }

  return {
    symbol,
    decimals,
  }
}
