import { Address } from '../base/Address'
import { numberOfUnits, TokenAmounts, type TokenQuantity } from '../entities/Token'
import { type Universe } from '../Universe'
import { parseHexStringIntoBuffer } from '../base/utils'
import { Action, DestinationOptions, InteractionConvention } from './Action'
import { ContractCall } from '../base/ContractCall'
import { Approval } from '../base/Approval'
import { rTokenIFace, IBasket } from '../entities/TokenBasket'

export class MintRTokenAction extends Action {
  async quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]> {
    if (amountsIn.length !== this.input.length) {
      throw new Error('Invalid inputs for RToken mint')
    }
    const unitsRequested = numberOfUnits(amountsIn, this.basket.unitBasket)

    return [this.basket.rToken.quantityFromBigInt((unitsRequested / 1000n) * 1000n)]
  }

  async exchange(input: TokenQuantity[], balances: TokenAmounts) {
    const outputs = await this.quote(input)
    const inputsConsumed = this.basket.unitBasket.map((qty) =>
      outputs[0].convertTo(qty.token).mul(qty)
    )
    balances.exchange(inputsConsumed, outputs)
  }

  async encode(
    amountsIn: TokenQuantity[],
    destination: Address
  ): Promise<ContractCall> {
    const units = (await this.quote(amountsIn))[0]
    return new ContractCall(
      parseHexStringIntoBuffer(
        rTokenIFace.encodeFunctionData('issueTo', [
          destination.address,
          units.amount
        ])
      ),
      this.basket.rToken.address,
      0n,
      `RToken(${this.basket.rToken},input:${amountsIn},issueAmount:${units},destination: ${destination})`
    )
  }

  constructor(
    readonly universe: Universe,
    public readonly basket: IBasket
  ) {
    super(
      basket.rToken.address,
      basket.basketTokens,
      [basket.rToken],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Recipient,
      basket.basketTokens.map(
        (input) => new Approval(input, basket.rToken.address)
      )
    )
  }

  public readonly interactionConvention = InteractionConvention.ApprovalRequired
  public readonly proceedsOptions = DestinationOptions.Recipient

  toString(): string {
    return `RTokenMint(${this.basket.rToken.toString()})`
  }
}

export class BurnRTokenAction extends Action {
  async encode([quantity]: TokenQuantity[]): Promise<ContractCall> {
    const nonce = await this.basketHandler.basketNonce
    return new ContractCall(
      parseHexStringIntoBuffer(
        rTokenIFace.encodeFunctionData('redeem', [quantity.amount, nonce])
      ),
      this.basketHandler.rToken.address,
      0n,
      'RToken Burn'
    )
  }

  async quote([quantity]: TokenQuantity[]): Promise<TokenQuantity[]> {
    const quantityPrToken = await this.basketHandler.unitBasket
    return quantityPrToken.map((qty) => quantity.convertTo(qty.token).mul(qty))
  }

  constructor(
    readonly universe: Universe,
    readonly basketHandler: IBasket
  ) {
    super(
      basketHandler.rToken.address,
      [basketHandler.rToken],
      basketHandler.basketTokens,
      InteractionConvention.None,
      DestinationOptions.Recipient,
      []
    )
  }

  toString(): string {
    return `RTokenBurn(${this.basketHandler.rToken.toString()})`
  }
}
