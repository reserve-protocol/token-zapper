import { ethers } from 'ethers'
import { Universe } from '../Universe'
import {
  Action,
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
import { SwapPlan } from '../searcher/Swap'
import { ChainId, ChainIds, isChainIdSupported } from './ReserveAddresses'
import { wait } from '../base/controlflow'
import baseUniV3 from './data/8453/univ3.json'
import mainnetUniV3 from './data/1/univ3.json'

interface IUniswapV3Config {
  subgraphId: string
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
const configs: Record<ChainId, IUniswapV3Config> = {
  [ChainIds.Mainnet]: {
    subgraphId: '5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV',
    router: '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45',
    quoter: '0x61ffe014ba17989e743c5f6cb21bf9697530b21e',
    factory: '0x1f98431c8ad98523631ae4a59f267346ea31f984',
    pools: [
      '0xf649df4372d8bb3e6178e52fcd515519c78da348',
      '0x6288694eb218614a27777F2b52D3f8D4819233C0',
    ],
    staticPools: mainnetUniV3,
  },
  [ChainIds.Arbitrum]: {
    subgraphId: 'FQ6JYszEKApsBpAmiHesRsd9Ygc6mzmpNRANeVQFYoVX',
    router: '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45',
    quoter: '0x61ffe014ba17989e743c5f6cb21bf9697530b21e',
    factory: '0x1f98431c8ad98523631ae4a59f267346ea31f984',
    pools: [],
    staticPools: [],
  },
  [ChainIds.Base]: {
    subgraphId: 'HMuAwufqZ1YCRmzL2SfHTVkzZovC9VL2UAKhjvRqKiR1',
    router: '0x2626664c2603336e57b271c5c0b26f421741e481',
    quoter: '0x3d4e44eb1374240ce5f1b871ab261cd16335b76a',
    factory: '0x33128a8fc17869897dce68ed026d694621f6fdfd',
    pools: [
      '0xab7fed603f0e5eb8f46ab58b086631d75cfbe78d',
      '0xdef0dbd2d2a1ad31c2bf6aaead5c82b6c07558c0',
    ],
    staticPools: baseUniV3.map((i) => ({
      ...i,
      feeTier: Number(i.feeTier),
    })),
  },
}

const pageSize = 250
const pages = 6
const top100PoolsQuery = `query GetPools(
  $skip: Int=0,
  $block: Int=0
){
  pools(
    first: ${pageSize}
    skip: $skip,
    where:{
      totalValueLockedUSD_gt: 25000,
      totalValueLockedUSD_lt: 10000000000,
    },
    block:{
      number: $block
    },
    orderBy: volumeUSD,
    orderDirection: desc
  ) {
    id
    feeTier
    token0 {
      id
    }
    token1 {
      id
    }
  }
}`

const loadPools = async (ctx: UniswapV3Context, poolAddresses: Address[]) => {
  return await Promise.all(
    poolAddresses.map(async (poolAddress) => {
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
    })
  )
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

const loadPoolsFromSubgraph = async (
  ctx: UniswapV3Context,
  subgraphId: string,
  offset: number,
  block: number
) => {
  const SUBGRAPH_API_TOKEN = process.env.THEGRAPH_API_KEY
  if (!SUBGRAPH_API_TOKEN) {
    throw new Error('THEGRAPH_API_KEY is not set')
  }
  let poolData: any[] = []
  const url = `https://gateway.thegraph.com/api/${SUBGRAPH_API_TOKEN}/subgraphs/id/${subgraphId}`
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      query: top100PoolsQuery,
      variables: {
        block: block,
        skip: offset,
      },
    }),
    headers: {
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(3000),
  })
  if (!response.ok) {
    console.log(response)
    console.log(
      `UniV3: Failed to fetch pools from subgraph: ${response.statusText}`
    )
    throw new Error(
      `Failed to fetch pools from subgraph: ${response.statusText}`
    )
  }
  const jsonResp: {
    data: {
      pools: {
        id: string
        feeTier: number
        token0: { id: string }
        token1: { id: string }
      }[]
    }
  } = await response.json()
  if (Array.isArray(jsonResp.data?.pools)) {
    poolData = jsonResp.data.pools
  } else {
    console.log(jsonResp)
    throw new Error('Failed to fetch pools from subgraph')
  }

  return await definePoolFromPoolDataArray(ctx, poolData)
}
const loadPoolsFromSubgraphWithRetry = async (
  ctx: UniswapV3Context,
  subgraphId: string,
  offset: number,
  block: number
) => {
  for (let i = 0; i < 3; i++) {
    try {
      return await loadPoolsFromSubgraph(ctx, subgraphId, offset, block)
    } catch (e) {}
    await wait(500)
  }
  return []
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
  public readonly tickSpacing: DefaultMap<bigint, Promise<bigint>> =
    new DefaultMap(async (feeTier) => {
      const tickSpacing =
        await this.contracts.factory.callStatic.feeAmountTickSpacing(feeTier)
      return BigInt(tickSpacing)
    })
  constructor(
    public readonly universe: Universe,
    public readonly config: {
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
    return `UniV3Pool(${this.address.toShortString()}.${this.fee}.${
      this.token0
    }.${this.token1})`
  }
  public constructor(
    public readonly context: UniswapV3Context,
    public readonly address: Address,
    public readonly token0: Token,
    public readonly token1: Token,
    public readonly fee: bigint,
    public readonly tickSpacing: bigint,
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

class UniswapV3Swap extends Action('UniswapV3') {
  public get context(): UniswapV3Context {
    return this.pool.context
  }

  public async liquidity(): Promise<number> {
    const out = await this.pool.liquidity()
    return out.asNumber()
  }
  public get universe(): Universe {
    return this.context.universe
  }
  get dependsOnRpc(): boolean {
    return true
  }

  private _gasEstimate: bigint = 200000n

  async quote([amountIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    try {
      const { amountOut } = await this.quoteExactSingle.get(amountIn.amount)
      return [amountOut]
    } catch (e) {
      // console.log(`${this}: Failed to quote ${amountIn} -> ${this.tokenOut}`)
      return [this.tokenOut.zero]
    }
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
        // address tokenIn;
        // address tokenOut;
        // uint24 fee;
        // address recipient;
        // uint256 amountIn;
        // uint256 amountOutMinimum;
        // uint160 sqrtPriceLimitX96;
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

    this.quoteExactSingle = this.universe.createCache(
      async (amount: bigint) => {
        const out =
          await this.context.contracts.quoter.callStatic.quoteExactInputSingle({
            tokenIn: this.tokenIn.address.address,
            tokenOut: this.tokenOut.address.address,
            fee: this.pool.fee,
            amountIn: amount,
            sqrtPriceLimitX96: 0n,
          })

        this._gasEstimate = out.gasEstimate.toBigInt()

        return {
          amountOut: this.tokenOut.from(out.amountOut),
          gasEstimate: this._gasEstimate,
          sqrtPriceX96After: out.sqrtPriceX96After.toBigInt(),
        }
      },
      12000
    )
  }

  public toString() {
    return `UniV3(${this.pool.address.toShortString()}.${this.tokenIn}.${
      this.tokenOut
    })`
  }

  public get actionName() {
    return `swap_${this.direction}`
  }
}

export const setupUniswapV3 = async (universe: Universe) => {
  const chainId = universe.chainId
  if (!isChainIdSupported(chainId)) {
    throw new Error(`ChainId ${chainId} not supported`)
  }
  const config = configs[chainId]
  const uniswapRouterAddress = Address.from(config.router)
  const uniswapQuoterAddress = Address.from(config.quoter)

  const ctx = new UniswapV3Context(universe, {
    router: uniswapRouterAddress,
    quoter: uniswapQuoterAddress,
    factory: Address.from(config.factory),
    routerCall: Address.from(universe.config.addresses.uniV3Router),
  })
  const additionalPoolsToLoad = config.pools.map(Address.from)

  const currentBlock = await universe.provider.getBlockNumber()
  const loadBlock = Math.floor(currentBlock / (30 * 60 * 3)) * 30 * 60 * 3

  const loadUniPools = async (): Promise<UniswapV3Pool[]> => {
    let pools: UniswapV3Pool[] = []
    pools = await definePoolFromPoolDataArray(ctx, config.staticPools)

    for (let i = Math.floor(pools.length / pageSize); i < pages; i++) {
      const ps = await loadPoolsFromSubgraphWithRetry(
        ctx,
        config.subgraphId,
        i * pageSize,
        loadBlock
      )
      pools.push(...ps)
      if (ps.length !== pageSize) {
        break
      }
      await wait(250)
    }
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
      `src.ts/configuration/data/${chainId}/univ3.json`,
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

  console.log(`UniV3: Loaded ${allPools.length} pools`)

  return ctx
}
