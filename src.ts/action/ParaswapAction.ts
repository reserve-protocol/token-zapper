import { Transaction } from "paraswap";
import { Address, TokenQuantity, Universe } from "..";
import { Approval } from "../base/Approval";
import { ContractCall } from "../base/ContractCall";
import { parseHexStringIntoBuffer } from "../base/utils";
import { Action, DestinationOptions, InteractionConvention } from "./Action";


export class ParaswapAction extends Action {
  constructor(
    public readonly universe: Universe,
    public readonly tx: Transaction,
    public readonly inputQuantity: TokenQuantity,
    public readonly outputQuantity: TokenQuantity
  ) {
    super(
      Address.from(tx.to),
      [inputQuantity.token],
      [outputQuantity.token],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Recipient,
      [new Approval(inputQuantity.token, Address.from(tx.to))]
    )
  }

  async quote(_: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [this.outputQuantity]
  }
  gasEstimate(): bigint {
    return 200_000n
  }

  toString() {
    return `ParaswapAction(${this.inputQuantity} => ${this.outputQuantity})`
  }

  async encode(amountsIn: TokenQuantity[], destination: Address, bytes?: Buffer | undefined): Promise<ContractCall> {
    return new ContractCall(
      parseHexStringIntoBuffer(this.tx.data),
      Address.from(this.tx.to),
      BigInt(this.tx.value),
      this.gasEstimate(),
      "Swap (Paraswap)"
    )
  }

  static createAction(
    universe: Universe,
    input: TokenQuantity,
    output: TokenQuantity,
    tx: Transaction
  ) {
    return new ParaswapAction(universe, tx, input, output)
  }
}