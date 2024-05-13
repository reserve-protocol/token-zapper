import { Transaction } from 'paraswap'
import { Address, TokenQuantity, Universe } from '..'
import { Approval } from '../base/Approval'
import { Planner, Value } from '../tx-gen/Planner'
import { Action, DestinationOptions, InteractionConvention } from './Action'

export class ParaswapAction extends Action('Paraswap') {
  get outputSlippage(): bigint {
    return 0n
  }
  plan(
    planner: Planner,
    inputs: Value[],
    destination: Address,
    predictedInputs: TokenQuantity[]
  ): Promise<Value[]> {
    throw new Error('Method not implemented.')
  }
  constructor(
    public readonly universe: Universe,
    public readonly tx: Transaction,
    public readonly inputQuantity: TokenQuantity,
    public readonly outputQuantity: TokenQuantity
  ) {
    super(
      Address.from(tx.to),
      [inputQuantity.token],
      [outputQuantity.token],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Recipient,
      [new Approval(inputQuantity.token, Address.from(tx.to))]
    )
  }

  async quote(_: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [this.outputQuantity]
  }
  gasEstimate(): bigint {
    return 200_000n
  }

  toString() {
    return `ParaswapAction(${this.inputQuantity} => ${this.outputQuantity})`
  }

  static createAction(
    universe: Universe,
    input: TokenQuantity,
    output: TokenQuantity,
    tx: Transaction
  ) {
    return new ParaswapAction(universe, tx, input, output)
  }
}
