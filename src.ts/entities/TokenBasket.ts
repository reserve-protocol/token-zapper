import { Address } from '../base/Address'
import { IBasketHandler__factory } from '../contracts/factories/contracts/IBasketHandler__factory'


import { type Token, type TokenQuantity } from '../entities/Token'
import { type Universe } from '../Universe'


export interface IBasket {
  basketNonce: number
  unitBasket: TokenQuantity[]
  basketTokens: Token[]
  rToken: Token

  quote(baskets: bigint): Promise<TokenQuantity[]>
}

export class TokenBasket implements IBasket {
  private readonly basketHandler: ReturnType<typeof IBasketHandler__factory.connect>

  public issueRate = 10n ** 18n
  public basketNonce = 0
  public unitBasket: TokenQuantity[] = []
  public basketsNeeded = 0n
  public totalSupply = 0n
  get basketTokens() {
    return this.unitBasket.map((i) => i.token)
  }

  constructor(
    readonly universe: Universe<any>,
    public readonly address: Address,
    public readonly rToken: Token
  ) {
    this.basketHandler = IBasketHandler__factory.connect(
      address.address,
      universe.provider
    )
  }

  async update() {
    const [unit, nonce] = await Promise.all([
      this.quote(this.rToken.scale),
      this.basketHandler.nonce()
    ])
    this.basketNonce = nonce
    this.unitBasket = unit
  }

  async quote(baskets: bigint) {
    const {
      quantities,
      erc20s
    } = await this.basketHandler.callStatic.quote(baskets, 2)

    return await Promise.all(
      quantities.map(async (q, i) => {
        const token = await this.universe.getToken(
          Address.fromHexString(erc20s[i])
        )
        return token.fromBigInt(q.toBigInt())
      })
    )

  }
}
