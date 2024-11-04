import { type Token, type TokenQuantity } from '../entities/Token'

export class LPToken {
  constructor(
    public readonly token: Token,
    public readonly poolTokens: Token[],
    public readonly lpRedeem: (amount: TokenQuantity) => Promise<TokenQuantity[]>,
    public readonly lpMint: (
      amountsIn: TokenQuantity[]
    ) => Promise<TokenQuantity>
  ) {
  }

  toString() {
    return `LP(lp=${this.token},tokens=${this.poolTokens.join(',')})`
  }
}