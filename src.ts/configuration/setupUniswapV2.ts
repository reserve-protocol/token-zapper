import { Universe } from '../Universe'
import {
  Action,
  BaseAction,
  DestinationOptions,
  InteractionConvention,
} from '../action/Action'
import { Address } from '../base/Address'
import fs from 'fs'
import { Univ2SwapHelper, Univ2SwapHelper__factory } from '../contracts'
import { Token, TokenQuantity } from '../entities/Token'
import { Contract, Planner, Value } from '../tx-gen/Planner'
import deployments from '../contracts/deployments.json'
import { ChainId, ChainIds, isChainIdSupported } from './ReserveAddresses'
import { constants } from 'ethers'
import { UniswapV2Pair__factory } from '../contracts/factories/contracts/UniswapV2Pair__factory'
import { wait } from '../base/controlflow'

interface IUniswapV2Config {
  subgraphId: string
  univ2swap: string
}
const configs: Record<ChainId, IUniswapV2Config> = {
  [ChainIds.Mainnet]: {
    subgraphId: 'EYCKATKGBKLWvSfwvBjzfCBmGwYNdVkduYXVivCsLRFu',
    univ2swap: deployments[1][0].contracts.Univ2SwapHelper.address,
  },
  [ChainIds.Arbitrum]: {
    subgraphId: 'FQ6JYszEKApsBpAmiHesRsd9Ygc6mzmpNRANeVQFYoVX',
    univ2swap: constants.AddressZero,
  },
  [ChainIds.Base]: {
    subgraphId: '4jGhpKjW4prWoyt5Bwk1ZHUwdEmNWveJcjEyjoTZWCY9',
    univ2swap: deployments[8453][0].contracts.Univ2SwapHelper.address,
  },
}
const pages = 5
const pageSize = 500
const loadPools = `query GetPools(
  $skip: Int=0
  $block: Int=0
){
  pairs(
    first: ${pageSize}
    skip: $skip,
    where: {reserveUSD_gt:50000, txCount_gt: 100, reserveUSD_lt: 100000000000}
    orderBy: volumeUSD
    orderDirection: desc
    block: {number: $block}
  ) {
    id
    token0 {
      id
    }
    token1 {
      id
    }
  }
}`

const definePoolsFromData = async (
  ctx: UniswapV2Context,
  data: { id: string; token0: { id: string }; token1: { id: string } }[]
) => {
  return (
    await Promise.all(
      data.map(async (pool) => {
        try {
          const poolAddress = Address.from(pool.id)
          if (ctx.pools.has(poolAddress)) {
            return ctx.pools.get(poolAddress)
          }
          const token0 = await ctx.universe.getToken(
            Address.from(pool.token0.id)
          )
          const token1 = await ctx.universe.getToken(
            Address.from(pool.token1.id)
          )
          return await ctx.definePool(poolAddress, token0, token1)
        } catch (e) {
          return null
        }
      })
    )
  ).filter((p) => p != null)
}

const loadPoolsFromSubgraph = async (
  ctx: UniswapV2Context,
  subgraphId: string,
  skip: number,
  block: number
) => {
  const SUBGRAPH_API_TOKEN = process.env.THEGRAPH_API_KEY
  if (!SUBGRAPH_API_TOKEN) {
    throw new Error('THEGRAPH_API_KEY is not set')
  }
  const url = `https://gateway.thegraph.com/api/${SUBGRAPH_API_TOKEN}/subgraphs/id/${subgraphId}`
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      query: loadPools,
      variables: {
        skip,
        block,
      },
    }),
    headers: {
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(6000),
  })
  if (!response.ok) {
    console.log(
      `UniV2: Failed to fetch pools from subgraph: ${response.statusText}`
    )
    throw new Error(
      `Failed to fetch pools from subgraph: ${response.statusText}`
    )
  }
  const data: {
    data: {
      pairs: {
        id: string
        token0: { id: string }
        token1: { id: string }
      }[]
    }
  } = await response.json()

  if (!Array.isArray(data.data.pairs)) {
    throw new Error('Invalid data')
  }

  return await definePoolsFromData(ctx, data.data.pairs)
}
const loadPoolsFromSubgraphWithRetry = async (
  ctx: UniswapV2Context,
  subgraphId: string,
  skip: number,
  block: number
) => {
  for (let i = 0; i < 5; i++) {
    try {
      return await loadPoolsFromSubgraph(ctx, subgraphId, skip, block)
    } catch (e) {
      console.log(`UniV2: Failed to load pools from subgraph: ${e}`)
    }
    await wait(250)
  }
  return []
}
export type Direction = '0->1' | '1->0'

class UniswapV2Pool {
  public toString() {
    return `UniswapV2Pool(${this.address.toShortString()}:${this.token0}.${
      this.token1
    })`
  }

