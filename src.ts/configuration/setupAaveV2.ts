import { Address } from '../base/Address'
import { TokenQuantity, type Token } from '../entities/Token'

import { Universe } from '../Universe'
import {
  Action,
  DestinationOptions,
  InteractionConvention,
} from '../action/Action'
import { AaveV2Wrapper } from '../action/SATokens'
import { rayMul } from '../action/aaveMath'
import { Approval } from '../base/Approval'
import { BlockCache } from '../base/BlockBasedCache'
import { DefaultMap } from '../base/DefaultMap'
import { IAToken } from '../contracts/contracts/AaveV2.sol/IAToken'
import {
  ILendingPool,
  ReserveDataStruct,
} from '../contracts/contracts/AaveV2.sol/ILendingPool'
import {
  IAToken__factory,
  ILendingPool__factory,
} from '../contracts/factories/contracts/AaveV2.sol'
import * as gen from '../tx-gen/Planner'

abstract class BaseAaveV2Action extends Action('AAVEV2') {
  public get supportsDynamicInput() {
    return true
  }
  public get oneUsePrZap() {
    return false
  }
  public get returnsOutput() {
    return false
  }
  get outputSlippage() {
    return 0n
  }
  get outToken() {
    return this.outputToken[0]
  }
  async quote(amountsIn: TokenQuantity[]) {
    return amountsIn.map((tok, i) =>
      tok.into(this.outToken).sub(this.outToken.fromBigInt(1n))
    )
  }
  gasEstimate(): bigint {
    return BigInt(300000n)
  }
}

class AaveV2ActionSupply extends BaseAaveV2Action {
  async plan(
    planner: gen.Planner,
    inputs: gen.Value[],
    destination: Address,
    predictedInputs: TokenQuantity[]
  ) {
    const lib = this.gen.Contract.createContract(this.reserve.poolInst)
    planner.add(
      lib.supply(
        this.reserve.reserveToken.address.address,
        inputs[0],
        this.universe.execAddress.address,
        0
      ),
      `AaveV2: supply ${predictedInputs} -> ${await this.quote(
        predictedInputs
      )}`
    )
    return null
  }
  constructor(
    readonly universe: Universe,
    public readonly reserve: AaveV2Reserve
  ) {
    super(
      reserve.aToken.address,
      [reserve.reserveToken],
      [reserve.aToken],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Recipient,
      [new Approval(reserve.reserveToken, reserve.aToken.address)]
    )
  }
}
class AaveV2ActionWithdraw extends BaseAaveV2Action {
  gasEstimate(): bigint {
    return BigInt(300000n)
  }
  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [await this.reserve.intoAssets(amountsIn)]
  }
  async plan(
    planner: gen.Planner,
    inputs: gen.Value[],
    _: Address,
    predictedInputs: TokenQuantity[]
  ) {
    const lib = this.gen.Contract.createContract(this.reserve.poolInst)
    ///(address asset, uint256 amount, address to)
    planner.add(
      lib.withdraw(
        this.reserve.reserveToken.address.address,
        inputs[0],
        this.universe.execAddress.address
      ),
      `AaveV2: withdraw ${predictedInputs} -> ${await this.quote(
        predictedInputs
      )}`
    )
    return null
  }
  constructor(
    readonly universe: Universe,
    public readonly reserve: AaveV2Reserve
  ) {
    super(
      reserve.aToken.address,
      [reserve.aToken],
      [reserve.reserveToken],
      InteractionConvention.None,
      DestinationOptions.Recipient,
      []
    )
  }
}
export class AaveV2Reserve {
  public readonly supply: AaveV2ActionSupply
  public readonly withdraw: AaveV2ActionWithdraw
  get universe() {
    return this.aave.universe
  }
  get poolInst() {
    return this.aave.poolInst
  }
  constructor(
    public readonly aave: AaveV2Deployment,
    public readonly reserveData: ReserveDataStruct,
    public readonly reserveToken: Token,
    public readonly aToken: Token,
    public readonly aTokenInst: IAToken,
    public readonly variableDebtToken: Token,
    public readonly intoAssets: (
      shares: TokenQuantity
    ) => Promise<TokenQuantity>
  ) {
    this.supply = new AaveV2ActionSupply(this.universe, this)
    this.withdraw = new AaveV2ActionWithdraw(this.universe, this)
    this.universe.defineMintable(this.supply, this.withdraw, false)
  }

