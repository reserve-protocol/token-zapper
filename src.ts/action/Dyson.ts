import { type Token, type TokenQuantity } from '../entities/Token'
import { type Universe } from '../Universe'
import { Action, DestinationOptions, InteractionConvention } from './Action'

import { Approval } from '../base/Approval'
import { IDysonVault__factory } from '../contracts'
import { Planner, Value } from '../tx-gen/Planner'

abstract class DysonBase extends Action('Dyson') {
  abstract get actionName(): string

  toString(): string {
    return `Dyson.${this.actionName}(${this.inputToken.join(
      ','
    )} => ${this.outputToken.join(',')}))`
  }
}

export class DysonDepositAction extends DysonBase {
  public get actionName(): string {
    return 'deposit'
  }
  async plan(planner: Planner, inputs: Value[]) {
    const lib = this.gen.Contract.createContract(
      IDysonVault__factory.connect(
        this.dysonToken.address.address,
        this.universe.provider
      )
    )
    planner.add(lib.deposit(inputs[0]), this.toString())

    return null
  }
  public get returnsOutput(): boolean {
    return false
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    const rate = await IDysonVault__factory.connect(
      this.dysonToken.address.address,
      this.universe.provider
    ).callStatic.getPricePerFullShare()
    return [
      this.dysonToken.from((amountsIn.amount * rate.toBigInt()) / 10n ** 18n),
    ]
  }

  gasEstimate() {
    return BigInt(200000n)
  }

  get outputSlippage() {
    return 1n
  }

  constructor(
    readonly universe: Universe,
    readonly underlying: Token,
    public readonly dysonToken: Token
  ) {
    super(
      dysonToken.address,
      [underlying],
      [dysonToken],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Callee,
      [new Approval(underlying, dysonToken.address)]
    )
  }
}

export class DysonWithdrawAction extends DysonBase {
  public get actionName(): string {
    return 'withdraw'
  }
  async plan(planner: Planner, inputs: Value[]) {
    const lib = this.gen.Contract.createContract(
      IDysonVault__factory.connect(
        this.dysonToken.address.address,
        this.universe.provider
      )
    )
    planner.add(lib.withdraw(inputs[0]), this.toString())

    return null
  }

  public get returnsOutput(): boolean {
    return false
  }

  gasEstimate() {
    return BigInt(200000n)
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    const rate = await IDysonVault__factory.connect(
      this.dysonToken.address.address,
      this.universe.provider
    ).callStatic.getPricePerFullShare()

    return [
      this.underlying.from((amountsIn.amount * 10n ** 18n) / rate.toBigInt()),
    ]
  }

  constructor(
    readonly universe: Universe,
    readonly underlying: Token,
    readonly dysonToken: Token
  ) {
    super(
      dysonToken.address,
      [dysonToken],
      [underlying],
      InteractionConvention.None,
      DestinationOptions.Callee,
      []
    )
  }
}
