import { Address } from '../base/Address'
import { Approval } from '../base/Approval'
import { AaveV3Deployment, AaveV3Reserve } from '../configuration/setupAaveV3'
import { IStaticATokenV3LM } from '../contracts'
import { IStaticATokenV3LM__factory } from '../contracts/factories/contracts/AaveV3.sol/IStaticATokenV3LM__factory'
import { type Token, type TokenQuantity } from '../entities/Token'
import { Contract, FunctionCall, Planner, Value } from '../tx-gen/Planner'
import { Action, DestinationOptions, InteractionConvention } from './Action'
import { rayDiv, rayMul } from './aaveMath'

abstract class BaseAaveV3 extends Action('SAV3Token') {
  public get reserve() {
    return this.wrapper.reserve
  }
  public abstract readonly wrapper: AaveV3Wrapper
  public abstract readonly actionName: string

  async plan(
    planner: Planner,
    inputs: Value[],
    _: Address,
    predicted: TokenQuantity[]
  ) {
    const inp = inputs[0] ?? predicted[0].amount
    planner.add(
      this.planAction(inp),
      `IStaticATokenV3LM.${this.actionName}(${predicted.join(
        ', '
      )}) # -> ${await this.quote(predicted)}`
    )
    return null
  }
  protected abstract planAction(input: Value): FunctionCall
  get outputSlippage() {
    return 0n
  }
  get saToken() {
    return this.wrapper.saToken
  }
  get underlyingToken() {
    return this.reserve.reserveToken
  }
  get returnsOutput() {
    return false
  }
  get supportsDynamicInput() {
    return true
  }
  gasEstimate() {
    return BigInt(300000n)
  }
  get lib() {
    return this.wrapper.wrapperLib
  }
  get universe() {
    return this.wrapper.universe
  }

  async getRate() {
    return await this.reserve.aave.getRateForReserve(this.reserve)
  }

  toString() {
    return `${this.protocol}.${this.actionName}(${this.inputToken.join(
      ', '
    )} -> ${this.outputToken.join(', ')})`
  }
}

export class MintSAV3TokensAction extends BaseAaveV3 {
  public actionName: string = 'deposit'

  protected planAction(input: Value): FunctionCall {
    return this.lib.deposit(
      input,
      this.reserve.universe.execAddress.address,
      0,
      true
    )
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    const rate = await this.getRate()
    const x = rayDiv(amountsIn.amount, rate)
    return [this.outputToken[0].fromBigInt(x)]
  }

  constructor(public readonly wrapper: AaveV3Wrapper) {
    super(
      wrapper.saToken.address,
      [wrapper.reserveToken],
      [wrapper.saToken],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Callee,
      [new Approval(wrapper.reserveToken, wrapper.saToken.address)]
    )
  }
}
export class BurnSAV3TokensAction extends BaseAaveV3 {
  public actionName: string = 'redeem'

  protected planAction(input: Value): FunctionCall {
    return this.lib.redeem(
      input,
      this.reserve.universe.execAddress.address,
      this.universe.execAddress.address,
      true
    )
  }


  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    const rate = await this.getRate()
    const x = rayMul(amountsIn.amount, rate)

    return [this.outputToken[0].fromBigInt(x)]
  }

  constructor(public readonly wrapper: AaveV3Wrapper) {
    super(
      wrapper.saToken.address,
      [wrapper.saToken],
      [wrapper.reserveToken],
      InteractionConvention.None,
      DestinationOptions.Callee,
      []
    )
  }
}

export class AaveV3Wrapper {
  public readonly mint: MintSAV3TokensAction
  public readonly burn: BurnSAV3TokensAction

  public readonly wrapperLib: Contract
  get reserveToken() {
    return this.reserve.reserveToken
  }
  get universe() {
    return this.reserve.universe
  }
  private constructor(
    public readonly reserve: AaveV3Reserve,
    public readonly saToken: Token,
    public readonly wrapperInst: IStaticATokenV3LM
  ) {
    this.mint = new MintSAV3TokensAction(this)
    this.burn = new BurnSAV3TokensAction(this)

    this.wrapperLib = Contract.createContract(this.wrapperInst)

    this.universe.defineMintable(this.mint, this.burn, true)
  }

  public static async create(aaveV3: AaveV3Deployment, saToken: Token) {
    const wrapperInst = IStaticATokenV3LM__factory.connect(
      saToken.address.address,
      aaveV3.universe.provider
    )
    const aToken = await aaveV3.universe.getToken(
      Address.from(await wrapperInst.aToken())
    )
    const reserve = aaveV3.tokenToReserve.get(aToken)
    if (reserve == null) {
      throw new Error(`No reserve found for ${aToken}`)
    }
    return new AaveV3Wrapper(reserve, saToken, wrapperInst)
  }

  toString() {
    return `IStaticATokenV3LM(${
      this.saToken
    }[${this.saToken.address.toShortString()}], ${this.reserveToken})`
  }
}
