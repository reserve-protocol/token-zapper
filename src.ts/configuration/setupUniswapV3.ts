import { ethers } from 'ethers'
import { Universe } from '../Universe'
import {
  Action,
  BaseAction,
  DestinationOptions,
  InteractionConvention,
} from '../action/Action'
import { Address } from '../base/Address'
import { Approval } from '../base/Approval'
import { BlockCache } from '../base/BlockBasedCache'
import {
  ISwapRouter,
  ISwapRouter__factory,
  IUniV3Factory,
  IUniV3Factory__factory,
  IUniV3Pool,
  IUniV3Pool__factory,
  IUniV3QuoterV2,
  IUniV3QuoterV2__factory,
  UniV3RouterCall__factory,
} from '../contracts'
import { Token, TokenQuantity } from '../entities/Token'
import { Contract, Planner, Value } from '../tx-gen/Planner'
import fs from 'fs'
import { DefaultMap } from '../base/DefaultMap'
import { Graph } from '../exchange-graph/Graph'
import { ChainId, ChainIds, isChainIdSupported } from './ReserveAddresses'
import baseUniV3 from './data/8453/univ3.json'
import mainnetUniV3 from './data/1/univ3.json'
import sushiBaseV3 from './data/8453/sushiv3.json'
import { BigintIsh } from '@uniswap/sdk-core'
import { Tick, TickList, v3Swap } from '@uniswap/v3-sdk'
import jsbi from 'jsbi'

const createTickDataQuoter = (universe: Universe, action: UniswapV3Swap) => {
  const tickDataProviderCache = async () => {
    const poolData = await universe.getTickData!(action.pool.address)
    const allTicks = Array.from(poolData.tickData.keys())
    const sqrtLimitPrice = jsbi.BigInt(poolData.sqrtPriceX96.toString())
    const ticks = allTicks
      .sort((a, b) => a - b)
      .map((index) => {
        const liqNet = jsbi.BigInt(
          (poolData.tickData.get(index)?.liquidityNet ?? 0n).toString()
        )
        const liqGross = jsbi.BigInt(
          (poolData.tickData.get(index)?.liquidityGross ?? 0n).toString()
        )
        return new Tick({
          index,
          liquidityNet: liqNet,
          liquidityGross: liqGross,
        })
      })

    return {
      async getTick(tick: number): Promise<{
        liquidityNet: BigintIsh
      }> {
        return TickList.getTick(ticks, tick)
      },
      noLiquidity: poolData.liquidity === 0n,
      fee: jsbi.BigInt(pool.fee.toString()),
      liquidity: jsbi.BigInt(poolData.liquidity.toString()),
      sqrtPriceX96: sqrtLimitPrice,
      currentTick: poolData.currentTick,
      async nextInitializedTickWithinOneWord(
        tick: number,
        lte: boolean,
        tickSpacing: number
      ): Promise<[number, boolean]> {
        return TickList.nextInitializedTickWithinOneWord(
          ticks,
          tick,
          lte,
          tickSpacing
        )
      },
    }
  }
  const pool = action.pool
  const zeroForOne = action.direction === '0->1'
  let tickDataProvider: Awaited<
    ReturnType<typeof tickDataProviderCache>
  > | null = null
  let providerCreatedAtBlock = Date.now()
  return async (amountIn: bigint) => {
    if (tickDataProvider == null) {
      tickDataProvider = await tickDataProviderCache()
      providerCreatedAtBlock = Date.now()
    } else if (Date.now() - providerCreatedAtBlock > 12000) {
      tickDataProvider = await tickDataProviderCache()
      providerCreatedAtBlock = Date.now()
    }
    if (tickDataProvider.noLiquidity) {
      throw new Error('No liquidity')
    }
    try {
      const out = await v3Swap(
        tickDataProvider.fee,
        tickDataProvider.sqrtPriceX96,
        tickDataProvider.currentTick,
        tickDataProvider.liquidity,
        pool.tickSpacing,
        tickDataProvider,
        zeroForOne,
        jsbi.BigInt(amountIn.toString())
      )

      const outputQty = action.tokenOut.from(
        -BigInt(out.amountCalculated.toString())
      )

      return {
        amountOut: outputQty,
        gasEstimate: action.gasEstimate(),
        sqrtPriceX96After: BigInt(out.sqrtRatioX96.toString()),
      }
    } catch (e) {
      console.log(e)
      console.log(`Failed for ${action}. Pool: ${action.pool.address}`)
      throw e
    }
  }
}

