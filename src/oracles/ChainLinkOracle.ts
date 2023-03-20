import { type Address } from '../base/Address'
import { type Token, type TokenQuantity } from '../entities/Token'
import { IChainLinkFeedRegistry__factory } from '../contracts'
import { type Universe } from '../Universe'
import { Oracle } from './Oracle'

export class ChainLinkOracle extends Oracle {
  public tokenToChainLinkInternalAddress = new Map<Token, Address>()
  mapTokenTo(token: Token, address: Address) {
    this.tokenToChainLinkInternalAddress.set(
      token,
      address
    )
  }

  constructor(readonly universe: Universe, readonly chainlinkRegistry: Address) {
    super(
      "Chainlink",
      async (token: Token): Promise<TokenQuantity | null> => {
        const addrToLookup = this.tokenToChainLinkInternalAddress.get(token)?.address ?? token.address.address
        try {
          const round = await IChainLinkFeedRegistry__factory.connect(this.chainlinkRegistry.address, this.universe.provider).callStatic.latestAnswer(
            addrToLookup,
            '0x0000000000000000000000000000000000000348'
          )
          return this.universe.usd.quantityFromBigInt(round.toBigInt())
        } catch (e) {
          return null
        }
      }
    );
  }
}