  public async queryRate() {
    return (
      await this.aave.poolInst.callStatic.getReserveNormalizedIncome(
        this.reserveToken.address.address,
        { blockTag: "pending" }
      )
    ).toBigInt()
  }

  toString() {
    return `AaveReserve(underlying=${this.reserveToken},aToken=${this.aToken})`
  }
}
export class AaveV2Deployment {
  public readonly reserves: AaveV2Reserve[] = []

  public readonly tokenToReserve: Map<Token, AaveV2Reserve> = new Map()
  get addresss() {
    return Address.from(this.poolInst.address)
  }

  public async addReserve(token: Token) {
    const reserveData = await this.poolInst.getReserveData(
      token.address.address
    )
    const { aTokenAddress, variableDebtTokenAddress } = reserveData

    const [aToken, variableDebtToken] = await Promise.all([
      this.universe.getToken(Address.from(aTokenAddress)),
      this.universe.getToken(Address.from(variableDebtTokenAddress)),
    ])
    const aTokenInst = IAToken__factory.connect(
      aTokenAddress,
      this.universe.provider
    )
    const reserve = new AaveV2Reserve(
      this,
      reserveData,
      token,
      aToken,
      aTokenInst,
      variableDebtToken,
      async (shares) => {
        const factor = await this.poolInst.getReserveNormalizedIncome(
          token.address.address
        )
        return token.from(rayMul(shares.amount, factor.toBigInt()))
      }
    )
    this.reserves.push(reserve)
    this.tokenToReserve.set(reserve.aToken, reserve)
    this.universe.addAction(reserve.supply)
    this.universe.addAction(reserve.withdraw)
    return reserve
  }

  private constructor(
    public readonly poolInst: ILendingPool,
    public readonly universe: Universe
  ) {
    this.rateCache = universe.createCache<AaveV2Reserve, bigint>(
      async (reserve: AaveV2Reserve) => await reserve.queryRate(),
      1
    )
  }

  static async from(poolInst: ILendingPool, universe: Universe) {
    const reserveTokens = await Promise.all(
      (
        await poolInst.getReservesList()
      ).map(async (i) => universe.getToken(Address.from(i)))
    )

    const aaveOut = new AaveV2Deployment(poolInst, universe)

    await Promise.all(
      reserveTokens.map(async (token) => {
        return await aaveOut.addReserve(token)
      })
    )

    return aaveOut
  }

  toString() {
    return `AaveV3([${this.reserves.join(', ')}])`
  }

  private readonly rateCache: BlockCache<AaveV2Reserve, bigint>
  public async getRateForReserve(reserve: AaveV2Reserve) {
    return await this.rateCache.get(reserve)
  }

  private wrappers: AaveV2Wrapper[] = []
  private wrapperTokens = new DefaultMap<Token, Promise<AaveV2Wrapper>>(
    (wrapper) =>
      AaveV2Wrapper.create(this, wrapper).then((w) => {
        this.wrappers.push(w)
        return w
      })
  )
  public async addWrapper(wrapper: Token) {
    return await this.wrapperTokens.get(wrapper)
  }

  describe() {
    const out: string[] = []
    out.push('AaveV2Deployment {')
    out.push(`  pool: ${this.poolInst.address}`)
    out.push(`  reserves: [`)
    out.push(...this.reserves.map((i) => `    ${i.toString()}`))
    out.push(`  ]`)
    out.push(`  wrappers: [`)
    out.push(...this.wrappers.map((i) => `    ${i.toString()}`))
    out.push(`  ]`)
    out.push('}')
    return out
  }
}

interface AaveV2Config {
  pool: string
  wrappers: string[]
}

export const setupAaveV2 = async (universe: Universe, config: AaveV2Config) => {
  const poolAddress = Address.from(config.pool)
  const poolInst = ILendingPool__factory.connect(
    poolAddress.address,
    universe.provider
  )
  const aaveInstance = await AaveV2Deployment.from(poolInst, universe)
  const wrappers = await Promise.all(
    config.wrappers.map(Address.from).map((addr) => universe.getToken(addr))
  )
  await Promise.all(wrappers.map(async (i) => await aaveInstance.addWrapper(i)))
  return aaveInstance
}
