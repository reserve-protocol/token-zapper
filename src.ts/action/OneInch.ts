import { Address } from '../base/Address'
import { type Token, type TokenQuantity } from '../entities/Token'
import { type Universe } from '../Universe'
import { DestinationOptions, Action, InteractionConvention } from './Action'
import { ContractCall } from '../base/ContractCall'
import { Approval } from '../base/Approval'
import { type OneInchSwapResponse } from '../aggregators/oneInch/oneInchRegistry'
import { parseHexStringIntoBuffer } from '../base/utils'

// OneInch actions should only be dynamically generated by the Searcher and not be added to the exchange-graph
export class OneInchAction extends Action {
  gasEstimate() {
    return BigInt(this.actionQuote.tx.gas)
  }
  async encode(): Promise<ContractCall> {
    const swap = this.actionQuote
    if (swap == null) {
      throw new Error('Failed to generate swap')
    }
    return new ContractCall(
      parseHexStringIntoBuffer(swap.tx.data),
      Address.fromHexString(swap.tx.to),
      BigInt(swap.tx.value),
      this.gasEstimate(),
      `1Inch Swap (${this.input.join(",")}) -> (${this.output[0].from(BigInt(this.actionQuote.toAmount))})`
    )
  }

  toString() {
    return `OneInch(path=[...])`
  }

  private readonly outputQty: TokenQuantity
  async quote(_: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [this.outputQty]
  }

  private constructor(
    readonly universe: Universe,
    inputToken: Token,
    private readonly outputToken: Token,
    private readonly actionQuote: OneInchSwapResponse,
    slippagePercent: number
  ) {
    super(
      Address.fromHexString(actionQuote.tx.to),
      [inputToken],
      [outputToken],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Recipient,
      [new Approval(inputToken, Address.fromHexString(actionQuote.tx.to))]
    )
    this.outputQty = this.outputToken
      .fromBigInt(BigInt(this.actionQuote.toAmount))
      .mul(outputToken.fromDecimal((100 - slippagePercent) / 100))
  }

  static createAction(
    universe: Universe,
    input: Token,
    output: Token,
    quote: OneInchSwapResponse,
    slippagePercent: number
  ) {
    return new OneInchAction(universe, input, output, quote, slippagePercent)
  }
}
