import { type TransactionRequest } from "@ethersproject/providers";
import { type TokenQuantity } from '../entities/Token';
import { type ZapERC20ParamsStruct } from "../contracts/IZapper.sol/IZapper";

export class ZapTransaction {
  constructor(
    public readonly params: ZapERC20ParamsStruct,
    public readonly tx: Omit<TransactionRequest, "gas">,
    public readonly gasEstimate: bigint,
    public readonly input: TokenQuantity,
    public readonly output: TokenQuantity[],
  ) { }

  feeEstimate(gasPrice: bigint) {
    return gasPrice * this.gasEstimate
  }

  toString() {
    return `ZapTransaction(input:${this.input.formatWithSymbol()},outputs:[${this.output
      .map((i) => i.formatWithSymbol())
      .join(', ')}])`;
  }
}