interface IUniswapV3Config {
  name: string
  router: string
  quoter: string
  factory: string
  pools: string[]
  staticPools: {
    id: string
    feeTier: number
    token0: { id: string }
    token1: { id: string }
  }[]
}
export const UNI_V3: Record<ChainId, IUniswapV3Config> = {
  [ChainIds.Mainnet]: {
    name: 'univ3',
    router: '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45',
    quoter: '0x61ffe014ba17989e743c5f6cb21bf9697530b21e',
    factory: '0x1f98431c8ad98523631ae4a59f267346ea31f984',
    pools: [],
    staticPools: mainnetUniV3,
  },
  [ChainIds.Arbitrum]: {
    name: 'univ3',
    router: '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45',
    quoter: '0x61ffe014ba17989e743c5f6cb21bf9697530b21e',
    factory: '0x1f98431c8ad98523631ae4a59f267346ea31f984',
    pools: [],
    staticPools: [],
  },
  [ChainIds.Base]: {
    name: 'univ3',
    router: '0x2626664c2603336e57b271c5c0b26f421741e481',
    quoter: '0x3d4e44eb1374240ce5f1b871ab261cd16335b76a',
    factory: '0x33128a8fc17869897dce68ed026d694621f6fdfd',
    pools: [],
    staticPools: baseUniV3,
  },
}

export const SUSHISWAP_V3: Record<number, IUniswapV3Config> = {
  [ChainIds.Base]: {
    name: 'sushiv3',
    router: '0xA0a65A34E2e62d83F00237aB74F2db436ec5265a',
    quoter: '0xb1E835Dc2785b52265711e17fCCb0fd018226a6e',
    factory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
    pools: [],
    staticPools: sushiBaseV3,
  },
}

const loadPools = async (ctx: UniswapV3Context, poolAddresses: Address[]) => {
  return (
    await Promise.all(
      poolAddresses.map(async (poolAddress) => {
        try {
          return await ctx.definePool(poolAddress, async () => {
            const poolContract = IUniV3Pool__factory.connect(
              poolAddress.address,
              ctx.universe.provider
            )
            const [token0Addr, token1Addr, feeNumber] = await Promise.all([
              poolContract.callStatic.token0(),
              poolContract.callStatic.token1(),
              poolContract.callStatic.fee(),
            ])
            const token0 = await ctx.universe.getToken(Address.from(token0Addr))
            const token1 = await ctx.universe.getToken(Address.from(token1Addr))
            const fee = BigInt(feeNumber)
            const tickSpacing = await ctx.tickSpacing.get(fee)
            const pool = new UniswapV3Pool(
              ctx,
              poolAddress,
              token0,
              token1,
              fee,
              tickSpacing,
              poolContract
            )
            return pool
          })
        } catch (e) {
          console.error(`Error loading pool ${poolAddress.toShortString()}`, e)
          return null
        }
      })
    )
  ).filter((p) => p != null)
}

const definePoolFromPoolDataArray = async (
  ctx: UniswapV3Context,
  poolData: {
    id: string
    feeTier: number
    token0: { id: string }
    token1: { id: string }
  }[]
) => {
  const pools = await Promise.all(
    poolData.map(async (pool) => {
      const poolAddress = Address.from(pool.id)
      return await ctx.definePool(poolAddress, async () => {
        const token0 = await ctx.universe.getToken(Address.from(pool.token0.id))
        const token1 = await ctx.universe.getToken(Address.from(pool.token1.id))
        const fee = BigInt(pool.feeTier)
        const tickSpacing = await ctx.tickSpacing.get(fee)

        const poolContract = IUniV3Pool__factory.connect(
          poolAddress.address,
          ctx.universe.provider
        )

        const outPool = new UniswapV3Pool(
          ctx,
          poolAddress,
          token0,
          token1,
          fee,
          tickSpacing,
          poolContract
        )
        return outPool
      })
    })
  )
  return pools.filter((p) => p != null)
}

export type Direction = '0->1' | '1->0'
export class UniswapV3Context {
  private readonly resolvingPools_: Map<Address, Promise<UniswapV3Pool>> =
    new Map()
  public readonly pools: Map<Address, UniswapV3Pool> = new Map()
  public readonly edges = new Graph()

