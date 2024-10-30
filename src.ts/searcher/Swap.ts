import {
  type DestinationOptions,
  type InteractionConvention,
  type BaseAction,
} from '../action/Action'
import { type Address } from '../base/Address'
import { type TokenQuantity } from '../entities/Token'
import { TokenAmounts } from '../entities/TokenAmounts'
import { type Universe } from '../Universe'

/**
 * A single Step token exchange
 */
export class SingleSwap {
  public readonly type = 'SingleSwap'

  get supportsDynamicInput() {
    return this.action.supportsDynamicInput
  }
  constructor(
    public readonly inputs: TokenQuantity[],
    public readonly action: BaseAction,
    public readonly outputs: TokenQuantity[]
  ) { }

  get proceedsOptions() {
    return this.action.proceedsOptions
  }
  get interactionConvention() {
    return this.action.interactionConvention
  }
  get address(): Address {
    return this.action.address
  }

  async exchange(tokenAmounts: TokenAmounts) {
    tokenAmounts.exchange(this.inputs, this.outputs)
  }

  toString() {
    return `SingleSwap(input: ${this.inputs
      .map((i) => i.formatWithSymbol())
      .join(', ')}, action: ${this.action}, output: ${this.outputs
        .map((i) => i.formatWithSymbol())
        .join(', ')})`
  }

  describe() {
    return [this.toString()]
  }

  get gasUnits() {
    return this.action.gasEstimate()
  }
}

class PathStats {
  constructor(
    public readonly outputValue: TokenQuantity,
    public readonly txFee: TokenQuantity,
    public readonly netValue: TokenQuantity,
    public readonly gasUnits: bigint
  ) { }
}

class BasePath {
  get proceedsOptions(): DestinationOptions {
    return this.steps.at(-1)!.proceedsOptions
  }
  get interactionConvention(): InteractionConvention {
    return this.steps.at(0)!.interactionConvention
  }
  constructor(
    public readonly stats: PathStats,
    public readonly steps: SingleSwap[],
    public readonly inputs: TokenQuantity[],
    public readonly outputs: TokenQuantity[]
  ) { }

  get supportsDynamicInput() {
    return this.steps[0].action.supportsDynamicInput
  }
  async exchange(tokenAmounts: TokenAmounts) {
    tokenAmounts.exchange(this.inputs, this.outputs)
  }

  get gasUnits() {
    return this.stats.gasUnits
  }
  get netValue() {
    return this.stats.netValue
  }
  get txFee() {
    return this.stats.txFee
  }

  public proportions() {
    return this.outputs.map((i) => i.div(this.stats.outputValue.into(i.token)))
  }
}

export class SwapPath1to1 extends BasePath {
  constructor(
    public readonly input: TokenQuantity,
    steps: SingleSwap[],
    public readonly output: TokenQuantity,
    stats: PathStats
  ) {
    super(stats, steps, [input], [output])
  }
}

export class SwapPath1toN extends BasePath {
  constructor(
    public readonly input: TokenQuantity,
    steps: SingleSwap[],
    outputs: TokenQuantity[],
    stats: PathStats
  ) {
    super(stats, steps, [input], outputs)
  }
}

/**
 * A SwapPath groups a set of SingleSwap's together. The output of one SingleSwap is the input of the next.
 * A SwapPath may be optimized, as long as the input's and output's remain the same.
 */
export class SwapPath {
  public readonly type = 'MultipleSwaps'

  get proceedsOptions(): DestinationOptions {
    return this.steps.at(-1)!.proceedsOptions
  }
  get interactionConvention(): InteractionConvention {
    return this.steps.at(0)!.interactionConvention
  }

  get address(): Address {
    return this.steps.at(0)!.address
  }

  intoSwapPaths(universe: Universe): SwapPaths {
    return new SwapPaths(
      universe,
      this.inputs,
      [this],
      this.outputs,
      this.outputValue
    )
  }

  constructor(
    public readonly inputs: TokenQuantity[],
    public readonly steps: SingleSwap[],
    public readonly outputs: TokenQuantity[],
    public readonly outputValue: TokenQuantity
  ) {
    if (steps.length === 0) {
      throw new Error('Invalid SwapPath, no steps')
    }
  }

  get supportsDynamicInput() {
    return this.steps[0].action.supportsDynamicInput
  }

  async exchange(tokenAmounts: TokenAmounts) {
    tokenAmounts.exchange(this.inputs, this.outputs)
  }

  // This is a bad way to compare, ideally the USD value gets compared
  compare(other: SwapPath) {
    const comp = this.outputValue.compare(other.outputValue)
    if (comp !== 0) {
      return comp
    }
    let score = 0
    for (let index = 0; index < this.outputs.length; index++) {
      score += this.outputs[index].compare(other.outputs[index])
    }
    return score
  }

  toString() {
    return `SwapPath(input: ${this.inputs
      .map((i) => i.formatWithSymbol())
      .join(', ')}, steps: ${this.steps.join(', ')}, output: ${this.outputs
        .map((i) => i.formatWithSymbol())
        .join(', ')} (${this.outputValue.formatWithSymbol()}))`
  }

  describe() {
    const out: string[] = []
    out.push(`SwapPath {`)
    out.push(`  inputs: ${this.inputs.join(', ')}`)
    out.push(`  steps:`)
    for (let i = 0; i < this.steps.length; i++) {
      const step = this.steps[i]
      if (step.type === 'SingleSwap') {
        out.push(`    Step ${i + 1}: via ${step.describe()}`)
      } else {
        const desc = step.describe()
        out.push(`    Step ${i + 1}: via ${desc[0]}`)
        for (let j = 1; j < desc.length; j++) {
          out.push(`    ${desc[j]}`)
        }
      }
    }
    out.push(`  outputs: ${this.outputs.join(', ')}`)
    out.push('}')
    return out
  }

