import { Transaction } from "paraswap";
import { TokenQuantity, Address, Universe } from "..";
import { ContractCall } from "../base/ContractCall";
import { Action, DestinationOptions, InteractionConvention } from "./Action";
import { Approval } from "../base/Approval";
import { parseHexStringIntoBuffer } from "../base/utils";


export class ParaswapAction extends Action {
  constructor(
    public readonly universe: Universe,
    public readonly tx: Transaction,
    input: TokenQuantity,
    public readonly outputQuantity: TokenQuantity
  ) {
    super(
      Address.from(tx.to),
      [input.token],
      [outputQuantity.token],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Recipient,
      [new Approval(input.token, Address.from(tx.to))]
    )
  }

  async quote(_: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [this.outputQuantity]
  }
  gasEstimate(): bigint {
    return 200_000n
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