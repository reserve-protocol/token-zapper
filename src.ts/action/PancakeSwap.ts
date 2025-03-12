import { Universe } from '../Universe'
import {
  BaseAction,
  DestinationOptions,
  InteractionConvention,
} from '../action/Action'
import { Address } from '../base/Address'
import { Approval } from '../base/Approval'
import { BlockCache } from '../base/BlockBasedCache'
import {
  IUniV3Pool__factory,
  IUniV3QuoterV2,
  IUniV3QuoterV2__factory,
  SlipstreamRouterCall__factory,
} from '../contracts'
import { Token, TokenQuantity } from '../entities/Token'
import { Contract, Planner, Value } from '../tx-gen/Planner'
import basePools from '../configuration/data/8453/pancakeswap.json'
import { utils } from 'ethers'
import deployments from '../contracts/deployments.json'
interface IPancakeswapConfig {
  router: string
  quoter: string
  routerCaller: string
  staticPools: {
    id: string
    token0: { id: string }
    token1: { id: string }
    feeTier: number
  }[]
}

const configs: Record<number, IPancakeswapConfig> = {
  8453: {
    router: '0x1b81D678ffb9C0263b24A97847620C99d213eB14',
    quoter: '0xB048Bbc1Ee6b733FFfCFb9e9CeF7375518e25997',
    routerCaller: deployments[8453][0].contracts.PancakeRouterCall.address,
    staticPools: basePools,
  },
}

export class PancakeswapContext {
  public readonly config: {
    router: Address
    quoter: Address
    routerCaller: Address
  }

  private pools_: Map<Address, Promise<PancakeSwapCLPool>> = new Map()
  public pools: Map<Address, PancakeSwapCLPool> = new Map()
  private async loadPoolFromChain(address: Address) {
    const poolContract = IUniV3Pool__factory.connect(
      address.address,
      this.universe.provider
    )
    const [token0, token1, fee] = await Promise.all([
      poolContract.token0(),
      poolContract.token1(),
      poolContract.fee(),
    ])
    return new PancakeSwapCLPool(
      this,
      Address.from(address),
      await this.universe.getToken(token0),
      await this.universe.getToken(token1),
      BigInt(fee)
    )
  }

  public async loadPool(address: Address) {
    if (this.pools.has(address)) {
      return this.pools.get(address)
    }
    let pool = this.pools_.get(address)
    if (pool) {
      return pool
    }
    pool = this.loadPoolFromChain(address)
    this.pools_.set(address, pool)
    const out = await pool
    this.pools.set(address, out)
    return out
  }

  public readonly contracts: {
    quoter: IUniV3QuoterV2
  }

  public readonly weirollAerodromeRouterCaller: Contract

  public async loadStaticPools(
    pools: {
      id: string
      token0: { id: string }
      token1: { id: string }
      feeTier: number
    }[]
  ) {
    return await Promise.all(
      pools.map(async (pool) => {
        const token0 = await this.universe.getToken(pool.token0.id)
        const token1 = await this.universe.getToken(pool.token1.id)
        const fee = pool.feeTier
        const inst = new PancakeSwapCLPool(
          this,
          Address.from(pool.id),
          token0,
          token1,
          BigInt(fee)
        )
        this.pools.set(inst.address, inst)
        return inst
      })
    )
  }

  public constructor(public readonly universe: Universe) {
    const chainId = universe.chainId
    const config = configs[chainId]
    if (!config) {
      throw new Error(`Pancakeswap is not configured for chainId ${chainId}`)
    }
    this.config = {
      router: Address.from(config.router),
      quoter: Address.from(config.quoter),
      routerCaller: Address.from(config.routerCaller),
    }
    this.contracts = {
      quoter: IUniV3QuoterV2__factory.connect(
        this.config.quoter.address,
        universe.provider
      ),
    }
    const slipstreamCall = SlipstreamRouterCall__factory.connect(
      this.config.routerCaller.address,
      universe.provider
    )
    this.weirollAerodromeRouterCaller = Contract.createLibrary(slipstreamCall)
  }
}

export class PancakeSwapCLPool {
  public readonly addresesInUse: Set<Address> = new Set()

  public readonly swap01: PancakeSwapCLSwap
  public readonly swap10: PancakeSwapCLSwap

  private tickspacing_: Promise<bigint> | null = null

  public constructor(
    public readonly context: PancakeswapContext,
    public readonly address: Address,
    public readonly token0: Token,
    public readonly token1: Token,
    public readonly fee: bigint
  ) {
    this.addresesInUse.add(address)

    this.swap01 = new PancakeSwapCLSwap(this, this.token0, this.token1)
    this.swap10 = new PancakeSwapCLSwap(this, this.token1, this.token0)
  }
  public async getTickSpacing() {
    if (this.tickspacing_) {
      return this.tickspacing_
    }

    this.tickspacing_ = IUniV3Pool__factory.connect(
      this.address.address,
      this.context.universe.provider
    )
      .callStatic.tickSpacing()
      .then((r) => BigInt(r))
    return await this.tickspacing_
  }
}

export type Direction = '0->1' | '1->0'

export class PancakeSwapCLSwap extends BaseAction {
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
  private _gasEstimate: bigint = 200000n
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

  async quote([amountIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    const { amountOut } = await this.quoteExactSingle.get(amountIn.amount)
    return [amountOut]
  }

  get protocol(): string {
    return 'pancakeswap'
  }

  async plan(
    planner: Planner,
    [input]: Value[],
    destination: Address,
    predictedInputs: TokenQuantity[]
  ): Promise<null | Value[]> {
    const [minAmount] = await this.quote(predictedInputs)

    const encoded = utils.defaultAbiCoder.encode(
      [
        'address',
        'address',
        'uint24',
        'address',
        'uint256',
        'uint256',
        'uint256',
        'uint160',
      ],
      [
        this.tokenIn.address.address,
        this.tokenOut.address.address,
        this.pool.fee,
        this.universe.execAddress.address,
        2n ** 64n - 1n,
        0,
        0,
        0,
      ]
    )
    return [
      planner.add(
        this.pool.context.weirollAerodromeRouterCaller.exactInputSingle(
          input,
          0n,
          this.pool.context.config.router.address,
          encoded
        ),
        `${this.protocol}:${this.actionName}(${predictedInputs.join(
          ', '
        )}) => ${minAmount}`,
        `${this.protocol}_swap_${predictedInputs.join(
          '_'
        )}_for_${this.outputToken.join('_')} on pool ${this.pool.address}`
      )!,
    ]
  }

  public get context() {
    return this.pool.context
  }
  public get universe() {
    return this.context.universe
  }
  constructor(
    public readonly pool: PancakeSwapCLPool,
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
}

export const setupPancakeSwap = async (universe: Universe) => {
  const ctx = new PancakeswapContext(universe)

  const config = configs[universe.chainId]
  const pools = await ctx.loadStaticPools(config.staticPools)

  for (const pool of pools) {
    universe.addAction(pool.swap01)
    universe.addAction(pool.swap10)
  }

  return ctx
}
