import { Address } from '../base/Address'
import { Approval } from '../base/Approval'
import { Comet, CometWrapper } from '../configuration/setupCompV3'
import { TokenQuantity, type Token } from '../entities/Token'
import { Planner, Value } from '../tx-gen/Planner'
import { Action, InteractionConvention, DestinationOptions } from './Action'

export abstract class BaseCometAction extends Action('CompV3') {
  public get outputSlippage(): bigint {
    return 0n
  }
  get returnsOutput() {
    return false
  }
  toString(): string {
    return `${this.protocol}.${this.actionName}(${this.inputToken.join(
      ', '
    )} -> ${this.outputToken.join(', ')})`
  }
  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [
      this.outputToken[0].from(amountsIn.into(this.outputToken[0]).amount - 1n),
    ]
  }
  get receiptToken() {
    return this.outputToken[0]
  }
  get universe() {
    return this.comet.universe
  }

  gasEstimate() {
    return BigInt(250000n)
  }
  get actionName() {
    return this.actionName_
  }
  constructor(
    public readonly mainAddress: Address,
    public readonly comet: Comet,
    private readonly actionName_: string,
    opts: {
      inputToken: Token[]
      outputToken: Token[]
      interaction: InteractionConvention
      destination: DestinationOptions
      approvals: Approval[]
    }
  ) {
    super(
      mainAddress,
      opts.inputToken,
      opts.outputToken,
      opts.interaction,
      opts.destination,
      opts.approvals
    )
  }
  async plan(
    planner: Planner,
    [input]: Value[],
    destination: Address,
    [predicted]: TokenQuantity[]
  ) {
    this.planAction(planner, destination, input, predicted)
    return null
  }
  abstract planAction(
    planner: Planner,
    destination: Address,
    input: Value,
    predicted: TokenQuantity
  ): void
}
export class MintCometAction extends BaseCometAction {
  constructor(comet: Comet) {
    super(comet.comet.address, comet, 'supply', {
      inputToken: [comet.borrowToken],
      outputToken: [comet.comet],
      interaction: InteractionConvention.ApprovalRequired,
      destination: DestinationOptions.Callee,
      approvals: [new Approval(comet.borrowToken, comet.comet.address)],
    })
  }
  planAction(
    planner: Planner,
    destination: Address,
    input: Value | null,
    predicted: TokenQuantity
  ) {
    planner.add(
      this.comet.cometLibrary.supplyTo(
        destination.address,
        this.comet.borrowToken.address.address,
        input ?? predicted.amount
      )
    )
  }
}
export class MintCometWrapperAction extends BaseCometAction {
  constructor(
    public readonly cometWrapper: CometWrapper,
    public readonly mintRate: () => Promise<TokenQuantity>
  ) {
    super(cometWrapper.wrapperToken.address, cometWrapper.comet, 'deposit', {
      inputToken: [cometWrapper.cometToken],
      outputToken: [cometWrapper.wrapperToken],
      interaction: InteractionConvention.ApprovalRequired,
      destination: DestinationOptions.Callee,
      approvals: [
        new Approval(
          cometWrapper.cometToken,
          cometWrapper.wrapperToken.address
        ),
      ],
    })
  }

  toString(): string {
    return `CometWrapper.${this.actionName}(${this.inputToken.join(
      ', '
    )} -> ${this.outputToken.join(', ')})`
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    const out = (await this.mintRate()).mul(amountsIn).into(this.outputToken[0])
    return [out]
  }

  planAction(
    planner: Planner,
    _: Address,
    input: Value | null,
    predicted: TokenQuantity
  ) {
    planner.add(
      this.cometWrapper.cometWrapperLibrary.deposit(input ?? predicted.amount)
    )
  }
}
export class BurnCometAction extends BaseCometAction {
  constructor(comet: Comet) {
    super(comet.comet.address, comet, 'burn', {
      inputToken: [comet.comet],
      outputToken: [comet.borrowToken],
      interaction: InteractionConvention.None,
      destination: DestinationOptions.Callee,
      approvals: [],
    })
  }
  planAction(
    planner: Planner,
    destination: Address,
    input: Value | null,
    predicted: TokenQuantity
  ) {
    planner.add(
      this.comet.cometLibrary.withdraw(
        this.comet.borrowToken.address.address,
        input ?? predicted.amount
      )
    )
  }
}
export class BurnCometWrapperAction extends BaseCometAction {
  constructor(
    public readonly cometWrapper: CometWrapper,
    public readonly burnRate: () => Promise<TokenQuantity>
  ) {
    super(cometWrapper.wrapperToken.address, cometWrapper.comet, 'withdraw', {
      inputToken: [cometWrapper.wrapperToken],
      outputToken: [cometWrapper.cometToken],
      interaction: InteractionConvention.None,
      destination: DestinationOptions.Callee,
      approvals: [],
    })
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    const out = (await this.burnRate()).mul(amountsIn).into(this.outputToken[0])
    return [out]
  }

  planAction(
    planner: Planner,
    _: Address,
    input: Value | null,
    predicted: TokenQuantity
  ) {
    const amt = planner.add(
      this.cometWrapper.cometWrapperLibrary.convertStaticToDynamic(
        input ?? predicted.amount
      )
    )

    planner.add(this.cometWrapper.cometWrapperLibrary.withdraw(amt))
  }
}
