import { formatUnits } from 'ethers/lib/utils'
import { Address } from '../base/Address'
import { Approval } from '../base/Approval'
import { PricedTokenQuantity, TokenQuantity } from '../entities/Token'
import { Universe } from '../Universe'
import { Action, DestinationOptions, InteractionConvention } from './Action'

const calculateInputProportion = ({ unit, basket }: MultiInputUnit) => {
  return basket.map((input) => {
    const inputToken = input.quantity.token
    return input.price.into(inputToken).div(unit.price.into(inputToken))
  })
}

export class MultiInputUnit {
  public readonly proportions: TokenQuantity[]

  public get inputTokens() {
    return this.basket.map((i) => i.quantity.token)
  }
  public get outputTokens() {
    return [this.unit.quantity.token]
  }
  constructor(
    public readonly unit: PricedTokenQuantity,
    public readonly basket: PricedTokenQuantity[]
  ) {
    this.proportions = calculateInputProportion(this)
  }

  toString() {
    return `Proportions(${this.proportions.map(
      (i) =>
        `${formatUnits((i.amount / (i.token.scale / 100n)) * 100n, 2)}% ${
          i.token.symbol
        }`
    )} pr ${this.unit.quantity.token.symbol})`
  }
}

export const createMultiInputAction = async (
  protocol: string,
  universe: Universe,
  unitGetter: () => Promise<MultiInputUnit>
) => {
  const getUnit = universe.createCachedProducer(async () => {
    const unit = await unitGetter()
    return unit
  }, 12000)
  const unit = await getUnit()
  abstract class MultiInputAction extends Action(protocol) {
    public async inputProportions() {
      return (await getUnit()).proportions
    }

    constructor(
      address: Address,
      public readonly universe: Universe,
      public readonly destinationOptions: DestinationOptions,
      public readonly approvalAddress: Address
    ) {
      super(
        address,
        unit.inputTokens,
        unit.outputTokens,
        InteractionConvention.ApprovalRequired,
        destinationOptions,
        unit.inputTokens.map((input) => new Approval(input, approvalAddress))
      )
    }
  }
  return MultiInputAction
}
