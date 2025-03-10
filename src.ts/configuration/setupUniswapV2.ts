import { Universe } from '../Universe'
import {
  Action,
  BaseAction,
  DestinationOptions,
  InteractionConvention,
} from '../action/Action'
import { Address } from '../base/Address'
import fs from 'fs'
import {
  IERC20__factory,
  IUniswapV2Pair__factory,
  Univ2SwapHelper,
  Univ2SwapHelper__factory,
} from '../contracts'
import { Token, TokenQuantity } from '../entities/Token'
import { Contract, Planner, Value } from '../tx-gen/Planner'
import deployments from '../contracts/deployments.json'
import { ChainId, ChainIds, isChainIdSupported } from './ReserveAddresses'
import { constants, Wallet } from 'ethers'
import { wait } from '../base/controlflow'
import baseUniV2 from './data/8453/univ2.json'
import mainnetUniV2 from './data/1/univ2.json'

interface IUniswapV2Config {
  subgraphId: string
  univ2swap: string
  pools: { id: string; token0: { id: string }; token1: { id: string } }[]
}
const configs: Record<ChainId, IUniswapV2Config> = {
  [ChainIds.Mainnet]: {
    subgraphId: 'EYCKATKGBKLWvSfwvBjzfCBmGwYNdVkduYXVivCsLRFu',
    univ2swap: deployments[1][0].contracts.Univ2SwapHelper.address,
    pools: mainnetUniV2,
  },
  [ChainIds.Arbitrum]: {
    subgraphId: 'FQ6JYszEKApsBpAmiHesRsd9Ygc6mzmpNRANeVQFYoVX',
    univ2swap: constants.AddressZero,
    pools: [],
  },
  [ChainIds.Base]: {
    subgraphId: 'D7kA6uviHcQfxXRJncheSuCmrhk4KBc3eyJnvRrRKoeH',
    univ2swap: deployments[8453][0].contracts.Univ2SwapHelper.address,
    pools: baseUniV2,
  },
}
const pages = 5
const pageSize = 100
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

