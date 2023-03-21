import { type Address } from '../base/Address'
import { TokenAmounts, type Token, type TokenQuantity } from '../entities/Token'
import { type Approval } from '../base/Approval'
import { type ContractCall } from '../base/ContractCall'

export enum InteractionConvention {
  PayBeforeCall,
  CallbackBased,
  ApprovalRequired,
  None,
}

export enum DestinationOptions {
  Recipient,
  Callee,
}

export abstract class Action {
  constructor(
    public readonly address: Address,
    public readonly input: readonly Token[],
    public readonly output: readonly Token[],
    public readonly interactionConvention: InteractionConvention,
    public readonly proceedsOptions: DestinationOptions,
    public readonly approvals: readonly Approval[]
  ) {}

  abstract quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>
  async exchange(amountsIn: TokenQuantity[], balances: TokenAmounts) {
    const outputs = await this.quote(amountsIn)
    balances.exchange(amountsIn, outputs)
  }
  abstract encode(
    amountsIn: TokenQuantity[],
    destination: Address,
    bytes?: Buffer
  ): Promise<ContractCall>

  toString() {
    return 'Action'
  }
}
