import { type Universe } from '../Universe'
import { Address } from '../base/Address'
import { numberOfUnits, type TokenQuantity } from '../entities/Token'
import { TokenAmounts } from '../entities/TokenAmounts'
import { Action, DestinationOptions, InteractionConvention } from './Action'

import { Approval } from '../base/Approval'
import { IRToken__factory } from '../contracts'
import { IBasket } from '../entities/TokenBasket'
import { Planner, Value } from '../tx-gen/Planner'

export class MintRTokenAction extends Action {
  async plan(planner: Planner, inputs: Value[], destination: Address) {
    const lib = this.gen.Contract.createContract(
      IRToken__factory.connect(
        this.inputToken[0].address.address,
        this.universe.provider
      )
    )
    const out = planner.add(lib.issueTo(inputs[0], destination.address))
    return [out!]
  }
  gasEstimate() {
    return BigInt(600000n)
  }

  get outputSlippage() {
    return 3000000n
  }
  async quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]> {
    await this.universe.refresh(this.address)
    if (amountsIn.length !== this.inputToken.length) {
      throw new Error('Invalid inputs for RToken mint')
    }
    const unitsRequested = numberOfUnits(amountsIn, this.basket.unitBasket)
    return [this.basket.rToken.fromBigInt(unitsRequested)]
  }

  async exchange(input: TokenQuantity[], balances: TokenAmounts) {
    const outputs = await this.quote(input)
    const inputsConsumed = this.basket.unitBasket.map((qty) =>
      outputs[0].into(qty.token).mul(qty)
    )
    balances.exchange(inputsConsumed, outputs)
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
    return 300000n
  }
  async plan(
    planner: Planner,
    inputs: Value[],
    destination: Address,
    predicted: TokenQuantity[]
  ) {
    const lib = this.gen.Contract.createContract(
      IRToken__factory.connect(
        this.inputToken[0].address.address,
        this.universe.provider
      )
    )

    planner.add(
      lib.redeem(inputs[0]),
      `RToken burn: ${predicted.join(', ')} -> ${(
        await this.quote(predicted)
      ).join(', ')}`
    )

    return this.outputToken.map((token) =>
      this.genUtils.erc20.balanceOf(
        this.universe,
        planner,
        token,
        this.universe.config.addresses.executorAddress
      )
    )
  }
  gasEstimate() {
    return BigInt(600000n)
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
