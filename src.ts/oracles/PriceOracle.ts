import { Universe } from '../Universe'
import { Cached } from '../base/Cached'
import { type Token, type TokenQuantity } from '../entities/Token'

export class PriceOracle extends Cached<Token, TokenQuantity> {
  constructor(
    ltvBlocks: number,
    public readonly name: string,
    fetchPrice: (token: Token) => Promise<TokenQuantity | null>,
    getCurrentBlock: () => number,
    private readonly supportedTokens: Set<Token> = new Set()
  ) {
    super(
      async (k) => {
        if (!this.supports(k)) {
          throw new Error(`Unsupported token ${k}`)
        }
        const v = await fetchPrice(k)
        if (v == null) {
          throw new Error('Price not found')
        }
        return v
      },
      ltvBlocks,
      getCurrentBlock
    )
  }

  public static createSingleTokenOracle(
    universe: Universe,
    token: Token,
    fetchPrice: () => Promise<TokenQuantity>
  ) {
    return new PriceOracle(
      universe.config.requoteTolerance,
      `PriceProvider(${token})`,
      async (_: Token) => fetchPrice(),
      () => universe.currentBlock,
      new Set([token])
    )
  }

  public supports(token: Token) {
    if (this.supportedTokens.size === 0) {
      return true
    }
    return this.supportedTokens.has(token)
  }

  public async quote(token: Token) {
    return this.get(token)
  }
}
