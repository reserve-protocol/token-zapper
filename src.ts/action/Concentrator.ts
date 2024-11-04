import { type Token, type TokenQuantity } from '../entities/Token'
import { type Universe } from '../Universe'
import { Action, DestinationOptions, InteractionConvention } from './Action'

import { Address } from '../base/Address'
import { Approval } from '../base/Approval'
import { IAladdinCRVConvexVault__factory } from '../contracts'
import { Planner, Value } from '../tx-gen/Planner'

abstract class ConcentratorBase extends Action('Concentrator') {
  abstract get actionName(): string

  toString(): string {
    return `Concentrator.${this.actionName}(${this.inputToken.join(
      ','
    )} => ${this.outputToken.join(',')}))`
  }
}

export class ConcentratorDepositAction extends ConcentratorBase {
  public get actionName(): string {
    return 'deposit'
  }
  async plan(planner: Planner, inputs: Value[], destination: Address) {
    const lib = this.gen.Contract.createContract(
      IAladdinCRVConvexVault__factory.connect(
        this.vaultAddress.address,
        this.universe.provider
      )
    )

    const out = planner.add(
      lib.deposit(this.pid, destination.address, inputs[0]),
      this.toString()
    )

    return out ? [out] : null
  }
  public get returnsOutput(): boolean {
    return false
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [this.virtualERC20.from(amountsIn.amount)]
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
    public readonly virtualERC20: Token,
    readonly vaultAddress: Address,
    readonly pid: number
  ) {
    super(
      virtualERC20.address,
      [underlying],
      [virtualERC20],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Recipient,
      [new Approval(underlying, vaultAddress)]
    )
  }
}
