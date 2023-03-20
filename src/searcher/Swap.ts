import { type Action } from '../action/Action'
import { type Address } from '../base/Address'
import { type TokenQuantity } from '../entities/Token'
import { type Universe } from '../Universe'

class Swap {
  constructor(
    public readonly input: TokenQuantity[],
    public readonly action: Action,
    public readonly output: TokenQuantity[]
  ) {}

  toString() {
    return `Swap(input: ${this.input
      .map((i) => i.formatWithSymbol())
      .join(', ')}, action: ${this.action}, output: ${this.output
      .map((i) => i.formatWithSymbol())
      .join(', ')})`
  }
}

export class Swaps {
  constructor(
    readonly universe: Universe,
    public readonly inputs: TokenQuantity[],
    public readonly steps: Swap[],
    public readonly output: TokenQuantity[],
    public readonly outputValue: TokenQuantity,
    public readonly destination: Address
  ) {}

  // This is a bad way to compare, ideally the USD value gets compared
  compare(other: Swaps) {
    const comp = this.outputValue.compare(other.outputValue)
    if (comp !== 0) {
      return comp
    }
    let score = 0
    for (let index = 0; index < this.output.length; index++) {
      score += this.output[index].compare(other.output[index])
    }
    return score
  }

  toString() {
    return `Swaps(input: ${this.inputs
      .map((i) => i.formatWithSymbol())
      .join(', ')}, steps: ${this.steps.join(', ')}, output: ${this.output
      .map((i) => i.formatWithSymbol())
      .join(', ')} (${this.outputValue.formatWithSymbol()}))`
  }
}

/** Abstract set of steps to go from A to B */
export class SwapPlan {
  constructor(readonly universe: Universe, public readonly steps: Action[]) {}

  get inputs() {
    return this.steps[0].input
  }

  public async quote(
    input: TokenQuantity[],
    destination: Address
  ): Promise<Swaps> {
    let legAmount = input
    const swaps: Swap[] = []

    for (const step of this.steps) {
      if (step.input.length !== legAmount.length) {
        throw new Error('')
      }
      const output = await step.quote(legAmount)
      swaps.push(new Swap(legAmount, step, output))
      legAmount = output
    }

    const value = (
      await Promise.all(
        legAmount.map(
          async (i) =>
            await this.universe
              .fairPrice(i)
              .then((i) => i ?? this.universe.usd.zero)
        )
      )
    ).reduce((l, r) => l.add(r))

    return new Swaps(this.universe, input, swaps, legAmount, value, destination)
  }

  toString() {
    return `SwapPlan(${this.steps.map((i) => i.toString()).join(', ')})`
  }
}
