import { type Address } from '../base/Address'
import { type Swaps } from '../searcher/Swap'
import { type Token, type TokenQuantity } from '../entities/Token'

export class DexAggregator {
  constructor (
    public readonly name: string,
    public readonly swap: (fromAddress: Address, destination: Address, input: TokenQuantity, output: Token, slippage: number) => Promise<Swaps>
  ) { }
}
