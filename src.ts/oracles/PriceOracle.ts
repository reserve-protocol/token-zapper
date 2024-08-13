import { Universe } from '../Universe'
import { Address } from '../base/Address'
import { Cached } from '../base/Cached'
import { IChainlinkAggregator__factory } from '../contracts'
import { type Token, type TokenQuantity } from '../entities/Token'

export class PriceOracle extends Cached<Token, TokenQuantity | null> {
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
          return null
        }
        const v = await fetchPrice(k)
        if (v == null) {
          return null
        }
        return v
      },
      ltvBlocks,
      getCurrentBlock
    )
  }

  toString() {
    return `PriceOracle[${this.name}]`
  }

  public static createSingleTokenOracle(
    universe: Universe,
    token: Token,
    fetchPrice: () => Promise<TokenQuantity>
  ) {
    return new PriceOracle(
      universe.config.requoteTolerance,
      `PriceProvider(${token})`,
      async (_: Token) => await fetchPrice(),
      () => universe.currentBlock,
      new Set([token])
    )
  }

  public static async createSingleTokenOracleChainLinkLike(
    universe: Universe,
    token: Token,
    oracleAddress: Address,
    priceToken: Token
  ) {
    const oracle = IChainlinkAggregator__factory.connect(
      oracleAddress.address,
      universe.provider
    )
    const digits = BigInt(await oracle.decimals())
    const feedScale = 10n ** BigInt(digits)
    const targetScale = priceToken.scale
    return new PriceOracle(
      universe.config.requoteTolerance,
      `PriceProvider(${token})`,
      async (_: Token) => {
        let answer = (await oracle.latestAnswer()).toBigInt()
        answer = (answer * targetScale) / feedScale
        const out = priceToken.from(answer)
        if (priceToken !== universe.usd) {
          return await universe.fairPrice(out)
        }
        return out
      },
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
    try {
      return await this.get(token)
    } catch (e) {
      return null
    }
  }
}
