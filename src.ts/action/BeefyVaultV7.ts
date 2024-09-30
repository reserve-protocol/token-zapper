import { type Token, type TokenQuantity } from '../entities/Token'
import { type Universe } from '../Universe'
import { Action, DestinationOptions, InteractionConvention } from './Action'

import { Address } from '../base/Address'
import { Approval } from '../base/Approval'
import { IBeefyVaultV7__factory} from '../contracts'
import { Planner, Value } from '../tx-gen/Planner'

/**
 * Used to deposit tokens into a BeefyVaultV7
 */
export class BeefyVaultV7DepositAction extends Action('BeefyVaultV7') {
  async plan(planner: Planner, inputs: Value[]) {
    const lib = this.gen.Contract.createContract(
      IBeefyVaultV7__factory.connect(
        this.vault.address,
        this.universe.provider
      )
    )
    planner.add(lib.deposit(inputs[0]))

    // deposit does not return anything
    return null;
  }
  gasEstimate() {

    // dummy vlaue need to get the actual
    return BigInt(100000n)
  }

  get outputSlippage() {
    return 0n
  }

  
  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    // amountsIn * getPricePerFullShare
    // Use TokenQuantiyt.fpMul
    return [this.mooToken.from(amountsIn.amount)]
  }

  constructor(
    readonly universe: Universe,
    readonly underlying: Token,
    readonly mooToken: Token,
    readonly vault: Address
  ) {
    super(
      mooToken.address,
      [underlying],
      [mooToken],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Callee,
      [new Approval(underlying, vault)]
    )
  }

  toString(): string {
    return `BeefyVault7Deposit(${this.underlying.toString()})`
  }
}

