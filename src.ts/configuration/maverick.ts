import { BigNumberish } from 'ethers'
import { ChainIds, isChainIdSupported } from './ReserveAddresses'
import { Universe } from '../Universe'
import { Address } from '../base/Address'
import { Token, TokenQuantity } from '../entities/Token'
import {
  IMaverickV2Factory,
  IMaverickV2Factory__factory,
  IMaverickV2Pool__factory,
  IMaverickV2PoolLens,
  IMaverickV2PoolLens__factory,
} from '../contracts'
import {
  Action,
  BaseAction,
  DestinationOptions,
  InteractionConvention,
  ONE,
} from '../action/Action'
import {
  IMaverickV2Quoter,
  IMaverickV2Router,
} from '../contracts/contracts/Maverick.sol'
import {
  IMaverickV2Quoter__factory,
  IMaverickV2Router__factory,
} from '../contracts/factories/contracts/Maverick.sol'
import { Contract, Planner, Value } from '../tx-gen/Planner'
import { Approval } from '../base/Approval'
export const configs = {
  [ChainIds.Mainnet]: {
    WETH: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    MaverickV2Factory: '0x0A7e848Aca42d879EF06507Fca0E7b33A0a63c1e',
    MaverickV2PoolLens: '0x6A9EB38DE5D349Fe751E0aDb4c0D9D391f94cc8D',
    MaverickV2Quoter: '0xb40AfdB85a07f37aE217E7D6462e609900dD8D7A',
    MaverickV2Router: '0x62e31802c6145A2D5E842EeD8efe01fC224422fA',
    MaverickV2Position: '0x116193c58B40D50687c0433B2aa0cC4AE00bC32c',
    MaverickV2BoostedPositionFactory:
      '0xd94C8f6D13Cf480FfAC686712C63471D1596cc29',
    MaverickV2BoostedPositionLens: '0x12DD145927CECF616cbD196789c89C2573A53244',
    MaverickV2IncentiveMatcherFactory:
      '0x924Dd05c2325829fa4063CAbE1456273084009d7',
    MaverickV2VotingEscrowFactory: '0x451d47fd6207781dc053551edFD98De8d5EB4Cda',
    MaverickV2RewardFactory: '0x63EF1a657cc53747689B201aa07A76E9ef22f8Fe',
    MaverickV2RewardRouter: '0xc0C3BC532690af8922a2f260c6e1dEb6CFaB45A0',
    MaverickV2VotingEscrowLens: '0x102f936B0fc2E74dC34E45B601FaBaA522f381F0',
    MaverickToken: '0x7448c7456a97769F6cD04F1E83A4a23cCdC46aBD',
    LegacyMaverickVe: '0x4949Ac21d5b2A0cCd303C20425eeb29DCcba66D8',
    MaverickVeV2: '0xC6addB3327A7D4b3b604227f82A6259Ca7112053',
    MaverickTokenIncentiveMatcher: '0x9172a390Cb35a15a890293f59EA5aF250b234D55',
  },
  [ChainIds.Base]: {
    WETH: '0x4200000000000000000000000000000000000006',
    MaverickV2Factory: '0x0A7e848Aca42d879EF06507Fca0E7b33A0a63c1e',
    MaverickV2PoolLens: '0x6A9EB38DE5D349Fe751E0aDb4c0D9D391f94cc8D',
    MaverickV2Quoter: '0xb40AfdB85a07f37aE217E7D6462e609900dD8D7A',
    MaverickV2Router: '0x5eDEd0d7E76C563FF081Ca01D9d12D6B404Df527',
    MaverickV2Position: '0x116193c58B40D50687c0433B2aa0cC4AE00bC32c',
    MaverickV2BoostedPositionFactory:
      '0xd94C8f6D13Cf480FfAC686712C63471D1596cc29',
    MaverickV2BoostedPositionLens: '0x12DD145927CECF616cbD196789c89C2573A53244',
    MaverickV2IncentiveMatcherFactory:
      '0xa476bb7DfCDD4E59dDaA6Ea9311A24cF28561544',
    MaverickV2VotingEscrowFactory: '0x1dE8C03c2D5DD021bd456bc4bB4F0ecD85f99443',
    MaverickV2RewardFactory: '0x1cdC67950a68256c5157987bBF700e94595807F8',
    MaverickV2RewardRouter: '0xE7c73727c1b67A2fA47E63DCBaa4859777aeF392',
    MaverickV2VotingEscrowLens: '0x102f936B0fc2E74dC34E45B601FaBaA522f381F0',
    MaverickToken: '0x64b88c73A5DfA78D1713fE1b4c69a22d7E0faAa7',
    MaverickVeV2: '0x05b1b801191B41a21B9C0bFd4c4ef8952eb28cd9',
    MaverickTokenIncentiveMatcher: '0xc84bDDC0C45FEeFB0F59e1c48332E4d47e29D112',
  },
  [ChainIds.Arbitrum]: {
    WETH: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    MaverickV2Factory: '0x0A7e848Aca42d879EF06507Fca0E7b33A0a63c1e',
    MaverickV2PoolLens: '0x6A9EB38DE5D349Fe751E0aDb4c0D9D391f94cc8D',
    MaverickV2Quoter: '0xb40AfdB85a07f37aE217E7D6462e609900dD8D7A',
    MaverickV2Router: '0x5c3b380e5Aeec389d1014Da3Eb372FA2C9e0fc76',
    MaverickV2Position: '0x116193c58B40D50687c0433B2aa0cC4AE00bC32c',
    MaverickV2BoostedPositionFactory:
      '0xd94C8f6D13Cf480FfAC686712C63471D1596cc29',
    MaverickV2BoostedPositionLens: '0x12DD145927CECF616cbD196789c89C2573A53244',
    MaverickV2IncentiveMatcherFactory:
      '0x11C0F55102790f84A6F132d8B25FDFe1c96d0992',
    MaverickV2VotingEscrowFactory: '0x51E4AE1BA70D657eEF8e31a2Cb6a8b9AA61aB84e',
    MaverickV2RewardFactory: '0x873b272D7493Da5860E9c513cB805Ff3287D8470',
    MaverickV2RewardRouter: '0x293A7D159C5AD1b36b784998DE5563fe36963460',
    MaverickV2VotingEscrowLens: '0x102f936B0fc2E74dC34E45B601FaBaA522f381F0',
    MaverickToken: '0x7448c7456a97769F6cD04F1E83A4a23cCdC46aBD',
    MaverickVeV2: '0xd5d8cB7569BB843c3b8FA98dBD5960d37E83eA8d',
    MaverickTokenIncentiveMatcher: '0xB1F334176AadC61F74afc6381210e8786CcEc37D',
  },
}

