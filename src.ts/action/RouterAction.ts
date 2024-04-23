import { type Universe } from '../Universe'
import { DexRouter } from '../aggregators/DexAggregator'
import { type Address } from '../base/Address'
import { Approval } from '../base/Approval'
import { type TokenQuantity, Token } from '../entities/Token'
import { Planner, Value } from '../tx-gen/Planner'
import { Action, DestinationOptions, InteractionConvention } from './Action'

export class RouterAction extends Action {
  async plan(
    planner: Planner,
    inputs: Value[],
    destination: Address,
    predicted: TokenQuantity[]
  ): Promise<Value[]> {
    const res = await this.innerQuote(predicted)

    for (const step of res.steps) {
      inputs = await step.action.plan(planner, inputs, destination, predicted)
      predicted = step.outputs
    }
    return inputs
  }
  gasEstimate() {
    return BigInt(300000n)
  }

  async innerQuote(input: TokenQuantity[]) {
    return await this.dex.swap(
      this.universe.execAddress,
      this.universe.execAddress,
      input[0],
      this.outputToken[0],
      0
    )
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    const out = await this.innerQuote([amountsIn])
    return out.outputs
  }

  constructor(
    readonly dex: DexRouter,
    readonly universe: Universe,
    readonly router: Address,
    inputToken: Token,
    outputToken: Token
  ) {
    super(
      universe.execAddress,
      [inputToken],
      [outputToken],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Callee,
      [new Approval(inputToken, router)]
    )

    if (this.inputToken.length !== 1 || this.outputToken.length !== 1) {
      throw new Error('RouterAction requires exactly one input and one output')
    }
  }
  toString(): string {
    return `Trade(router: ${this.dex.name}, ${this.inputToken.join(
      ', '
    )} -> ${this.outputToken.join(', ')})`
  }
}
