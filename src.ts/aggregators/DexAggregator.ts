import { type Address } from '../base/Address'
import { type SwapPath } from '../searcher/Swap'
import { type Token, type TokenQuantity } from '../entities/Token'

export class DexAggregator {
  constructor(
    public readonly name: string,
    public readonly swap: (
      payerAddress: Address,
      recipientDestination: Address,
      input: TokenQuantity,
      output: Token,
      slippage: number
    ) => Promise<SwapPath>
  ) {}

  [Symbol.toStringTag] = 'DexAggregator'

  toString() {
    return `DexAggregator(name=${this.name})`
  }
}
