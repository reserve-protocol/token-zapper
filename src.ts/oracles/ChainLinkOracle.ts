import { Address } from '../base/Address'
import { IChainLinkFeedRegistry__factory } from '../contracts/factories/IChainLinkFeedRegistry__factory'
import { type Token, type TokenQuantity } from '../entities/Token'
import { type Universe } from '../Universe'
import { PriceOracle } from './PriceOracle'

const ISO4217USDCodeInHex = '0x0000000000000000000000000000000000000348'

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

  async quote_(
    token: Token,
    quoteSymbol = ISO4217USDCodeInHex
  ): Promise<TokenQuantity | null> {
    const addrToLookup =
      this.tokenToChainLinkInternalAddress.get(token)?.address ??
      token.address.address
    const lastestAnswer = await IChainLinkFeedRegistry__factory.connect(
      this.chainlinkRegistry.address,
      this.universe.provider
    ).callStatic.latestAnswer(addrToLookup, quoteSymbol)
    return (
      this.universe.tokens
        .get(Address.from(quoteSymbol))
        ?.fromEthersBn(lastestAnswer) ?? null
    )
  }

  async quoteTok(token: Token): Promise<TokenQuantity | null> {
    if (this.derived.has(token)) {
      const [derivedToken, { uoaToken, derivedTokenUnit }] = [
        token,
        this.derived.get(token)!,
      ]

      const [basePrice, derivedPrice] = await Promise.all([
        this.quote_(uoaToken, ISO4217USDCodeInHex),
        this.quote_(derivedToken, derivedTokenUnit.address),
      ])

      if (!basePrice || !derivedPrice) {
        return null
      }
      return basePrice.mul(derivedPrice.into(basePrice.token))
    }
    return await this.quote_(token)
  }

  constructor(
    readonly universe: Universe<any>,
    readonly chainlinkRegistry: Address
  ) {
    super(
      'ChainLink',
      (t) => this.quoteTok(t),
      () => universe.currentBlock
    )
  }
}
