import { type Token, type TokenQuantity } from '../entities/Token'
import { type Universe } from '../Universe'
import { Action, DestinationOptions, InteractionConvention } from './Action'

import { Approval } from '../base/Approval'
import { IVaultYearn__factory } from '../contracts'
import { Planner, Value } from '../tx-gen/Planner'

export class YearnDepositAction extends Action('Yearn') {
  async plan(planner: Planner, inputs: Value[]) {
    const lib = this.gen.Contract.createContract(
      IVaultYearn__factory.connect(
        this.yvToken.address.address,
        this.universe.provider
      )
    )
    planner.add(lib.deposit(inputs[0]))

    return null
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    const rate = await IVaultYearn__factory.connect(
      this.yvToken.address.address,
      this.universe.provider
    ).callStatic.pricePerShare()
    return [
      this.yvToken.from((amountsIn.amount * rate.toBigInt()) / 10n ** 18n),
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
    public readonly yvToken: Token
  ) {
    super(
      yvToken.address,
      [underlying],
      [yvToken],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Callee,
      [new Approval(underlying, yvToken.address)]
    )
  }

  toString(): string {
    return `YearnDeposit(${this.yvToken.toString()})`
  }
}

export class YearnWithdrawAction extends Action('Yearn') {
  async plan(planner: Planner, inputs: Value[]) {
    const lib = this.gen.Contract.createContract(
      IVaultYearn__factory.connect(
        this.yvToken.address.address,
        this.universe.provider
      )
    )
    planner.add(lib.withdraw(inputs[0]))

    return null
  }

  gasEstimate() {
    return BigInt(200000n)
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    const rate = await IVaultYearn__factory.connect(
      this.yvToken.address.address,
      this.universe.provider
    ).callStatic.pricePerShare()

    return [
      this.underlying.from((amountsIn.amount * 10n ** 18n) / rate.toBigInt()),
    ]
  }

  constructor(
    readonly universe: Universe,
    readonly underlying: Token,
    readonly yvToken: Token
  ) {
    super(
      yvToken.address,
      [yvToken],
      [underlying],
      InteractionConvention.None,
      DestinationOptions.Callee,
      []
    )
  }
  toString(): string {
    return `YearnWithdraw(${this.yvToken.toString()})`
  }
}
