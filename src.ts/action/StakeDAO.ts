import { type Token, type TokenQuantity } from '../entities/Token'
import { type Universe } from '../Universe'
import { Action, DestinationOptions, InteractionConvention } from './Action'

import { Address } from '../base/Address'
import { Approval } from '../base/Approval'
import { IVaultStakeDAO__factory } from '../contracts'
import { Planner, Value } from '../tx-gen/Planner'

abstract class StakeDAOBase extends Action('StakeDAO') {
  abstract get actionName(): string

  toString(): string {
    return `StakeDAO.${this.actionName}(${this.inputToken.join(
      ','
    )} => ${this.outputToken.join(',')}))`
  }
}

export class StakeDAODepositAction extends StakeDAOBase {
  public get actionName(): string {
    return 'deposit'
  }
  async plan(planner: Planner, inputs: Value[], destination: Address) {
    const lib = this.gen.Contract.createContract(
      IVaultStakeDAO__factory.connect(
        this.vaultAddress.address,
        this.universe.provider
      )
    )

    planner.add(
      lib.deposit(destination.address, inputs[0], true),
      this.toString()
    )

    return null
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [this.sdToken.from(amountsIn.amount)]
  }

  public get returnsOutput(): boolean {
    return false
  }

  gasEstimate() {
    return BigInt(200000n)
  }

  get outputSlippage() {
    return 0n
  }

  get dependsOnRpc() {
    return true
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
      DestinationOptions.Recipient,
      [new Approval(underlying, vaultAddress)]
    )
  }
}

export class StakeDAOWithdrawAction extends StakeDAOBase {
  public get actionName(): string {
    return 'withdraw'
  }
  async plan(planner: Planner, inputs: Value[]) {
    const lib = this.gen.Contract.createContract(
      IVaultStakeDAO__factory.connect(
        this.vaultAddress.address,
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
      InteractionConvention.None,
      DestinationOptions.Callee,
      []
    )
  }
}
