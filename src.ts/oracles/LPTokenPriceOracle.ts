import { type Token, type TokenQuantity } from '../entities/Token'
import { type Universe } from '../Universe'
import { PriceOracle } from './PriceOracle'

export class LPTokenPriceOracle extends PriceOracle {
  async quoteTok(token: Token): Promise<TokenQuantity | null> {
    if (!this.universe.lpTokens.has(token)) {
      return null
    }
    const lpToken = this.universe.lpTokens.get(token)!
    const out = await Promise.all(
      (
        await lpToken.burn(token.one)
      ).map(
        async (t) =>
          (await this.universe.fairPrice(t)) ?? this.universe.usd.zero
      )
    )
    return out.reduce((acc, t) => {
      return acc.add(t)
    }, this.universe.usd.zero)
  }
  constructor(
    readonly universe: Universe<any>,
  ) {
    super(
      'ChainLink',
      (t) => this.quoteTok(t),
      () => universe.currentBlock
    )
  }
}