const loadPoolFromAddress = async (ctx: UniswapV2Context, address: Address) => {
  const contract = IUniswapV2Pair__factory.connect(
    address.address,
    ctx.universe.provider
  )
  const [token0, token1] = await Promise.all([
    ctx.universe.getToken(await contract.callStatic.token0()),
    ctx.universe.getToken(await contract.callStatic.token1()),
  ])
  return await ctx.definePool(address, token0, token1)
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
const FEE_SCALE = 1000n
const IERC20_INTERFACE = IERC20__factory.createInterface()
class UniswapV2Pool {
  public toString() {
    return `UniswapV2Pool(${this.address.toShortString()}:${this.token0}.${
      this.token1
    })`
  }
  private fees: Promise<{
    token0: {
      buy: bigint
      sell: bigint
    }
    token1: {
      buy: bigint
      sell: bigint
    }
  }> | null = null

  private async calculateFeesForToken(token: Token): Promise<{
    buy: bigint
    sell: bigint
  }> {
    if (
      token === this.context.universe.wrappedNativeToken ||
      token.address === this.context.universe.config.addresses.usdc
    ) {
      return {
        buy: 0n,
        sell: 0n,
      }
    }
    const thisBalance = (
      await this.context.universe.balanceOf(token, this.address)
    ).amount
    const randomAddr = Wallet.createRandom().address
    const sentAmount = thisBalance / 2n
    const o = (
      await this.context.universe.simulateZapFn(
        {
          transactions: [
            {
              to: token.address.address,
              from: this.address.address,
              data: IERC20_INTERFACE.encodeFunctionData('transfer', [
                randomAddr,
                sentAmount,
              ]),
              value: 0n,
            },
            {
              to: token.address.address,
              from: this.context.universe.execAddress.address,
              data: IERC20_INTERFACE.encodeFunctionData('balanceOf', [
                randomAddr,
              ]),
              value: 0n,
            },
          ],
        },
        this.context.universe
      )
    ).at(-1)!
    const poolOutSent = BigInt(o === '0x' ? '0x0' : sentAmount)
    const balAfterSent = thisBalance - sentAmount
    const o2 = (
      await this.context.universe.simulateZapFn(
        {
          transactions: [
            {
              to: token.address.address,
              from: this.address.address,
              data: IERC20_INTERFACE.encodeFunctionData('transfer', [
                randomAddr,
                sentAmount,
              ]),
              value: 0n,
            },
            {
              to: token.address.address,
              from: randomAddr,
              data: IERC20_INTERFACE.encodeFunctionData('transfer', [
                this.address.address,
                poolOutSent,
              ]),
              value: 0n,
            },
            {
              to: token.address.address,
              from: this.context.universe.execAddress.address,
              data: IERC20_INTERFACE.encodeFunctionData('balanceOf', [
                this.address.address,
              ]),
              value: 0n,
            },
          ],
        },
        this.context.universe
      )
    ).at(-1)!
    const poolInReceived =
      BigInt(o2 === '0x' ? '0x0' : sentAmount) - balAfterSent

    let buyFee = ((sentAmount - poolOutSent) * FEE_SCALE) / sentAmount
    let sellFee =
      poolOutSent === 0n
        ? 0n
        : ((poolOutSent - poolInReceived) * FEE_SCALE) / poolOutSent

    if (buyFee === 0n && sellFee === 0n) {
      return {
        buy: 0n,
        sell: 0n,
      }
    }
    if (sellFee < 0n || sellFee > FEE_SCALE / 10n) {
      sellFee = 10n
    }
    if (buyFee < 0n || buyFee > FEE_SCALE / 10n) {
      buyFee = 10n
    }

    this.context.universe.logger.debug(
      `${this} detect fees on ${token}: sellFee=${sellFee} buyFee=${buyFee}`
    )

    return {
      buy: buyFee,
      sell: sellFee,
    }
  }
  private async calculateFees() {
    try {
      return {
        token0: await this.calculateFeesForToken(this.token0),
        token1: await this.calculateFeesForToken(this.token1),
      }
    } catch (e) {
      console.log(e)
      throw e
    }
  }
  public async getFees() {
    if (this.fees == null) {
      this.fees = this.calculateFees()
    }
    return await this.fees
  }

  public readonly getReserves: () => Promise<[bigint, bigint]>
  public readonly swap01: BaseAction
  public readonly swap10: BaseAction
  public constructor(
    public readonly context: UniswapV2Context,
    public readonly address: Address,
    public readonly token0: Token,
    public readonly token1: Token
  ) {
    const contract = IUniswapV2Pair__factory.connect(
      address.address,
      context.universe.provider
    )
    this.getReserves = context.universe.createCachedProducer(async () => {
      const reserves = await contract.callStatic.getReserves()
      return [reserves.reserve0.toBigInt(), reserves.reserve1.toBigInt()]
    }, 30000)

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

export class UniswapV2Swap extends Action('UniswapV2') {
  toString() {
    return `UniswapV2Swap(${this.pool}, ${this.tokenIn} -> ${this.tokenOut})`
  }
  get isTrade() {
    return true
  }
  get actionName(): string {
    return `swap`
  }

  public async getFees() {
    const fees = await this.pool.getFees()
    if (this.tokenIn === this.pool.token0) {
      return {
        inFee: fees.token0.sell,
        outFee: fees.token1.buy,
      }
    } else {
      return {
        inFee: fees.token1.sell,
        outFee: fees.token0.buy,
      }
    }
  }

  public async quoteWithoutFeeCheck([amountIn]: TokenQuantity[]): Promise<
    TokenQuantity[]
  > {
    const [reserveIn, reserveOut] = await this.getReserves()
    const amountOut = getAmountOut(amountIn.amount, reserveIn, reserveOut)
    return [this.tokenOut.fromBigInt(amountOut)]
  }
  async quote([amountIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    const fees = await this.getFees()
    const amountInFee = (amountIn.amount * fees.inFee) / (FEE_SCALE * FEE_SCALE)
    const [reserveIn, reserveOut] = await this.getReserves()
    const amountOut = getAmountOut(
      amountIn.amount - amountInFee,
      reserveIn,
      reserveOut
    )
    const amountOutFee = (amountOut * fees.outFee) / (FEE_SCALE * FEE_SCALE)
    const qtyOut = this.tokenOut.fromBigInt(amountOut - amountOutFee)

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

  async plan(
    planner: Planner,
    inputs: Value[],
    _: Address,
    __: TokenQuantity[]
  ) {
    const fees = await this.getFees()
    if (
      fees.inFee === 0n &&
      fees.outFee === 0n &&
      !this.context.universe.feeOnTransferTokens.has(this.tokenIn) &&
      !this.context.universe.feeOnTransferTokens.has(this.tokenOut)
    ) {
      return [
        planner.add(
          this.context.swapHelperWeiroll.swap(
            this.pool.address.address,
            this.tokenIn === this.pool.token0,
            this.tokenIn.address.address,
            inputs[0]
          )
        )!,
      ]
    } else {
      return [
        planner.add(
          this.context.swapHelperWeiroll.swapOnPoolWithFeeTokens(
            this.pool.address.address,
            this.tokenIn.address.address,
            this.tokenOut.address.address,
            inputs[0]
          )
        )!,
      ]
    }
  }
  public constructor(
    public readonly context: UniswapV2Context,
    public readonly pool: UniswapV2Pool,
    public readonly tokenIn: Token,
    public readonly tokenOut: Token,
    public readonly getReserves: () => Promise<[bigint, bigint]>
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

export class UniswapV2Context {
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

  public async loadPool(address: Address) {
    return loadPoolFromAddress(this, address)
  }
}

export const setupUniswapV2 = async (universe: Universe) => {
  const logger = universe.logger.child({
    integration: 'univ2',
  })
  const chainId = universe.chainId
  if (!isChainIdSupported(chainId)) {
    throw new Error(`ChainId ${chainId} not supported`)
  }
  const config = configs[chainId]
  if (config.univ2swap === constants.AddressZero) {
    logger.error('UniswapV2 not supported on this chain')
    return
  }
  const ctx = new UniswapV2Context(universe)
  const currentBlock = await universe.provider.getBlockNumber()

  // Go back 10 days
  const loadBlock =
    Math.floor(currentBlock / (30 * 60 * 24 * 5)) * 30 * 60 * 24 * 5

  const loadUniPools = async (): Promise<UniswapV2Pool[]> => {
    let pools: UniswapV2Pool[] = []

    pools = await definePoolsFromData(ctx, config.pools)
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
        allPools
          .map((i) => ({
            id: i.address.address.toLowerCase(),
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
  logger.info(`UniV2 ${allPools.length} pools loaded`)

  return ctx
}
