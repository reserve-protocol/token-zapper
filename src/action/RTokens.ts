import { Address } from '../base/Address'
import { type IBasketHandler, IBasketHandler__factory, IRToken__factory } from '../contracts'
import { type Token, type TokenQuantity } from '../entities/Token'
import { type Universe } from '../Universe'
import { parseHexStringIntoBuffer } from '../base/utils'
import { Action, DestinationOptions, InteractionConvention } from './Action'
import { ContractCall } from '../base/ContractCall'
import { Approval } from '../base/Approval'

const rTokenIFace = IRToken__factory.createInterface()

export class BasketHandler {
  private readonly basketHandler: IBasketHandler

  private updatedOnBlock = 0
  private basketNonce = 0
  public mintQuantities: TokenQuantity[] = []
  get inputTokens () {
    return this.mintQuantities.map(i => i.token)
  }

  constructor (readonly universe: Universe, public readonly address: Address, public readonly rToken: Token) {
    this.basketHandler = IBasketHandler__factory.connect(
      address.address,
      universe.provider
    )
  }

  async getNonce () {
    if (this.updatedOnBlock !== this.universe.currentBlock) {
      await this.update()
    }
    return this.basketNonce
  }

  async getMintQuantities () {
    if (this.updatedOnBlock !== this.universe.currentBlock) {
      await this.update()
    }
    return this.mintQuantities
  }

  private async update () {
    const [nonce, { quantities, erc20s }] = await Promise.all([
      this.basketHandler.nonce(),
      this.basketHandler.quote(this.rToken.scale, 0)
    ])
    this.updatedOnBlock = this.universe.currentBlock
    this.basketNonce = nonce
    this.mintQuantities = await Promise.all(quantities.map(async (q, i) => {
      const token = await this.universe.getToken(Address.fromHexString(erc20s[i]))
      return token.quantityFromBigInt(q.toBigInt())
    }))
  }

  async init () {
    await this.update()
  }
}

export class MintRTokenAction extends Action {
  async quote (amountsIn: TokenQuantity[]): Promise<TokenQuantity[]> {
    const quantityPrToken = await this.basketHandler.getMintQuantities()

    let outRToken: TokenQuantity = amountsIn[0].div(quantityPrToken[0]).convertTo(this.basketHandler.rToken)
    for (let i = 1; i < amountsIn.length; i++) {
      const qty = amountsIn[i].div(quantityPrToken[i]).convertTo(this.basketHandler.rToken)
      if (outRToken.gt(qty)) {
        outRToken = qty
      }
    }
    return [outRToken]
  }

  async encode (amountsIn: TokenQuantity[], destination: Address): Promise<ContractCall> {
    const amount = await this.quote(amountsIn)
    return new ContractCall(
      parseHexStringIntoBuffer(rTokenIFace.encodeFunctionData('issueTo', [
        destination.address,
        amount[0].amount
      ])),
      this.basketHandler.rToken.address,
      0n,
      'RToken Issue'
    )
  }

  constructor (
    readonly universe: Universe,
    public readonly basketHandler: BasketHandler
  ) {
    super(
      basketHandler.rToken.address,
      basketHandler.inputTokens,
      [basketHandler.rToken],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Recipient,
      basketHandler.inputTokens.map(input => new Approval(input, basketHandler.rToken.address))
    )
  }

  public readonly interactionConvention = InteractionConvention.ApprovalRequired
  public readonly proceedsOptions = DestinationOptions.Recipient
}

export class BurnRTokenAction extends Action {
  async encode ([quantity]: TokenQuantity[]): Promise<ContractCall> {
    const nonce = await this.basketHandler.getNonce()
    return new ContractCall(
      parseHexStringIntoBuffer(rTokenIFace.encodeFunctionData('redeem', [
        quantity.amount,
        nonce
      ])),
      this.basketHandler.rToken.address,
      0n,
      'RToken Burn'
    )
  }

  async quote ([quantity]: TokenQuantity[]): Promise<TokenQuantity[]> {
    const quantityPrToken = await this.basketHandler.getMintQuantities()
    return quantityPrToken.map(qty => quantity.convertTo(qty.token).mul(qty))
  }

  constructor (
    readonly universe: Universe,
    readonly basketHandler: BasketHandler
  ) {
    super(
      basketHandler.rToken.address,
      [basketHandler.rToken],
      basketHandler.inputTokens,
      InteractionConvention.None,
      DestinationOptions.Recipient,
      []
    )
  }
}
