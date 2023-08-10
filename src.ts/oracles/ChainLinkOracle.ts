import { type Address } from '../base/Address'
import { type Token, type TokenQuantity } from '../entities/Token'
import { IChainLinkFeedRegistry__factory } from '../contracts/factories/contracts/IChainLinkFeedRegistry__factory'
import { type Universe } from '../Universe'
import { PriceOracle } from './PriceOracle'

const ISO4217USDCodeInHex = '0x0000000000000000000000000000000000000348'

export class ChainLinkOracle extends PriceOracle {
  private tokenToChainLinkInternalAddress = new Map<Token, Address>()
  
  public mapTokenTo(token: Token, address: Address) {
    this.tokenToChainLinkInternalAddress.set(token, address)
  }
  
  constructor(
    readonly universe: Universe<any>,
    readonly chainlinkRegistry: Address
  ) {
    super('ChainLink', async (token: Token): Promise<TokenQuantity | null> => {
      const addrToLookup =
        this.tokenToChainLinkInternalAddress.get(token)?.address ??
        token.address.address
      const lastestAnswer = await IChainLinkFeedRegistry__factory.connect(
        this.chainlinkRegistry.address,
        this.universe.provider
      ).callStatic.latestAnswer(addrToLookup, ISO4217USDCodeInHex)
      return universe.usd.fromEthersBn(lastestAnswer)
    }, () => universe.currentBlock)
  }
}
