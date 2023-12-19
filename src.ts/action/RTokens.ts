import { Address } from '../base/Address'
import {
  numberOfUnits,
  type TokenQuantity,
} from '../entities/Token'
import { TokenAmounts } from '../entities/TokenAmounts'
import { type Universe } from '../Universe'
import { parseHexStringIntoBuffer } from '../base/utils'
import { Action, DestinationOptions, InteractionConvention } from './Action'
import { ContractCall } from '../base/ContractCall'
import { Approval } from '../base/Approval'
import { IBasket } from '../entities/TokenBasket'
import { IRToken__factory } from '../contracts'
import { Planner, Value } from '../tx-gen/Planner'

const rTokenIFace = IRToken__factory.createInterface()

export class MintRTokenAction extends Action {
  async plan(planner: Planner, inputs: Value[], destination: Address) {
    const lib = this.gen.Contract.createContract(IRToken__factory.connect(
      this.input[0].address.address,
      this.universe.provider
    ))
    const out = planner.add(lib.issueTo(inputs[0], destination.address))
    return [out!]
  }
  gasEstimate() {
    return BigInt(600000n)
  }

  get outputSlippage() {
    return 3000000n;
  }
  async quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]> {
    await this.universe.refresh(this.address)
    if (amountsIn.length !== this.input.length) {
      throw new Error('Invalid inputs for RToken mint')
    }
    const unitsRequested = numberOfUnits(amountsIn, this.basket.unitBasket)
    return [
      this.basket.rToken.fromBigInt(
        unitsRequested
      ),
    ]
  }

  async exchange(input: TokenQuantity[], balances: TokenAmounts) {
    const outputs = await this.quote(input)
    const inputsConsumed = this.basket.unitBasket.map((qty) =>
      outputs[0].into(qty.token).mul(qty)
    )
    balances.exchange(inputsConsumed, outputs)
  }

  async encode(
    amountsIn: TokenQuantity[],
    destination: Address
  ): Promise<ContractCall> {
    const units = (await this.quote(amountsIn))[0]
    return this.encodeIssueTo(
      amountsIn,
      units,
      destination
    )
  }

  async encodeIssueTo(
    amountsIn: TokenQuantity[],
    units: TokenQuantity,
    destination: Address
  ): Promise<ContractCall> {
    return new ContractCall(
      parseHexStringIntoBuffer(
        rTokenIFace.encodeFunctionData('issueTo', [
          destination.address,
          units.amount,
        ])
      ),
      this.basket.rToken.address,
      0n,
      this.gasEstimate(),
      `Issue RToken(${this.basket.rToken},input:${amountsIn},issueAmount:${units},destination: ${destination})`
    )
  }

  constructor(readonly universe: Universe, public readonly basket: IBasket) {
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
  get outputSlippage() {
    return 300000n;
  }
  async plan(planner: Planner, inputs: Value[], destination: Address) {
    const nonce = this.basketHandler.basketNonce
    const lib = this.gen.Contract.createContract(IRToken__factory.connect(
      this.input[0].address.address,
      this.universe.provider
    ))
    const out = planner.add(lib.redeem(inputs[0], nonce))
    return [out!]
  }
  gasEstimate() {
    return BigInt(600000n)
  }
  async encode([quantity]: TokenQuantity[], destination: Address): Promise<ContractCall> {
    const nonce = this.basketHandler.basketNonce
    return new ContractCall(
      parseHexStringIntoBuffer(
        rTokenIFace.encodeFunctionData('redeem', [quantity.amount])
      ),
      this.basketHandler.rToken.address,
      0n,
      this.gasEstimate(),
      `Burn RToken(${this.output.join(",")},input:${quantity},destination: ${destination})`
    )
  }

  async quote([quantity]: TokenQuantity[]): Promise<TokenQuantity[]> {
    await this.universe.refresh(this.address)
    return await this.basketHandler.redeem(quantity)
  }

  constructor(readonly universe: Universe, readonly basketHandler: IBasket) {
    super(
      basketHandler.rToken.address,
      [basketHandler.rToken],
      basketHandler.basketTokens,
      InteractionConvention.None,
      DestinationOptions.Callee,
      []
    )
  }

  toString(): string {
    return `RTokenBurn(${this.basketHandler.rToken.toString()})`
  }
}
