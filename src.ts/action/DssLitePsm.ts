import { Universe } from '../Universe'
import {
  BaseAction,
  DestinationOptions,
  InteractionConvention,
} from '../action/Action'
import { Address } from '../base/Address'
import { Approval } from '../base/Approval'
import { IDssLitePsm__factory } from '../contracts'
import { Token, TokenQuantity } from '../entities/Token'
import { Contract, Planner, Value } from '../tx-gen/Planner'

export class DssLitePsm extends BaseAction {
  public get protocol(): string {
    return 'DssLitePsm'
  }
  public get isTrade() {
    return false
  }
  public get oneInput() {
    return false
  }
  constructor(
    public readonly universe: Universe,
    addr: Address,
    public readonly input: Token,
    public readonly output: Token,
    public readonly rate: (input: bigint) => Promise<bigint>
  ) {
    super(
      addr,
      [input],
      [output],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Recipient,
      [new Approval(input, addr)]
    )
  }

  async quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]> {
    const input = amountsIn[0]
    const output = await this.rate(input.amount)
    return [this.output.from(output)]
  }
  gasEstimate(): bigint {
    return 85000n
  }
  async plan(
    planner: Planner,
    inputs: Value[],
    destination: Address,
    predictedInputs: TokenQuantity[]
  ): Promise<null | Value[]> {
    const contract = IDssLitePsm__factory.connect(
      this.address.address,
      this.universe.provider
    )
    const input = predictedInputs[0]
    const output = await this.rate(input.amount)
    const lib = Contract.createContract(contract)

    return [planner.add(lib.sellGem(destination.address, input.amount))!]
  }
}