  public async definePool(
    addr: Address,
    fn: () => Promise<UniswapV3Pool>
  ): Promise<UniswapV3Pool> {
    if (this.resolvingPools_.has(addr)) {
      return await this.resolvingPools_.get(addr)!
    }
    const pool = fn()
    this.resolvingPools_.set(addr, pool)
    const out = await pool
    this.pools.set(addr, out)
    this.edges.addEdge(out.swap01)
    this.edges.addEdge(out.swap10)
    return out
  }
  public readonly contracts: {
    router: ISwapRouter
    factory: IUniV3Factory
    quoter: IUniV3QuoterV2
  }
  public readonly weirollRouterCall: Contract
  public readonly tickSpacing: DefaultMap<bigint, Promise<number>> =
    new DefaultMap(async (feeTier) => {
      const tickSpacing =
        await this.contracts.factory.callStatic.feeAmountTickSpacing(feeTier)
      return Number(tickSpacing)
    })
  constructor(
    public readonly universe: Universe,
    public readonly config: {
      name: string
      routerCall: Address
      router: Address
      factory: Address
      quoter: Address
    }
  ) {
    this.contracts = {
      router: ISwapRouter__factory.connect(
        config.router.address,
        universe.provider
      ),
      factory: IUniV3Factory__factory.connect(
        config.factory.address,
        universe.provider
      ),
      quoter: IUniV3QuoterV2__factory.connect(
        config.quoter.address,
        universe.provider
      ),
    }
    this.weirollRouterCall = Contract.createLibrary(
      UniV3RouterCall__factory.connect(
        config.routerCall.address,
        universe.provider
      )
    )
  }

  public async loadPool(address: Address) {
    return (await loadPools(this, [address]))[0]
  }
}
class UniswapV3Pool {
  public readonly addresesInUse: Set<Address> = new Set()
  public readonly swap01: UniswapV3Swap
  public readonly swap10: UniswapV3Swap
  public readonly balances: () => Promise<[TokenQuantity, TokenQuantity]>
  public readonly liquidity: () => Promise<TokenQuantity>

  public toString() {
    return `${this.context.config.name}(${this.address.toShortString()}.${
      this.fee
    }.${this.token0}.${this.token1})`
  }
  public constructor(
    public readonly context: UniswapV3Context,
    public readonly address: Address,
    public readonly token0: Token,
    public readonly token1: Token,
    public readonly fee: bigint,
    public readonly tickSpacing: number,
    public readonly poolContract: IUniV3Pool
  ) {
    this.addresesInUse.add(address)

    this.swap01 = new UniswapV3Swap(this, this.token0, this.token1)
    this.swap10 = new UniswapV3Swap(this, this.token1, this.token0)

    const uni = context.universe
    this.balances = context.universe.createCachedProducer(async () => {
      const [balance0, balance1] = await Promise.all([
        uni.balanceOf(token0, address),
        uni.balanceOf(token1, address),
      ])
      return [balance0, balance1]
    })

    this.liquidity = context.universe.createCachedProducer(async () => {
      const balances = await this.balances()
      const prices = await Promise.all(
        balances.map((balance) => balance.price())
      )
      const sum = prices[0].add(prices[1])
      return sum
    })
  }
}

class UniswapV3Swap extends BaseAction {
  public get context(): UniswapV3Context {
    return this.pool.context
  }

  get protocol(): string {
    return this.context.config.name
  }

  public async liquidity(): Promise<number> {
    const out = await this.pool.liquidity()
    return out.asNumber()
  }
  public get universe(): Universe {
    return this.context.universe
  }
  get dependsOnRpc(): boolean {
    if (this.universe.getTickData != null) {
      return false
    }
    return true
  }

  private _gasEstimate: bigint = 200000n

  async quote([amountIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    const { amountOut } = await this.quoteExactSingle.get(amountIn.amount)
    return [amountOut]
  }

  async plan(
    planner: Planner,
    [input]: Value[],
    _: Address,
    [predictedInput]: TokenQuantity[]
  ): Promise<null | Value[]> {
    if (predictedInput.isZero) {
      return null
    }
    const { amountOut } = await this.quoteExactSingle.get(predictedInput.amount)

    const minOut = 0n // amountOut.amount - amountOut.amount / 4n
    const out = planner.add(
      this.context.weirollRouterCall.exactInputSingle(
        input,
        minOut,
        this.context.config.router.address,
        ethers.utils.defaultAbiCoder.encode(
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
            this.tokenIn.address.address,
            this.tokenOut.address.address,
            this.pool.fee,
            this.universe.execAddress.address,
            predictedInput.amount,
            minOut,
            0n,
          ]
        )
      ),
      `UniswapV3: Swap ${predictedInput} -> ${amountOut} on pool ${this.pool.address}`,
      `univ3_${this.pool.address.toShortString()}_${this.tokenIn}_${
        this.tokenOut
      }`
    )!
    return [out]
  }
  get isTrade(): boolean {
    return true
  }
  get oneUsePrZap(): boolean {
    return true
  }
  get supportsDynamicInput(): boolean {
    return true
  }
  get returnsOutput(): boolean {
    return true
  }
  get addressesInUse() {
    return this.pool.addresesInUse
  }
  get outputSlippage() {
    return 0n
  }
  gasEstimate(): bigint {
    return this._gasEstimate
  }

