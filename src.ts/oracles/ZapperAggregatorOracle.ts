import { type Token, type TokenQuantity } from '../entities/Token'
import { type Universe } from '../Universe'
import { Cached } from '../base/Cached'
import { PriceOracle } from './PriceOracle'

export class ZapperOracleAggregator extends PriceOracle {
  constructor(readonly universe: Universe) {
    super(
      universe.config.requoteTolerance,
      'Aggregator',
      async (qty) => await this.priceAsset(qty),
      () => universe.currentBlock
    )
  }

  private async priceAsset(token: Token): Promise<TokenQuantity> {
    let sum = this.universe.usd.zero
    let samples = 0n

    await Promise.all(
      this.universe.oracles.map(async (oracle) => {
        const price = await oracle.quote(token)
        if (price == null) {
          return
        }
        if (price.token !== this.universe.usd) {
          console.log(
            'Price oracle returned price in ' +
              price.token.symbol +
              ' instead of USD'
          )
          return
        }
        sum = sum.add(price)
        samples += 1n
      })
    )

    if (samples === 0n) {
      throw new Error('Unable to price ' + token)
    }
    return sum.scalarDiv(samples)
  }
}

export class ZapperTokenQuantityPrice extends Cached<
  TokenQuantity,
  TokenQuantity
> {
  private aggregatorOracle: ZapperOracleAggregator
  private latestPrices: Map<Token, TokenQuantity> = new Map()
  constructor(readonly universe: Universe) {
    super(
      (qty) => this.quoteFn(qty),
      universe.config.requoteTolerance,
      () => universe.currentBlock
    )

    this.aggregatorOracle = new ZapperOracleAggregator(this.universe)
  }

  public dumpPrices() {
    return [...this.latestPrices.entries()].map((k) => {
      return {
        token: k[0],
        price: k[1],
      } as const
    })
  }

  private async quoteFn(qty: TokenQuantity) {
    const universe = this.universe
    const wrappedToken = universe.wrappedTokens.get(qty.token)
    if (wrappedToken != null) {
      const outTokens = await wrappedToken.burn.quote([qty])
      const sums = await Promise.all(
        outTokens.map(async (qty) => await this.get(qty))
      )
      const out = sums.reduce((l, r) => l.add(r))

      const unitPrice =
        qty.amount === qty.token.scale ? out : out.div(qty.into(out.token))
      this.latestPrices.set(qty.token, unitPrice)

      return out
    } else {
      return (await this.tokenPrice(qty.token))
        .into(qty.token)
        .mul(qty)
        .into(universe.usd)
    }
  }

  private async tokenPrice(token: Token) {
    const outPrice = await this.aggregatorOracle.quote(token)
    if (outPrice != null) {
      this.latestPrices.set(token, outPrice)
    }
    return outPrice ?? this.universe.usd.zero
  }

  public async quote(qty: TokenQuantity) {
    return this.get(qty)
  }
  public async quoteIn(tokenQty: TokenQuantity, quoteToken: Token) {
    const [priceOfOneUnitOfInput, priceOfOneUnitOfOutput] = await Promise.all([
      this.quote(tokenQty.token.one),
      this.quote(quoteToken.one),
    ])
    return priceOfOneUnitOfInput
      .div(priceOfOneUnitOfOutput)
      .into(quoteToken)
      .mul(tokenQty.into(quoteToken))
  }
}
