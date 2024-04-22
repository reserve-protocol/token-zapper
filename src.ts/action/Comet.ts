import { type Universe } from '../Universe'
import { type Address } from '../base/Address'
import { Approval } from '../base/Approval'
import { Comet__factory } from '../contracts/factories/contracts/Compv3.sol/Comet__factory'
import { type Token, type TokenQuantity } from '../entities/Token'
import { Planner, Value } from '../tx-gen/Planner'
import { Action, DestinationOptions, InteractionConvention } from './Action'

export class MintCometAction extends Action {
  async plan(
    planner: Planner,
    inputs: Value[],
    destination: Address,
    predicted: TokenQuantity[]
  ): Promise<Value[]> {
    const lib = this.gen.Contract.createContract(
      Comet__factory.connect(
        this.receiptToken.address.address,
        this.universe.provider
      )
    )
    planner.add(
      lib.supply(this.baseToken.address.address, inputs[0]),
      `Comet mint: ${predicted.join(', ')} -> ${await this.quote(predicted)}`
    )
    const out = this.genUtils.erc20.balanceOf(
      this.universe,
      planner,
      this.output[0],
      destination
    )
    return [out!]
  }
  gasEstimate() {
    return BigInt(110000n)
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [this.receiptToken.from(amountsIn.amount)]
  }

  constructor(
    readonly universe: Universe,
    readonly baseToken: Token,
    readonly receiptToken: Token
  ) {
    super(
      receiptToken.address,
      [baseToken],
      [receiptToken],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Callee,
      [new Approval(baseToken, receiptToken.address)]
    )
  }
  toString(): string {
    return `CompoundV3Mint(${this.receiptToken.toString()})`
  }
}

export class BurnCometAction extends Action {
  async plan(
    planner: Planner,
    inputs: Value[],
    destination: Address,
    predicted: TokenQuantity[]
  ): Promise<Value[]> {
    const lib = this.gen.Contract.createContract(
      Comet__factory.connect(
        this.receiptToken.address.address,
        this.universe.provider
      )
    )
    planner.add(
      lib.withdrawTo(
        destination.address,
        this.baseToken.address.address,
        inputs[0]
      ),
      `Comet burn: ${predicted.join(', ')} -> ${await this.quote(predicted)}`
    )
    const out = this.genUtils.erc20.balanceOf(
      this.universe,
      planner,
      this.output[0],
      destination
    )
    return [out!]
  }
  gasEstimate() {
    return BigInt(110000n)
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [this.baseToken.from(amountsIn.amount)]
  }

  constructor(
    readonly universe: Universe,
    readonly baseToken: Token,
    readonly receiptToken: Token
  ) {
    super(
      receiptToken.address,
      [receiptToken],
      [baseToken],
      InteractionConvention.None,
      DestinationOptions.Recipient,
      []
    )
  }
  toString(): string {
    return `CommetWithdraw(${this.receiptToken.toString()})`
  }
}
