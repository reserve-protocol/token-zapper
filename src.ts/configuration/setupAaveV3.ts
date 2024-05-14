import { Address } from '../base/Address'
import { IAToken, IAToken__factory, IPool, IPool__factory } from '../contracts'
import { TokenQuantity, type Token } from '../entities/Token'

import { DataTypes } from '../contracts/contracts/AaveV3.sol/IPool'

import { Universe } from '../Universe'
import {
  Action,
  DestinationOptions,
  InteractionConvention,
} from '../action/Action'
import { AaveV3Wrapper } from '../action/SAV3Tokens'
import { rayMul } from '../action/aaveMath'
import { Approval } from '../base/Approval'
import { BlockCache } from '../base/BlockBasedCache'
import { DefaultMap } from '../base/DefaultMap'
import * as gen from '../tx-gen/Planner'

abstract class BaseAaveAction extends Action('AAVEV3') {
  get outToken() {
    return this.outputToken[0]
  }
  async quote(amountsIn: TokenQuantity[]) {
    return amountsIn.map((tok, i) =>
      tok.into(this.outToken).sub(this.outToken.fromBigInt(1n))
    )
  }

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

  abstract get actionName(): string

  toString(): string {
    return `${this.actionName}(${this.inputToken.join(
      ','
    )} -> ${this.outputToken.join(',')})`
  }
}

class AaveV3ActionSupply extends BaseAaveAction {
  gasEstimate(): bigint {
    return BigInt(300000n)
  }
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
      `AaveV3: supply ${predictedInputs} -> ${await this.quote(
        predictedInputs
      )}`
    )
    return null
  }
  get actionName() {
    return 'Supply'
  }
  constructor(
    readonly universe: Universe,
    public readonly reserve: AaveV3Reserve
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
class AaveV3ActionWithdraw extends BaseAaveAction {
  gasEstimate(): bigint {
    return BigInt(300000n)
  }
  get actionName() {
    return 'Withdraw'
  }
  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [await this.reserve.intoAssets(amountsIn)]
  }

  get outputSlippage() {
    return 1000n;
  }
  async plan(
    planner: gen.Planner,
    inputs: gen.Value[],
    _: Address,
    predictedInputs: TokenQuantity[]
  ) {
    const lib = this.gen.Contract.createContract(this.reserve.poolInst)
    planner.add(
      lib.withdraw(
        this.reserve.reserveToken.address.address,
        inputs[0],
        this.universe.execAddress.address
      ),
      `AaveV3: withdraw ${predictedInputs} -> ${await this.quote(
        predictedInputs
      )}`
    )
    return null
  }
  constructor(
    readonly universe: Universe,
    public readonly reserve: AaveV3Reserve
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

export class AaveV3Reserve {
  public readonly supply: AaveV3ActionSupply
  public readonly withdraw: AaveV3ActionWithdraw
  get universe() {
    return this.aave.universe
  }
  get poolInst() {
    return this.aave.poolInst
  }

  public async queryRate() {
    return (
      await this.aave.poolInst.callStatic.getReserveNormalizedIncome(
        this.reserveToken.address.address,
        { blockTag: "pending" }
      )
    ).toBigInt()
  }

  constructor(
    public readonly aave: AaveV3Deployment,
    public readonly reserveData: DataTypes.ReserveDataStruct,
    public readonly reserveToken: Token,
    public readonly aToken: Token,
    public readonly aTokenInst: IAToken,
    public readonly variableDebtToken: Token,
    public readonly intoAssets: (
      shares: TokenQuantity
    ) => Promise<TokenQuantity>
  ) {
    this.supply = new AaveV3ActionSupply(this.universe, this)
    this.withdraw = new AaveV3ActionWithdraw(this.universe, this)

    this.universe.defineMintable(this.supply, this.withdraw, false)
  }

  toString() {
    return `AaveV3Reserve(underlying=${this.reserveToken},aToken=${this.aToken})`
  }
}
export class AaveV3Deployment {
  public readonly reserves: AaveV3Reserve[] = []

  public readonly tokenToReserve: Map<Token, AaveV3Reserve> = new Map()
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
    const reserve = new AaveV3Reserve(
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

  private readonly rateCache: BlockCache<AaveV3Reserve, bigint>
  public async getRateForReserve(reserve: AaveV3Reserve) {
    return await this.rateCache.get(reserve)
  }

  private constructor(
    public readonly poolInst: IPool,
    public readonly universe: Universe
  ) {
    this.rateCache = universe.createCache<AaveV3Reserve, bigint>(
      async (reserve: AaveV3Reserve) => await reserve.queryRate(),
      1
    )
  }

  public async getRateForAToken(aToken: Token) {
    const reserve = this.tokenToReserve.get(aToken)
    if (reserve == null) {
      throw new Error(`No reserve found for aToken ${aToken.toString()}`)
    }
    return await this.rateCache.get(reserve)
  }

  static async from(poolInst: IPool, universe: Universe) {
    const reserveTokens = await Promise.all(
      (
        await poolInst.getReservesList()
      ).map(async (i) => universe.getToken(Address.from(i)))
    )

    const aaveOut = new AaveV3Deployment(poolInst, universe)

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

  private wrappers: AaveV3Wrapper[] = []
  private wrapperTokens = new DefaultMap<Token, Promise<AaveV3Wrapper>>(
    (wrapper) => AaveV3Wrapper.create(this, wrapper).then((w) => {
      this.wrappers.push(w)
      return w
    })
  )
  public async addWrapper(wrapper: Token) {
    return await this.wrapperTokens.get(wrapper)
  }

  describe() {
    const out: string[] = []
    out.push('AaveV3Deployment {')
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

interface AaveV3Config {
  pool: string
  wrappers: string[]
}

export const setupAaveV3 = async (universe: Universe, config: AaveV3Config) => {
  const poolAddress = Address.from(config.pool)
  const poolInst = IPool__factory.connect(
    poolAddress.address,
    universe.provider
  )
  const aaveInstance = await AaveV3Deployment.from(poolInst, universe)

  const wrappers = await Promise.all(
    config.wrappers.map(Address.from).map((addr) => universe.getToken(addr))
  )

  await Promise.all(wrappers.map(async (i) => await aaveInstance.addWrapper(i)))

  return aaveInstance
}
