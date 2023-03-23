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
    const [nonce, { quantities, erc20s }] =
      await Promise.all([
        this.basketHandler.nonce(),
        this.basketHandler.quote(this.rToken.scale, 2),
        // this.basketHandler.basketsNeeded(),
        // await IERC20__factory.connect(
        //   this.rToken.address.address,
        //   this.universe.provider
        // ).totalSupply(),
      ])
    // this.basketsNeeded = basketsNeeded.toBigInt()
    // this.totalSupply = totalSupply.toBigInt()

    this.basketNonce = nonce
    this.unitBasket = await Promise.all(
      quantities.map(async (q, i) => {
        const token = await this.universe.getToken(
          Address.fromHexString(erc20s[i])
        )
        return token.quantityFromBigInt(q.toBigInt())
      })
    )
  }
}
