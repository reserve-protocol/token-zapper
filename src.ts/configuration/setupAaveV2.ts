import { Address } from '../base/Address'
import { TokenQuantity, type Token } from '../entities/Token'

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
  ILendingPool,
  ReserveDataStruct,
} from '../contracts/contracts/AaveV2.sol/ILendingPool'
import {
  IAToken__factory,
  ILendingPool__factory,
} from '../contracts/factories/contracts/AaveV2.sol'
import {
  IAToken,
  IATokenInterface,
} from '../contracts/contracts/AaveV2.sol/IAToken'
import { IStaticATokenLM__factory } from '../contracts/factories/contracts/ISAtoken.sol'
import { BurnSATokensAction, MintSATokensAction } from '../action/SATokens'

const DataTypes = {}

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
    return 1n
  }
  async quote(amountsIn: TokenQuantity[]) {
    return amountsIn.map((tok, i) => tok.into(this.outputToken[i]))
  }
}

class AaveV2ActionSupply extends BaseAaveV2Action {
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
    destination: Address,
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
      `AaveV3: withdraw ${predictedInputs} -> ${await this.quote(
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
class AaveV2Reserve {
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
  ) {}

  static async from(poolInst: ILendingPool, universe: Universe) {
    const aaveOut = new AaveV2Deployment(poolInst, universe)

    return aaveOut
  }

  async loadAllReserves() {
    const reserveTokens = await Promise.all(
      (
        await this.poolInst.getReservesList()
      ).map(async (i) => this.universe.getToken(Address.from(i)))
    )
    await Promise.all(
      reserveTokens.map(async (token) => {
        return await this.addReserve(token)
      })
    )
  }

  toString() {
    return `AaveV2([${this.reserves.join(', ')}])`
  }

  public async addWrapper(wrapper: Token) {
    const wrapperInst = IStaticATokenLM__factory.connect(
      wrapper.address.address,
      this.universe.provider
    )
    const aToken = await this.universe.getToken(
      Address.from(await wrapperInst.ATOKEN())
    )
    const reserveToken = await this.universe.getToken(
      Address.from(await wrapperInst.ASSET())
    );
    const reserve = await this.addReserve(reserveToken)
    if (reserve == null) {
      console.warn(`No reserve found for aToken ${aToken.toString()}`)
      return
    }
    await setupMintableWithRate(
      this.universe,
      IStaticATokenLM__factory,
      wrapper,
      async (rate, saInst) => {
        return {
          fetchRate: async () => (await saInst.rate()).toBigInt(),
          mint: new MintSATokensAction(
            this.universe,
            reserve.reserveToken,
            wrapper,
            rate
          ),
          burn: new BurnSATokensAction(
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
  await Promise.all(
    config.wrappers
      .map(Address.from)
      .map(
        async (i) => await aaveInstance.addWrapper(await universe.getToken(i))
      )
  )
  return aaveInstance
}
