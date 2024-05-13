import { Address } from '../base/Address'
import { TokenQuantity, type Token } from '../entities/Token'
import {
  IAToken,
  IAToken__factory,
  IPool,
  IPool__factory,
  IStaticATokenV3LM__factory,
} from '../contracts'

import { DataTypes } from '../contracts/contracts/AaveV3.sol/IPool'

import { Universe } from '../Universe'
import * as gen from '../tx-gen/Planner'
import {
  Action,
  DestinationOptions,
  InteractionConvention,
} from '../action/Action'
import { Approval } from '../base/Approval'
import { rayMul } from '../action/aaveMath'
import { setupMintableWithRate } from './setupMintableWithRate'
import {
  BurnSAV3TokensAction,
  MintSAV3TokensAction,
} from '../action/SAV3Tokens'

abstract class BaseAaveAction extends Action('AAVEV3') {
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
    return 1n
  }
  async quote(amountsIn: TokenQuantity[]) {
    return amountsIn.map((tok, i) => tok.into(this.outputToken[i]))
  }

  abstract get actionName(): string


  toString(): string {
    return `${this.actionName}(${this.inputToken.join(',')} -> ${this.outputToken.join(',')})`
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
    public readonly reserve: AaveReserve
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
    public readonly reserve: AaveReserve
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
class AaveReserve {
  public readonly supply: AaveV3ActionSupply
  public readonly withdraw: AaveV3ActionWithdraw
  get universe() {
    return this.aave.universe
  }
  get poolInst() {
    return this.aave.poolInst
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
  }

  toString() {
    return `AaveReserve(underlying=${this.reserveToken},aToken=${this.aToken})`
  }
}
export class AaveV3Deployment {
  public readonly reserves: AaveReserve[] = []

  public readonly tokenToReserve: Map<Token, AaveReserve> = new Map()
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
    const reserve = new AaveReserve(
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
    public readonly poolInst: IPool,
    public readonly universe: Universe
  ) {}

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

  public async addWrapper(wrapper: Token) {
    const wrapperInst = IStaticATokenV3LM__factory.connect(
      wrapper.address.address,
      this.universe.provider
    )
    const aToken = await this.universe.getToken(
      Address.from(await wrapperInst.aToken())
    )
    const reserve = this.tokenToReserve.get(aToken)
    if (reserve == null) {
      console.warn(`No reserve found for aToken ${aToken.toString()}`)
      return
    }
    await setupMintableWithRate(
      this.universe,
      IStaticATokenV3LM__factory,
      wrapper,
      async (rate, saInst) => {
        return {
          fetchRate: async () => (await saInst.rate()).toBigInt(),
          mint: new MintSAV3TokensAction(
            this.universe,
            reserve.reserveToken,
            wrapper,
            rate
          ),
          burn: new BurnSAV3TokensAction(
            this.universe,
            reserve.reserveToken,
            wrapper,
            rate
          ),
        }
      }
    )
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

  await Promise.all(
    config.wrappers
      .map(Address.from)
      .map(
        async (i) => await aaveInstance.addWrapper(await universe.getToken(i))
      )
  )
  return aaveInstance
}
