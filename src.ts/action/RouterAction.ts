import { type Universe } from '../Universe'
import { DexRouter } from '../aggregators/DexAggregator'
import { Address } from '../base/Address'
import { Approval } from '../base/Approval'
import { type TokenQuantity, Token } from '../entities/Token'
import { SwapPath } from '../searcher/Swap'
import { Planner, Value } from '../tx-gen/Planner'
import { Action, DestinationOptions, InteractionConvention } from './Action'

export class RouterAction extends Action('Router') {
  public get outputSlippage(): bigint {
    return this.universe.config.defaultInternalTradeSlippage
  }
  get supportsDynamicInput() {
    return this.dex.supportsDynamicInput
  }
  get oneUsePrZap() {
    return this.dex.oneUsePrZap
  }
  get returnsOutput() {
    return this.dex.returnsOutput
  }

  private _addressesInUse = new Set<Address>()
  get addressesInUse() {
    return this._addressesInUse
  }

  async plan(
    planner: Planner,
    inputs: Value[],
    destination: Address,
    predicted: TokenQuantity[]
  ): Promise<Value[]> {
    const res = await this.innerQuote(predicted)

    for (const step of res.steps) {
      inputs = await step.action.planWithOutput(
        this.universe,
        planner,
        inputs,
        destination,
        predicted
      )
      predicted = step.outputs
    }
    return inputs
  }
  gasEstimate() {
    return BigInt(150000n)
  }

  async innerQuote(input: TokenQuantity[]): Promise<SwapPath> {
    const ctr = new AbortController()
    this._addressesInUse = new Set()
    return await new Promise((resolve) =>
      this.dex
        .swap(
          ctr.signal,
          input[0],
          this.outputToken[0],
          this.universe.config.defaultInternalTradeSlippage
        )
        .then((res) => {
          ctr.abort()
          const a = res.steps
            .filter((i) => i.action.oneUsePrZap)
            .map((i) => i.action.addressesInUse)
          this._addressesInUse = new Set(a.map((i) => [...i]).flat())
          resolve(res)
        })
        .catch((e) => {
          this._addressesInUse = new Set()
          throw e
        })
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
      router,
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
    return `Router[${this.dex.name}](${this.inputToken.join(
      ', '
    )} -> ${this.outputToken.join(', ')})`
  }
}
