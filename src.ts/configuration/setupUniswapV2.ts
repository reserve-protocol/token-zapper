import { Universe } from '../Universe'
import {
  Action,
  BaseAction,
  DestinationOptions,
  InteractionConvention,
} from '../action/Action'
import { Address } from '../base/Address'
import { Univ2SwapHelper, Univ2SwapHelper__factory } from '../contracts'
import { Token, TokenQuantity } from '../entities/Token'
import { Contract, Planner, Value } from '../tx-gen/Planner'
import deployments from '../contracts/deployments.json'
import { ChainId, ChainIds, isChainIdSupported } from './ReserveAddresses'
import { constants } from 'ethers'
import { UniswapV2Pair__factory } from '../contracts/factories/contracts/UniswapV2Pair__factory'

interface IUniswapV2Config {
  subgraphId: string
  univ2swap: string
}
const configs: Record<ChainId, IUniswapV2Config> = {
  [ChainIds.Mainnet]: {
    subgraphId: '5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV',
    univ2swap: constants.AddressZero,
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
const fallbackDataPoolLists: Record<number, any> = {
  1: [],
  8453: [],
  42161: [],
}
const loadPools = `query GetPools(
  $skip: Int=0
){
  pairs(
    first: 1000
    skip: $skip,
    where: {reserveUSD_gt:50000, reserveUSD_lt: 100000000000}
    orderBy: volumeUSD
    orderDirection: desc
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

const loadPoolsFromSubgraph = async (
  ctx: UniswapV2Context,
  subgraphId: string,
  skip: number
) => {
  const SUBGRAPH_API_TOKEN = process.env.THEGRAPH_API_KEY
  if (!SUBGRAPH_API_TOKEN) {
    throw new Error('THEGRAPH_API_KEY is not set')
  }
  let poolData = (fallbackDataPoolLists[ctx.universe.chainId]?.data?.pools ??
    []) as any[]
  try {
    const url = `https://gateway.thegraph.com/api/${SUBGRAPH_API_TOKEN}/subgraphs/id/${subgraphId}`
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        query: loadPools,
        variables: {
          skip,
        },
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    })
    if (!response.ok) {
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

    if (Array.isArray(data.data.pairs)) {
      poolData = data.data.pairs
    } else {
      ctx.universe.logger.info('Using fallback data')
    }
  } catch (e) {}

  const pools = await Promise.all(
    poolData.map(async (pool) => {
      const poolAddress = Address.from(pool.id)
      const token0 = await ctx.universe.getToken(Address.from(pool.token0.id))
      const token1 = await ctx.universe.getToken(Address.from(pool.token1.id))
      return await ctx.definePool(poolAddress, token0, token1)
    })
  )
  return pools.filter((p) => p != null)
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
      return [token0.from(reserves[0]), token1.from(reserves[1])]
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
    const qtyOut = this.tokenOut.from(amountOut)

    // console.log(`Univ2: ${amountIn} -> ${qtyOut}`)
    return [qtyOut]
  }
  gasEstimate(): bigint {
    return 100000n
  }
  get supportsDynamicInput() {
    return true
  }
  get requiresDynamicOutput() {
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

  const allPools = (
    await Promise.all([
      loadPoolsFromSubgraph(ctx, config.subgraphId, 0),
      loadPoolsFromSubgraph(ctx, config.subgraphId, 1000),
    ])
  ).flat()

  for (const pool of allPools) {
    universe.addAction(pool.swap01)
    universe.addAction(pool.swap10)
  }

  return ctx
}
