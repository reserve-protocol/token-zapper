import { Address } from '../base/Address'
import {
  type IBasketHandler,
  IBasketHandler__factory,
  IRToken__factory,
  // IERC20__factory,
} from '../contracts'
import { type Token, type TokenQuantity } from '../entities/Token'
import { type Universe } from '../Universe'

export const rTokenIFace = IRToken__factory.createInterface()

export interface IBasket {
  basketNonce: number
  unitBasket: TokenQuantity[]
  basketTokens: Token[]
  rToken: Token
}

export class TokenBasket implements IBasket {
  private readonly basketHandler: IBasketHandler

  public issueRate = 10n ** 18n
  public basketNonce = 0
  public unitBasket: TokenQuantity[] = []
  public basketsNeeded = 0n
  public totalSupply = 0n
  get basketTokens() {
    return this.unitBasket.map((i) => i.token)
  }

  constructor(
    readonly universe: Universe,
    public readonly address: Address,
    public readonly rToken: Token
  ) {
    this.basketHandler = IBasketHandler__factory.connect(
      address.address,
      universe.provider
    )
  }

  async update() {
    const [nonce, { quantities, erc20s }] = await Promise.all([
      this.basketHandler.callStatic.nonce(),
      this.basketHandler.callStatic.quote(this.rToken.scale.toString(), 2),
    ])

    this.basketNonce = nonce
    this.unitBasket = await Promise.all(
      quantities.map(async (q, i) => {
        const token = await this.universe.getToken(
          Address.fromHexString(erc20s[i])
        )
        return token.fromBigInt(q.toBigInt())
      })
    )
  }
}