  public get direction(): Direction {
    if (this.tokenIn === this.pool.token0) {
      return '0->1'
    }
    return '1->0'
  }

  private quoteExactSingle: BlockCache<
    bigint,
    {
      amountOut: TokenQuantity
      gasEstimate: bigint
      sqrtPriceX96After: bigint
    },
    bigint
  >

  public constructor(
    public readonly pool: UniswapV3Pool,
    public readonly tokenIn: Token,
    public readonly tokenOut: Token
  ) {
    super(
      pool.address,
      [tokenIn],
      [tokenOut],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Callee,
      [new Approval(tokenIn, pool.context.config.router)]
    )

    const tickDataProvider = this.universe.getTickData

    const quoteFunction =
      tickDataProvider != null
        ? createTickDataQuoter(this.universe, this)
        : async (amount: bigint) => {
            const out =
              await this.context.contracts.quoter.callStatic.quoteExactInputSingle(
                {
                  tokenIn: this.tokenIn.address.address,
                  tokenOut: this.tokenOut.address.address,
                  fee: this.pool.fee,
                  amountIn: amount,
                  sqrtPriceLimitX96: 0n,
                }
              )

            this._gasEstimate = out.gasEstimate.toBigInt()

            return {
              amountOut: this.tokenOut.from(out.amountOut),
              gasEstimate: this._gasEstimate,
              sqrtPriceX96After: out.sqrtPriceX96After.toBigInt(),
            }
          }

    this.quoteExactSingle = this.universe.createCache(quoteFunction, 12000)
  }

  public toString() {
    return `V3Pool(${
      this.context.config.name
    },${this.pool.address.toShortString()}.${this.tokenIn}.${this.tokenOut})`
  }

  public get actionName() {
    return `swap_${this.direction}`
  }
}

export const setupUniswapV3 = async (
  universe: Universe,
  config: IUniswapV3Config
) => {
  const chainId = universe.chainId
  if (!isChainIdSupported(chainId)) {
    throw new Error(`ChainId ${chainId} not supported`)
  }
  const uniswapRouterAddress = Address.from(config.router)
  const uniswapQuoterAddress = Address.from(config.quoter)

  const ctx = new UniswapV3Context(universe, {
    name: config.name,
    router: uniswapRouterAddress,
    quoter: uniswapQuoterAddress,
    factory: Address.from(config.factory),
    routerCall: Address.from(universe.config.addresses.uniV3Router),
  })
  const additionalPoolsToLoad = config.pools.map(Address.from)
  const loadUniPools = async (): Promise<UniswapV3Pool[]> => {
    let pools: UniswapV3Pool[] = []
    pools = await definePoolFromPoolDataArray(ctx, config.staticPools)
    return pools
  }

  const knownPools = new Set<Address>()
  const allPools = (
    await Promise.all([loadUniPools(), loadPools(ctx, additionalPoolsToLoad)])
  )
    .flat()
    .filter((i) => {
      if (knownPools.has(i.address)) {
        return false
      }
      knownPools.add(i.address)
      return true
    })

  for (const pool of allPools) {
    universe.addAction(pool.swap01)
    universe.addAction(pool.swap10)
  }

  if (process.env.WRITE_DATA) {
    fs.writeFileSync(
      `src.ts/configuration/data/${chainId}/${config.name}.json`,
      JSON.stringify(
        allPools
          .map((i) => ({
            id: i.address.address.toLowerCase(),
            feeTier: Number(i.fee),
            token0: {
              id: i.token0.address.address.toLowerCase(),
            },
            token1: {
              id: i.token1.address.address.toLowerCase(),
            },
          }))
          .sort((l, r) => l.id.localeCompare(r.id)),
        null,
        2
      )
    )
  }

  return ctx
}
