import { DefaultMap } from '../base/DefaultMap'
import { type Token, type TokenQuantity } from '../entities/Token'

const NULL_VAL = { result: null, block: 0 }
export class Oracle {
  constructor(
    public readonly name: string,
    public readonly fairTokenPriceImplementation: (token: Token) => Promise<TokenQuantity | null>
  ) { }

  public currentPrices = new DefaultMap<Token, Promise<{ result: TokenQuantity | null, block: number }>>(async () => await Promise.resolve(NULL_VAL))
  async fairTokenPrice(block: number, token: Token): Promise<TokenQuantity | null> {
    const current = await (this.currentPrices.get(token) ?? Promise.resolve(NULL_VAL))
    if (current.block < block) {
      this.currentPrices.set(
        token,
        this.fairTokenPriceImplementation(token).then(result => ({ result, block }))
      )
    }
    return await this.currentPrices.get(token).then(({ result }) => result)
  }
}