export interface Asset {
  token: string
  tokenAmount: number
}
export class MaverickContext {
  public readonly pools = new Map<Address, MaverickPool>()
  public readonly routerAddr: Address
  public readonly factory: IMaverickV2Factory
  public readonly quoter: IMaverickV2Quoter
  public readonly router: IMaverickV2Router
  public readonly routerWeiroll: Contract
  public readonly poolLens: IMaverickV2PoolLens
  constructor(public readonly universe: Universe) {
    const chainId = universe.chainId
    if (!isChainIdSupported(chainId)) {
      throw new Error(`Chain ${chainId} is not supported`)
    }
    this.poolLens = IMaverickV2PoolLens__factory.connect(
      configs[chainId].MaverickV2PoolLens,
      universe.provider
    )
    this.factory = IMaverickV2Factory__factory.connect(
      configs[chainId].MaverickV2Factory,
      universe.provider
    )
    this.quoter = IMaverickV2Quoter__factory.connect(
      configs[chainId].MaverickV2Quoter,
      universe.provider
    )
    this.router = IMaverickV2Router__factory.connect(
      configs[chainId].MaverickV2Router,
      universe.provider
    )
    this.routerWeiroll = Contract.createContract(this.router)
    this.routerAddr = Address.from(this.router.address)
  }
}

export async function fetchPoolDetails(
  ctx: MaverickContext,
  poolAddress: string
) {
  const poolContract = IMaverickV2Pool__factory.connect(
    poolAddress,
    ctx.universe.provider
  )

  const result = await Promise.all([
    poolContract.callStatic.tokenA(),
    poolContract.callStatic.tokenB(),
    poolContract.callStatic.tickSpacing(),
    poolContract.callStatic.lookback(),
    poolContract.callStatic.fee(true),
    poolContract.callStatic.fee(false),
    poolContract.callStatic.getState(),
    poolContract.callStatic.getCurrentTwa(),
  ])

  const sqrtPrice = (
    await ctx.poolLens.callStatic.getPoolSqrtPrice(poolAddress)
  ).toBigInt()

  const tokenA = await ctx.universe.getToken(Address.from(result[0]))
  const tokenB = await ctx.universe.getToken(Address.from(result[1]))

  const initdata = {
    tickSpacing: result[2].toBigInt(),
    lookback: result[3].toBigInt(),
    feeAIn: result[4].toBigInt(),
    feeBIn: result[5].toBigInt(),
    state: {
      reserveA: result[6].reserveA.toBigInt(),
      reserveB: result[6].reserveB.toBigInt(),
      lastTwaD8: result[6].lastTwaD8.toBigInt(),
      lastLogPriceD8: result[6].lastLogPriceD8.toBigInt(),
      lastTimestamp: result[6].lastTimestamp,
      activeTick: result[6].activeTick,
      isLocked: result[6].isLocked,
      binCounter: result[6].binCounter,
      protocolFeeRatioD3: result[6].protocolFeeRatioD3,
    },
    currentTwa: result[7].toBigInt(),
    price: BigInt(sqrtPrice * sqrtPrice) / ONE,
  }
  return new MaverickPool(
    ctx,
    Address.from(poolAddress),
    tokenA,
    tokenB,
    initdata
  )
}