  public readonly getReserves: () => Promise<[TokenQuantity, TokenQuantity]>
  public readonly swap01: BaseAction
  public readonly swap10: BaseAction
  public constructor(
    public readonly context: UniswapV2Context,
    public readonly address: Address,
    public readonly token0: Token,
    public readonly token1: Token
  ) {
    const contract = UniswapV2Pair__factory.connect(
      address.address,
      context.universe.provider
    )
    this.getReserves = context.universe.createCachedProducer(async () => {
      const reserves = await contract.callStatic.getReserves()
      return [
        token0.from(reserves.reserve0.toBigInt()),
        token1.from(reserves.reserve1.toBigInt()),
      ]
    })

    this.swap01 = new UniswapV2Swap(
      context,
      this,
      token0,
      token1,
      this.getReserves
    )
    this.swap10 = new UniswapV2Swap(context, this, token1, token0, async () => {
      const reserves = await this.getReserves()
      return [reserves[1], reserves[0]]
    })
  }
}

function getAmountOut(amountIn: bigint, reserveIn: bigint, reserveOut: bigint) {
  const amountInWithFee = amountIn * 997n
  const numerator = amountInWithFee * reserveOut
  const denominator = reserveIn * 1000n + amountInWithFee
  return numerator / denominator
}

class UniswapV2Swap extends Action('UniswapV2') {
  toString() {
    return `UniswapV2Swap(${this.pool}, ${this.tokenIn} -> ${this.tokenOut})`
  }
  get isTrade() {
    return true
  }
  get actionName(): string {
    return `swap`
  }
  async quote([amountIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    const [reserveIn, reserveOut] = await this.pool.getReserves()
    const amountOut = getAmountOut(
      amountIn.amount,
      reserveIn.amount,
      reserveOut.amount
    )
    const qtyOut = this.tokenOut.fromBigInt(
      (amountOut * this.tokenOut.scale) / this.tokenIn.scale
    )

    return [qtyOut]
  }
  gasEstimate(): bigint {
    return 100000n
  }
  get supportsDynamicInput() {
    return true
  }
  get returnsOutput() {
    return true
  }
  get dependsOnRpc() {
    return false
  }
  async plan(
    planner: Planner,
    inputs: Value[],
    _: Address,
    __: TokenQuantity[]
  ) {
    return [
      planner.add(
        this.context.swapHelperWeiroll.swap(
          this.pool.address.address,
          this.tokenIn === this.pool.token1,
          this.tokenIn.address.address,
          inputs[0]
        )
      )!,
    ]
  }
  public constructor(
    public readonly context: UniswapV2Context,
    public readonly pool: UniswapV2Pool,
    public readonly tokenIn: Token,
    public readonly tokenOut: Token,
    public readonly getReserves: () => Promise<[TokenQuantity, TokenQuantity]>
  ) {
    super(
      pool.address,
      [tokenIn],
      [tokenOut],
      InteractionConvention.None,
      DestinationOptions.Callee,
      []
    )
  }
}

class UniswapV2Context {
  public readonly swapHelper: Univ2SwapHelper
  public readonly swapHelperWeiroll: Contract
  public readonly pools: Map<Address, Promise<UniswapV2Pool>> = new Map()
  public async definePool(
    address: Address,
    token0: Token,
    token1: Token
  ): Promise<UniswapV2Pool> {
    let previousPool = this.pools.get(address)
    if (previousPool) {
      return previousPool
    }
    const pool = new UniswapV2Pool(this, address, token0, token1)
    this.pools.set(address, Promise.resolve(pool))
    return pool
  }

  constructor(public readonly universe: Universe) {
    const config = configs[universe.chainId as ChainId]
    this.swapHelper = Univ2SwapHelper__factory.connect(
      config.univ2swap,
      this.universe.provider
    )

    this.swapHelperWeiroll = Contract.createLibrary(this.swapHelper)
  }
}

export const setupUniswapV2 = async (universe: Universe) => {
  const chainId = universe.chainId
  if (!isChainIdSupported(chainId)) {
    throw new Error(`ChainId ${chainId} not supported`)
  }
  const config = configs[chainId]
  if (config.univ2swap === constants.AddressZero) {
    console.log('UniswapV2 not supported on this chain')
    return
  }
  const ctx = new UniswapV2Context(universe)
  const currentBlock = await universe.provider.getBlockNumber()

  // Go back 10 days
  const loadBlock =
    Math.floor(currentBlock / (30 * 60 * 24 * 10)) * 30 * 60 * 24 * 10

  const loadUniPools = async (): Promise<UniswapV2Pool[]> => {
    let pools: UniswapV2Pool[] = []

    if (process.env.DEV) {
      if (fs.existsSync(`src.ts/configuration/data/${chainId}/univ2.json`)) {
        const data = fs.readFileSync(
          `src.ts/configuration/data/${chainId}/univ2.json`,
          'utf-8'
        )
        const poolData = JSON.parse(data)
        pools = await definePoolsFromData(ctx, poolData)
      }
    }
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
  const allPools = await loadUniPools()
  for (const pool of allPools) {
    universe.addAction(pool.swap01)
    universe.addAction(pool.swap10)
  }

  if (process.env.WRITE_DATA) {
    fs.writeFileSync(
      `src.ts/configuration/data/${chainId}/univ2.json`,
      JSON.stringify(
        allPools.map((i) => ({
          id: i.address.address,
          token0: {
            id: i.token0.address.address,
            symbol: i.token0.symbol,
          },
          token1: {
            id: i.token1.address.address,
            symbol: i.token1.symbol,
          },
        })),
        null,
        2
      )
    )
  }
  console.log(`UniV2 ${allPools.length} pools loaded`)

  return ctx
}
