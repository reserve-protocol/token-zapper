import { Cached } from '../base/Cached'
import { type Token, type TokenQuantity } from '../entities/Token'

export class PriceOracle extends Cached<Token, TokenQuantity> {
  constructor(
    public readonly name: string,
    fetchPrice: (token: Token) => Promise<TokenQuantity | null>,
    getCurrentBlock: () => number
  ) {
    super(
      (k) =>
        fetchPrice(k).then((v) => {
          if (v == null) {
            throw new Error('Price not found')
          }
          return v
        }),
      20,
      getCurrentBlock
    )
  }

  public async quote(token: Token) {
    return this.get(token)
  }
}
