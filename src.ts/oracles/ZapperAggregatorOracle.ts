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
    if (token == this.universe.usd) {
      return token.one
    }
    let sum = this.universe.usd.zero
    let samples = 0n

    if (this.universe.singleTokenPriceOracles.has(token)) {
      const oracles = this.universe.singleTokenPriceOracles.get(token)!
      await Promise.all(
        oracles.map(async (oracle) => {
          const out = await oracle.quote(token).catch(() => null)
          if (out == null) {
            return
          }
          sum = sum.add(out)
          samples += 1n
        })
      )
      if (samples !== 0n) {
        return sum.scalarDiv(samples)
      }
    }

    await Promise.all(
      this.universe.oracles.map(async (oracle) => {
        const price = await oracle.quote(token)
        if (price == null) {
          return
        }
        if (price.token !== this.universe.usd) {
          this.universe.logger.debug(
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
    if (qty.amount === 0n) {
      return this.universe.usd.zero
    }
    if (qty.token == this.universe.usd) {
      return qty
    }
    const universe = this.universe
    const wrappedToken = universe.wrappedTokens.get(qty.token)

    if (wrappedToken != null) {
      try {
        const outTokens = await wrappedToken.burn.quote([qty])
        const sums = await Promise.all(
          outTokens.map(async (qty) => await this.get(qty))
        )
        const out = sums.reduce((l, r) => l.add(r))

        const qtyInto = qty.into(out.token)
        const unitPrice =
          qty.amount === qty.token.scale
            ? out
            : qtyInto.isZero
            ? out.token.zero
            : out.div(qtyInto)
        this.latestPrices.set(qty.token, unitPrice)

        return out
      } catch (e) {}
    }

    try {
      return (await this.tokenPrice(qty.token))
        .into(qty.token)
        .mul(qty)
        .into(universe.usd)
    } catch (e) {}

    if (!universe.hasDexMarkets(qty.token)) {
      throw new Error('Unable to price ' + qty)
    }
    console.log(`Trying dex markets to price ${qty}`)
    const usdc = await universe.getToken(universe.config.addresses.usdc)
    const [priceInWeth, priceInUsdc] = await Promise.all([
      universe.dexLiquidtyPriceStore
        .getBestQuote(qty, universe.wrappedNativeToken)
        .catch(() => null),
      universe.dexLiquidtyPriceStore.getBestQuote(qty, usdc).catch(() => null),
    ])
    console.log(`Got prices ${priceInWeth?.output} and ${priceInUsdc?.output}`)
    const valueInWeth = priceInWeth
      ? await this.universe.fairPrice(priceInWeth.output)
      : null
    const valueInUSDC =
      (priceInUsdc
        ? await this.universe.fairPrice(priceInUsdc.output)
        : null) ?? priceInUsdc?.output.into(universe.usd)

    console.log(`Got values ${valueInWeth} and ${valueInUSDC}`)
    if (valueInUSDC != null && valueInWeth != null) {
      return valueInWeth.amount > valueInUSDC.amount ? valueInWeth : valueInUSDC
    }
    const either = valueInUSDC || valueInWeth
    if (either != null) {
      return either
    }
    throw new Error('Unable to price ' + qty)
  }

  private async tokenPrice(token: Token) {
    if (token == this.universe.usd) {
      return this.universe.usd.one
    }
    const outPrice = await this.aggregatorOracle.quote(token)
    if (outPrice != null) {
      this.latestPrices.set(token, outPrice)
    }
    return outPrice ?? this.universe.usd.zero
  }

  public async quote(qty: TokenQuantity) {
    if (qty.token == this.universe.usd) {
      return qty
    }
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
