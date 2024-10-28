import { type Token, type TokenQuantity } from '../entities/Token'
import { type Universe } from '../Universe'
import { Action, DestinationOptions, InteractionConvention } from './Action'

import { Address } from '../base/Address'
import { Approval } from '../base/Approval'
import { IVaultStakeDAO__factory } from '../contracts'
import { Planner, Value } from '../tx-gen/Planner'

export class StakeDAODepositAction extends Action('StakeDAO') {
  async plan(planner: Planner, inputs: Value[], destination: Address) {
    const lib = this.gen.Contract.createContract(
      IVaultStakeDAO__factory.connect(
        this.vaultAddress.address,
        this.universe.provider
      )
    )

    planner.add(lib.deposit(destination.address, inputs[0], true))

    return null
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [this.sdToken.from(amountsIn.amount)]
  }

  gasEstimate() {
    return BigInt(200000n)
  }

  get outputSlippage() {
    return 0n
  }

  constructor(
    readonly universe: Universe,
    readonly underlying: Token,
    public readonly sdToken: Token,
    readonly vaultAddress: Address
  ) {
    super(
      sdToken.address,
      [underlying],
      [sdToken],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Callee,
      [new Approval(underlying, vaultAddress)]
    )
  }

  toString(): string {
    return `StakeDAODeposit(${this.sdToken.toString()})`
  }
}

export class StakeDAOWithdrawAction extends Action('StakeDAO') {
  async plan(planner: Planner, inputs: Value[]) {
    const lib = this.gen.Contract.createContract(
      IVaultStakeDAO__factory.connect(
        this.vaultAddress.address,
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
    return [this.sdToken.from(amountsIn.amount)]
  }

  constructor(
    readonly universe: Universe,
    readonly underlying: Token,
    readonly sdToken: Token,
    readonly vaultAddress: Address
  ) {
    super(
      sdToken.address,
      [sdToken],
      [underlying],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Recipient,
      []
    )
  }
  toString(): string {
    return `StakeDAOWithdraw(${this.sdToken.toString()})`
  }
}
