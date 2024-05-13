import { type Token, type TokenQuantity } from '../entities/Token'
import { type Universe } from '../Universe'
import { Cached } from '../base/Cached'
import { PriceOracle } from './PriceOracle'

export class ZapperOracleAggregator extends PriceOracle {
  constructor(readonly universe: Universe) {
    super(
      universe.config.requoteTolerance,
      'Aggregator',
      (qty) => this.priceAsset(qty),
      () => universe.currentBlock
    )
  }

  private async priceAsset(token: Token): Promise<TokenQuantity> {
    const promises = this.universe.oracles
      .filter((i) => i.supports(token))
      .map(async (oracle) => {
        const price = await oracle.quote(token)
        if (price != null) {
          return price
        }
        throw new Error('Unable to price ' + token)
      })
    return await Promise.race(promises)
  }
}

export class ZapperTokenQuantityPrice extends Cached<
  TokenQuantity,
  TokenQuantity
> {
  private aggregatorOracle: ZapperOracleAggregator
  constructor(readonly universe: Universe) {
    super(
      (qty) => this.quoteFn(qty),
      universe.config.requoteTolerance * 4,
      () => universe.currentBlock
    )

    this.aggregatorOracle = new ZapperOracleAggregator(this.universe)
  }

  private async quoteFn(qty: TokenQuantity) {
    const universe = this.universe
    const wrappedToken = universe.wrappedTokens.get(qty.token)
    if (wrappedToken != null) {
      const outTokens = await wrappedToken.burn.quote([qty])
      const sums = await Promise.all(
        outTokens.map(async (qty) => await this.get(qty))
      )
      return sums.reduce((l, r) => l.add(r))
    } else {
      return (await this.tokenPrice(qty.token))
        .into(qty.token)
        .mul(qty)
        .into(universe.usd)
    }
  }

  private async tokenPrice(token: Token) {
    for (const oracle of this.universe.oracles) {
      try {
        return await oracle.quote(token)
      } catch (e) {}
    }
    throw new Error('Unable to price ' + token)
  }

  public async quoteToken(token: Token) {
    if (!this.universe.wrappedTokens.has(token)) {
      return this.aggregatorOracle.quote(token)
    }
    return this.get(token.one)
  }
  public async quote(qty: TokenQuantity) {
    return this.get(qty)
  }
  public async quoteIn(qty: TokenQuantity, tokenToQuoteWith: Token) {
    const [priceOfOneUnitOfInput, priceOfOneUnitOfOutput] = await Promise.all([
      this.quote(qty.token.one),
      this.quote(tokenToQuoteWith.one),
    ])
    return priceOfOneUnitOfInput
      .div(priceOfOneUnitOfOutput)
      .into(tokenToQuoteWith)
      .mul(qty.into(tokenToQuoteWith))
  }
}
