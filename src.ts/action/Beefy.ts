import { type Token, type TokenQuantity } from '../entities/Token'
import { type Universe } from '../Universe'
import {
  Action,
  DestinationOptions,
  InteractionConvention,
  ONE,
} from './Action'

import { Approval } from '../base/Approval'
import { IBeefyVault__factory } from '../contracts'
import { Planner, Value } from '../tx-gen/Planner'

abstract class BeefyBase extends Action('Beefy') {
  abstract get actionName(): string

  toString(): string {
    return `Beefy.${this.actionName}(${this.inputToken.join(
      ','
    )} => ${this.outputToken.join(',')}))`
  }
}

export class BeefyDepositAction extends BeefyBase {
  public get actionName(): string {
    return 'deposit'
  }
  async plan(planner: Planner, inputs: Value[]) {
    const lib = this.gen.Contract.createContract(
      IBeefyVault__factory.connect(
        this.mooToken.address.address,
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
    const rate = await this.getRate()
    return [
      this.mooToken.from(
        (((amountsIn.amount * rate) / ONE) * this.mooToken.scale) /
          this.underlying.scale
      ),
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
    public readonly mooToken: Token,
    private readonly getRate: () => Promise<bigint>
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
}

export class BeefyWithdrawAction extends BeefyBase {
  public get actionName(): string {
    return 'withdraw'
  }
  async plan(planner: Planner, inputs: Value[]) {
    const lib = this.gen.Contract.createContract(
      IBeefyVault__factory.connect(
        this.mooToken.address.address,
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
    const rate = await this.getRate()

    console.log(rate.toString())

    return [
      this.underlying.from(
        (((amountsIn.amount * ONE) / rate) * this.underlying.scale) /
          this.mooToken.scale
      ),
    ]
  }

  constructor(
    readonly universe: Universe,
    readonly underlying: Token,
    readonly mooToken: Token,
    private readonly getRate: () => Promise<bigint>
  ) {
    super(
      mooToken.address,
      [mooToken],
      [underlying],
      InteractionConvention.None,
      DestinationOptions.Callee,
      []
    )

    const contract = IBeefyVault__factory.connect(
      this.mooToken.address.address,
      this.universe.provider
    )
  }
}
