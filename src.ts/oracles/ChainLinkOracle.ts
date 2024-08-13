import { Address } from '../base/Address'
import { CHAINLINK } from '../base/constants'
import { Config } from '../configuration/ChainConfiguration'
import { IChainLinkFeedRegistry__factory } from '../contracts/factories/contracts/IChainLinkFeedRegistry__factory'
import { type Token, type TokenQuantity } from '../entities/Token'
import { type Universe } from '../Universe'
import { PriceOracle } from './PriceOracle'

export class ChainLinkOracle extends PriceOracle {
  private tokenToChainLinkInternalAddress = new Map<Token, Address>()
  private derived = new Map<
    Token,
    { uoaToken: Token; derivedTokenUnit: Address }
  >()

  public mapTokenTo(token: Token, address: Address) {
    this.tokenToChainLinkInternalAddress.set(token, address)
  }

  public addDerived(
    derived: Token,
    uoaToken: Token,
    derivedTokenUnit: Address
  ) {
    this.derived.set(derived, { uoaToken, derivedTokenUnit })
  }

  private unsupported: Set<Token> = new Set()

  private async quote_(
    token: Token,
    quoteSymbol: Address
  ): Promise<TokenQuantity | null> {
    try {
      const addrToLookup =
        this.tokenToChainLinkInternalAddress.get(token)?.address ??
        token.address.address
      const lastestAnswer = await IChainLinkFeedRegistry__factory.connect(
        this.chainlinkRegistry.address,
        this.universe.provider
      ).callStatic.latestAnswer(addrToLookup, quoteSymbol.address)
      return (
        this.universe.tokens
          .get(Address.from(quoteSymbol))
          ?.fromEthersBn(lastestAnswer) ?? null
      )
    } catch (e) {
      this.unsupported.add(token)
      return null
    }
  }

  public supports(token: Token): boolean {
    return !this.unsupported.has(token)
  }

  async quoteTok(token: Token): Promise<TokenQuantity | null> {
    if (this.derived.has(token)) {
      const [derivedToken, { uoaToken, derivedTokenUnit }] = [
        token,
        this.derived.get(token)!,
      ]

      const [basePrice, derivedPrice] = await Promise.all([
        this.quote_(uoaToken, CHAINLINK.USD),
        this.quote_(derivedToken, derivedTokenUnit),
      ])

      if (!basePrice || !derivedPrice) {
        return null
      }
      return basePrice.mul(derivedPrice.into(basePrice.token))
    }
    return await this.quote_(token, CHAINLINK.USD)
  }

  constructor(
    readonly universe: Universe<Config>,
    readonly chainlinkRegistry: Address
  ) {
    super(
      universe.config.requoteTolerance,
      'ChainLink',
      (t) => this.quoteTok(t),
      () => universe.currentBlock
    )
  }
}
