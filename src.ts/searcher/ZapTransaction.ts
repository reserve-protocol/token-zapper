import { ethers } from 'ethers';
import { type TokenQuantity } from '../entities/Token';
import { type Universe } from '../Universe';
import { ZapERC20ParamsStruct } from '../contracts/contracts/IZapper.sol/IZapper';
import { SearcherResult } from './SearcherResult';


export class ZapTransaction {
  constructor(
    private readonly universe: Universe,
    public readonly params: ZapERC20ParamsStruct,
    public readonly tx: ethers.providers.TransactionRequest,
    public readonly gas: bigint,
    public readonly input: TokenQuantity,
    public readonly output: TokenQuantity[],
    public readonly result: SearcherResult
  ) { }

  get fee() {
    return this.universe.nativeToken.quantityFromBigInt(
      this.universe.gasPrice * this.gas
    );
  }

  toString() {
    return `ZapTransaction(input:${this.input.formatWithSymbol()},outputs:[${this.output
      .map((i) => i.formatWithSymbol())
      .join(', ')}],txFee:${this.fee.formatWithSymbol()})`;
  }
}
