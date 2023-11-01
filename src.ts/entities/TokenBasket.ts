import { Address } from '../base/Address'
import { IBasketHandler__factory } from '../contracts/factories/contracts/IBasketHandler__factory'
import { RTokenLens__factory } from '../contracts/factories/contracts/RTokenLens__factory'

import { type Token, type TokenQuantity } from '../entities/Token'
import { type Universe } from '../Universe'

export interface IBasket {
  basketNonce: number
  unitBasket: TokenQuantity[]
  basketTokens: Token[]
  rToken: Token

  redeem(amount: TokenQuantity): Promise<TokenQuantity[]>
}

export class TokenBasket implements IBasket {
  private readonly basketHandler: ReturnType<typeof IBasketHandler__factory.connect>
  private readonly lens: ReturnType<typeof RTokenLens__factory.connect>

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
    public readonly basketHandlerAddress: Address,
    public readonly rToken: Token,
    public readonly assetRegistry: Address,

  ) {
    this.basketHandler = IBasketHandler__factory.connect(
      basketHandlerAddress.address,
      universe.provider
    )
    this.lens = RTokenLens__factory.connect(
      universe.config.addresses.rtokenLens.address,
      universe.provider
    )
  }

  async update() {
    const [unit, nonce] = await Promise.all([
      this.redeem(
        this.rToken.one
      ),
      this.basketHandler.nonce()
    ])
    this.basketNonce = nonce
    this.unitBasket = unit
  }

  async redeem(quantity: TokenQuantity) {
    const {
      quantities,
      erc20s
    } = await this.lens.callStatic.redeem(
      this.assetRegistry.address,
      this.basketHandlerAddress.address,
      this.rToken.address.address,
      quantity.amount
    ).catch(() => this.basketHandler.quote(
      quantity.amount,
      2
    ))

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
