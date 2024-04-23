import { type Universe } from '../Universe'
import { type Address } from '../base/Address'
import { Approval } from '../base/Approval'
import { WrappedComet__factory } from '../contracts/factories/contracts/Compv3.sol/WrappedComet__factory'
import { type Token, type TokenQuantity } from '../entities/Token'
import { Planner, Value } from '../tx-gen/Planner'
import { Action, DestinationOptions, InteractionConvention } from './Action'

export class MintCometWrapperAction extends Action {
  async plan(
    planner: Planner,
    inputs: Value[],
    destination: Address,
    predicted: TokenQuantity[]
  ): Promise<Value[]> {
    const lib = this.gen.Contract.createContract(
      WrappedComet__factory.connect(
        this.receiptToken.address.address,
        this.universe.provider
      )
    )
    planner.add(
      lib.deposit(inputs[0]),
      `CometWrapper mint: ${predicted.join(', ')} -> ${await this.quote(
        predicted
      )}`
    )
    const out = this.genUtils.erc20.balanceOf(
      this.universe,
      planner,
      this.outputToken[0],
      destination
    )
    return [out!]
  }
  gasEstimate() {
    return BigInt(110000n)
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [
      this.receiptToken.from(
        await WrappedComet__factory.connect(
          this.receiptToken.address.address,
          this.universe.provider
        ).convertDynamicToStatic(amountsIn.amount)
      ),
    ]
  }

  constructor(
    readonly universe: Universe,
    readonly baseToken: Token,
    readonly receiptToken: Token,
    readonly getRate: () => Promise<bigint>
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
    return `CompoundV3WrapperMint(${this.receiptToken.toString()})`
  }

  get outputSlippage() {
    return 1000000n
  }
}

export class BurnCometWrapperAction extends Action {
  async plan(
    planner: Planner,
    inputs: Value[],
    destination: Address,
    predicted: TokenQuantity[]
  ): Promise<Value[]> {
    const lib = this.gen.Contract.createContract(
      WrappedComet__factory.connect(
        this.receiptToken.address.address,
        this.universe.provider
      )
    )
    const amount = planner.add(lib.convertStaticToDynamic(inputs[0]))
    planner.add(
      lib.withdrawTo(destination.address, amount),
      `CometWrapper burn: ${predicted.join(', ')} -> ${await this.quote(
        predicted
      )}`
    )

    const out = this.genUtils.erc20.balanceOf(
      this.universe,
      planner,
      this.outputToken[0],
      destination
    )
    return [out!]
  }
  gasEstimate() {
    return BigInt(110000n)
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [
      this.baseToken.from(
        await WrappedComet__factory.connect(
          this.receiptToken.address.address,
          this.universe.provider
        ).convertStaticToDynamic(amountsIn.amount)
      ),
    ]
  }

  constructor(
    readonly universe: Universe,
    readonly baseToken: Token,
    readonly receiptToken: Token,
    readonly getRate: () => Promise<bigint>
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
    return `CompoundV3Burn(${this.receiptToken.toString()})`
  }
  get outputSlippage() {
    return 1500000n
  }
}
