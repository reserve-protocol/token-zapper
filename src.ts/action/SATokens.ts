import { Address } from '../base/Address'
import { type Token, type TokenQuantity } from '../entities/Token'
import { Action, DestinationOptions, InteractionConvention } from './Action'

import { Approval } from '../base/Approval'
import { AaveV2Deployment, AaveV2Reserve } from '../configuration/setupAaveV2'
import type { IStaticATokenLM } from '../contracts/contracts/ISAtoken.sol'
import { IStaticATokenLM__factory } from '../contracts/factories/contracts/ISAtoken.sol/IStaticATokenLM__factory'
import { Contract, FunctionCall, Planner, Value } from '../tx-gen/Planner'
import { rayDiv, rayMul } from './aaveMath'

abstract class BaseAaveV2 extends Action('SAV2Token') {
  public get reserve() {
    return this.wrapper.reserve
  }
  public abstract readonly wrapper: AaveV2Wrapper
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
      `IStaticATokenLM.${this.actionName}(${predicted.join(
        ', '
      )}) # -> ${await this.quote(predicted)}`
    )
    return null
  }
  protected abstract planAction(input: Value): FunctionCall
  
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
  get outputSlippage() {
    return 0n
  }

  toString() {
    return `${this.protocol}.${this.actionName}(${this.inputToken.join(
      ', '
    )} -> ${this.outputToken.join(', ')})`
  }
}

export class MintSAV2TokensAction extends BaseAaveV2 {
  public actionName: string = 'deposit'

  protected planAction(input: Value): FunctionCall {
    return this.lib.deposit(this.universe.execAddress.address, input, 0, true)
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    const rate = await this.getRate()
    const x = rayDiv(amountsIn.amount, rate)
    return [this.outputToken[0].fromBigInt(x)]
  }

  constructor(public readonly wrapper: AaveV2Wrapper) {
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
export class BurnSAV2TokensAction extends BaseAaveV2 {
  public actionName: string = 'withdraw'

  protected planAction(input: Value): FunctionCall {
    return this.lib.withdraw(this.universe.execAddress.address, input, true)
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    const rate = await this.getRate()
    const x = rayMul(amountsIn.amount, rate)
    return [this.outputToken[0].fromBigInt(x)]
  }

  constructor(public readonly wrapper: AaveV2Wrapper) {
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

export class AaveV2Wrapper {
  public readonly mint: MintSAV2TokensAction
  public readonly burn: BurnSAV2TokensAction

  public readonly wrapperLib: Contract
  get reserveToken() {
    return this.reserve.reserveToken
  }
  get universe() {
    return this.reserve.universe
  }
  private constructor(
    public readonly reserve: AaveV2Reserve,
    public readonly saToken: Token,
    public readonly wrapperInst: IStaticATokenLM
  ) {
    this.mint = new MintSAV2TokensAction(this)
    this.burn = new BurnSAV2TokensAction(this)
    this.wrapperLib = Contract.createContract(this.wrapperInst)

    this.universe.defineMintable(this.mint, this.burn, true)
  }

  public static async create(aave: AaveV2Deployment, saToken: Token) {
    const wrapperInst = IStaticATokenLM__factory.connect(
      saToken.address.address,
      aave.universe.provider
    )
    const aToken = await aave.universe.getToken(
      Address.from(await wrapperInst.ATOKEN())
    )
    const reserve = aave.tokenToReserve.get(aToken)
    if (reserve == null) {
      throw new Error(`No reserve found for ${aToken}`)
    }
    return new AaveV2Wrapper(reserve, saToken, wrapperInst)
  }

  toString() {
    return `IStaticATokenLM(${this.saToken}[${this.saToken.address.toShortString()}], ${this.reserveToken})`
  }
}
