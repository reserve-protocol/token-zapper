import { type TransactionRequest } from '@ethersproject/providers'
import { type TokenQuantity } from '../entities/Token'
import { type ZapERC20ParamsStruct } from '../contracts/contracts/Zapper.sol/Zapper'
import { printPlan, Planner } from '../tx-gen/Planner'
import { Universe } from '..'

export class ZapTransaction {
  constructor(
    public readonly universe: Universe,
    public readonly params: ZapERC20ParamsStruct,
    public readonly tx: Omit<TransactionRequest, 'gas'>,
    public readonly gasEstimate: bigint,
    public readonly input: TokenQuantity,
    public readonly output: TokenQuantity[],
    public readonly planner: Planner
  ) {}

  describe() {
    return [
      'Transaction {',
      '  Commands: [',
      ...printPlan(this.planner, this.universe).map((c) => '   ' + c),
      '  ],',
      `  input: ${this.input}`,
      `  gas: ${this.gasEstimate}`,
      `  fee: ${this.universe.nativeToken.from(
        this.universe.gasPrice * this.gasEstimate
      )}`,
      `  outputs: ${this.output.join(', ')}`,
      '}',
    ]
  }

  feeEstimate(gasPrice: bigint) {
    return gasPrice * this.gasEstimate
  }

  toString() {
    return `ZapTransaction(input:${this.input.formatWithSymbol()},outputs:[${this.output
      .map((i) => i.formatWithSymbol())
      .join(', ')}])`
  }
}
