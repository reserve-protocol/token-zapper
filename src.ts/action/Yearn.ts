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
    const rate = await this.getRate()
    return [this.yvToken.from((amountsIn.amount * rate) / 10n ** 18n)]
  }

  gasEstimate() {
    return BigInt(200000n)
  }

  get returnsOutput(): boolean {
    return false
  }

  get outputSlippage() {
    return 1n
  }

  constructor(
    readonly universe: Universe,
    readonly underlying: Token,
    public readonly yvToken: Token,
    private readonly getRate: () => Promise<bigint>
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

  get returnsOutput(): boolean {
    return false
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    const rate = await this.getRate()

    return [this.underlying.from((amountsIn.amount * 10n ** 18n) / rate)]
  }

  constructor(
    readonly universe: Universe,
    readonly underlying: Token,
    readonly yvToken: Token,
    private readonly getRate: () => Promise<bigint>
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
