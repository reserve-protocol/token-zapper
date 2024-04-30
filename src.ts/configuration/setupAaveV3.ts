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

const BaseAaveAction = Action('AAVEV3')

class AaveV3ActionSupply extends BaseAaveAction {
  get outputSlippage() {
    return 1n
  }
  quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]> {
    return Promise.resolve([this.outputToken[0].from(amountsIn[0].amount)])
  }
  gasEstimate(): bigint {
    return BigInt(300000n)
  }
  async plan(
    planner: gen.Planner,
    inputs: gen.Value[],
    destination: Address,
    predictedInputs: TokenQuantity[]
  ): Promise<gen.Value[]> {
    const lib = this.gen.Contract.createContract(this.reserve.poolInst)
    planner.add(
      lib.supply(
        this.reserve.reserveToken.address.address,
        inputs[0],
        destination.address,
        0
      ),
      `AaveV3: supply ${predictedInputs} -> ${await this.quote(
        predictedInputs
      )}`
    )
    return this.outputBalanceOf(this.universe, planner)
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
  get outputSlippage() {
    return 1n
  }
  gasEstimate(): bigint {
    return BigInt(300000n)
  }
  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [await this.reserve.intoAssets(amountsIn)]
  }
  async plan(
    planner: gen.Planner,
    inputs: gen.Value[],
    destination: Address,
    predictedInputs: TokenQuantity[]
  ): Promise<gen.Value[]> {
    const lib = this.gen.Contract.createContract(this.reserve.poolInst)
    ///(address asset, uint256 amount, address to)
    planner.add(
      lib.supply(
        this.reserve.reserveToken.address.address,
        inputs[0],
        destination.address
      ),
      `AaveV3: withdraw ${predictedInputs} -> ${await this.quote(
        predictedInputs
      )}`
    )
    return this.outputBalanceOf(this.universe, planner)
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
    public readonly aave: AaveV3,
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
    return `AaveReserve(${this.reserveToken},${this.aToken})`
  }
}
class AaveV3 {
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

    const aaveOut = new AaveV3(poolInst, universe)

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
export const setupAaveV3 = async (
  universe: Universe,
  poolAddress: Address,
  wrappers: Token[]
) => {
  const poolInst = IPool__factory.connect(
    poolAddress.address,
    universe.provider
  )
  const aaveInstance = await AaveV3.from(poolInst, universe)
  await Promise.all(
    wrappers.map(async (wrapper) => await aaveInstance.addWrapper(wrapper))
  )
  return aaveInstance
}
