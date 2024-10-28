import { type Token, type TokenQuantity } from '../entities/Token'
import { type Universe } from '../Universe'
import { Action, DestinationOptions, InteractionConvention } from './Action'

import { Approval } from '../base/Approval'
import { IBeefyVault__factory } from '../contracts'
import { Planner, Value } from '../tx-gen/Planner'

export class BeefyDepositAction extends Action('Beefy') {
  async plan(planner: Planner, inputs: Value[]) {
    const lib = this.gen.Contract.createContract(
      IBeefyVault__factory.connect(
        this.mooToken.address.address,
        this.universe.provider
      )
    )
    planner.add(lib.deposit(inputs[0]))

    return null
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    const rate = await IBeefyVault__factory.connect(
      this.mooToken.address.address,
      this.universe.provider
    ).callStatic.getPricePerFullShare()
    return [
      this.mooToken.from((amountsIn.amount * rate.toBigInt()) / 10n ** 18n),
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
    public readonly mooToken: Token
  ) {
    super(
      mooToken.address,
      [underlying],
      [mooToken],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Callee,
      [new Approval(underlying, mooToken.address)]
    )
  }

  toString(): string {
    return `BeefyDeposit(${this.mooToken.toString()})`
  }
}

export class BeefyWithdrawAction extends Action('Beefy') {
  async plan(planner: Planner, inputs: Value[]) {
    const lib = this.gen.Contract.createContract(
      IBeefyVault__factory.connect(
        this.mooToken.address.address,
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
    const rate = await IBeefyVault__factory.connect(
      this.mooToken.address.address,
      this.universe.provider
    ).callStatic.getPricePerFullShare()

    return [
      this.underlying.from((amountsIn.amount * 10n ** 18n) / rate.toBigInt()),
    ]
  }

  constructor(
    readonly universe: Universe,
    readonly underlying: Token,
    readonly mooToken: Token
  ) {
    super(
      mooToken.address,
      [mooToken],
      [underlying],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Recipient,
      []
    )
  }
  toString(): string {
    return `BeefyWithdraw(${this.mooToken.toString()})`
  }
}