class MaverickPool {
  public readonly swapAB: MaverickSwap
  public readonly swapBA: MaverickSwap
  constructor(
    public readonly ctx: MaverickContext,
    public readonly address: Address,
    public readonly tokenA: Token,
    public readonly tokenB: Token,
    public readonly initdata: {
      tickSpacing: bigint
      lookback: bigint
      feeAIn: bigint
      feeBIn: bigint
      state: {
        reserveA: bigint
        reserveB: bigint
        lastTwaD8: bigint
        lastLogPriceD8: bigint
        lastTimestamp: number
        activeTick: number
        isLocked: boolean
        binCounter: number
        protocolFeeRatioD3: number
      }
      currentTwa: bigint
      price: bigint
    }
  ) {
    this.swapAB = new MaverickSwap(this, this.tokenA, this.tokenB)
    this.swapBA = new MaverickSwap(this, this.tokenB, this.tokenA)
  }

  public toString() {
    return `MaverickPool@${this.address}.${this.tokenA}/${this.tokenB}`
  }
}

class MaverickSwap extends Action('Maverick') {
  public get actionName(): string {
    return 'swap'
  }

  public toString(): string {
    return `MaverickSwap(${this.pool.address.toShortString()}.${
      this.tokenIn
    }->${this.tokenOut})`
  }

  public get isTrade(): boolean {
    return true
  }

  public get dependsOnRpc(): boolean {
    return true
  }

  private gasUnits = 250000n
  async quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]> {
    const result = await this.pool.ctx.quoter.callStatic.calculateSwap(
      this.pool.address.address,
      amountsIn[0].amount,
      this.tokenIn === this.pool.tokenA,
      false,
      this.tokenIn === this.pool.tokenA ? 2147483647n : -2147483648n
    )
    const out = [this.tokenOut.from(result.amountOut)]
    this.gasUnits = result.gasEstimate.toBigInt()
    return out
  }
  public get returnsOutput(): boolean {
    return true
  }

  gasEstimate(): bigint {
    return this.gasUnits
  }
  get addressesInUse(): Set<Address> {
    return new Set([this.pool.address])
  }
  async plan(
    planner: Planner,
    inputs: Value[],
    destination: Address,
    predictedInputs: TokenQuantity[]
  ) {
    const minOut = (await this.quote(predictedInputs))[0].amount
    return [
      planner.add(
        this.pool.ctx.routerWeiroll.exactInputSingle(
          destination.address,
          this.pool.address.address,
          this.tokenIn === this.pool.tokenA,
          inputs[0],
          minOut - minOut / 20n
        )
      )!,
    ]
  }
  constructor(
    public readonly pool: MaverickPool,
    public readonly tokenIn: Token,
    public readonly tokenOut: Token
  ) {
    super(
      pool.address,
      [tokenIn],
      [tokenOut],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Recipient,
      [new Approval(tokenIn, pool.ctx.routerAddr)]
    )
  }
}

async function fetchAllPools(ctx: MaverickContext): Promise<MaverickPool[]> {
  const pools: MaverickPool[] = []
  const pageSize = 25
  for (let i = 0; i < 100; i++) {
    const poolAddresses = await ctx.factory.callStatic[
      'lookup(uint256,uint256)'
    ](i * pageSize, (i + 1) * pageSize)

    const newPools = await Promise.all(
      poolAddresses.map(async (poolAddress) =>
        fetchPoolDetails(ctx, poolAddress)
      )
    )
    pools.push(...newPools)
    if (poolAddresses.length !== pageSize) {
      break
    }
  }
  return pools
}

export const setupMaverick = async (universe: Universe) => {
  const ctx = new MaverickContext(universe)
  const pools = await fetchAllPools(ctx)
  for (const pool of pools) {
    if (ctx.pools.has(pool.address)) {
      continue
    }
    ctx.pools.set(pool.address, pool)
    try {
      await pool.swapAB.quote([pool.swapAB.tokenIn.from(1)])
      universe.addAction(pool.swapAB)
      universe.addAction(pool.swapBA)
    } catch (e) {}
  }
  return pools
}