  async cost(universe: Universe) {
    return await universe.quoteGas(this.gasUnits)
  }

  async netValue(universe: Universe) {
    const txPrice = await this.cost(universe)
    return this.outputValue.sub(txPrice.txFeeUsd)
  }

  get gasUnits(): bigint {
    return this.steps.map((s) => s.gasUnits).reduce((l, r) => l + r, 0n)
  }
}

/**
 * SwapPaths groups SwapPath's together into sections
 * The swapPaths can be reordered, as long as the following holds for the ith SwapPath:
 * (sum(swapPaths[0..i-1].outputs) - sum(swapPaths[0..i-1].inputs)) >= swapPaths[i].inputs
 *
 * Basically, if you sum up all the inputs and output for all previous steps
 * You are holding enough tokens to do the current step.
 */
export class SwapPaths {
  // public readonly swapPaths: SwapPath[] = []
  constructor(
    readonly universe: Universe,
    public readonly inputs: TokenQuantity[],
    public readonly swapPaths: SwapPath[],
    public readonly outputs: TokenQuantity[],
    public readonly outputValue: TokenQuantity
  ) { }

  public static fromPaths(universe: Universe, paths: SwapPath[]) {
    if (paths.length === 0) {
      throw new Error('Invalid SwapPaths, no paths')
    }
    const allInputs = paths.map((i) => i.inputs).flat()
    const inputs = TokenAmounts.fromQuantities(allInputs)
    const allOutputs = paths.map((i) => i.outputs).flat()
    const outputs = TokenAmounts.fromQuantities(allOutputs)
    const outputValue = paths
      .map((i) => i.outputValue)
      .reduce((l, r) => l.add(r))
    return new SwapPaths(
      universe,
      inputs.toTokenQuantities(),
      paths,
      outputs.toTokenQuantities(),
      outputValue
    )
  }

  async exchange(tokenAmounts: TokenAmounts) {
    tokenAmounts.exchange(this.inputs, this.outputs)
  }

  get gasUnits() {
    return this.swapPaths.map((s) => s.gasUnits).reduce((l, r) => l + r, 0n)
  }

  toShortString() {
    return `SwapPaths(input:${this.inputs},output:${this.outputs
      },ops:[${this.swapPaths
        .map((i) => {
          return `[${i.inputs.join(', ')} => ${i.outputs.join(', ')}]`
        })
        .join(', ')}])`
  }

  toString() {
    return `SwapPaths(input: ${this.inputs
      .map((i) => i.formatWithSymbol())
      .join(', ')}, swapPaths: ${this.swapPaths.join(
        ', '
      )}, output: ${this.outputs
        .map((i) => i.formatWithSymbol())
        .join(', ')} (${this.outputValue.formatWithSymbol()}))`
  }

  describe() {
    const out: string[] = []
    out.push(`SwapPaths {`)
    out.push(`  inputs: ${this.inputs.join(', ')}`)
    out.push(`  actions:`)
    for (let i = 0; i < this.swapPaths.length; i++) {
      const subExchangeDescription = this.swapPaths[i].describe()
      out.push(
        ...subExchangeDescription.map((line) => {
          return '    ' + line
        })
      )
    }

    out.push(`  outputs: ${this.outputs.join(', ')}`)
    out.push('}')
    return out
  }

  async cost(universe: Universe) {
    return await universe.quoteGas(this.gasUnits)
  }

  async netValue(universe: Universe) {
    const txPrice = await this.cost(universe)
    return this.outputValue.sub(txPrice.txFeeUsd)
  }
}

/**
 * A list steps to go from token set A to token set B.
 * A SwapPlan contains a linear set of actions to go from some input basket
 * to some output basket. But does not yet has any concrete values attached to it.
 *
 * Using the quote method with an input basket, a SwapPath can be generated.
 * The SwapPath is the concrete SwapPlan that contains the sub-actions inputs and outputs,
 * and can be used to generate an actual transaction.
 * */
export class SwapPlan {
  constructor(
    readonly universe: Universe,
    public readonly steps: BaseAction[],
  ) { }

  public get inputs() {
    return this.steps[0].inputToken
  }
  public get outputs() {
    return this.steps[this.steps.length - 1].outputToken
  }

  public async outputProportions() {
    return await this.steps.at(-1)!.outputProportions()
  }

  public async quote(
    input: TokenQuantity[]
  ): Promise<SwapPath> {
    if (input.length === 0) {
      throw new Error('Invalid input, no input tokens ' + this.toString())
    }
    let legAmount = input
    const swaps: SingleSwap[] = []

    for (const step of this.steps) {
      if (step.inputToken.length !== legAmount.length) {
        throw new Error(
          'Invalid input, input count does not match Action input length: ' +
          step.inputToken.join(', ') +
          ' vs ' +
          legAmount.join(', ') +
          ' ' +
          this.toString()
        )
      }

      const output = await step.quoteWithSlippage(legAmount)
      swaps.push(new SingleSwap(legAmount, step, output))
      legAmount = output
    }

    const value = (
      await Promise.all(
        legAmount.map(
          async (i) =>
            (await this.universe.fairPrice(i)) ?? this.universe.usd.zero
        )
      )
    ).reduce((l, r) => l.add(r))

    return new SwapPath(input, swaps, legAmount, value)
  }

  toString() {
    return `SwapPlan(${this.steps.map((i) => i.toString()).join(', ')})`
  }
}
