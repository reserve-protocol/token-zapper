import { type SwapSignature } from './SwapSignature'

export class DexAggregator {
  constructor(
    public readonly name: string,
    public readonly swap: SwapSignature
  ) {}

  [Symbol.toStringTag] = 'DexAggregator'

  toString() {
    return `DexAggregator(name=${this.name})`
  }
}
