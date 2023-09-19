
import { type Universe } from '../Universe'
import { type Address } from '../base/Address'
import { Approval } from '../base/Approval'
import { ContractCall } from '../base/ContractCall'
import { parseHexStringIntoBuffer } from '../base/utils'
import { Comet__factory } from '../contracts/factories/Compv3.sol/Comet__factory'
import { type Token, type TokenQuantity } from '../entities/Token'
import { Action, DestinationOptions, InteractionConvention } from './Action'

const iCometInterface = Comet__factory.createInterface()

export class MintCometAction extends Action {
  gasEstimate() {
    return BigInt(110000n)
  }
  async encode([amountsIn]: TokenQuantity[]): Promise<ContractCall> {
    return new ContractCall(
      parseHexStringIntoBuffer(
        iCometInterface.encodeFunctionData('supply', [
          this.baseToken.address.address,
          amountsIn.amount,
        ])
      ),
      this.receiptToken.address,
      0n,
      this.gasEstimate(),
      'CompoundV3 mint ' + this.receiptToken.symbol
    )
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [
      this.receiptToken.from(amountsIn.amount)
    ]
  }

  constructor(
    readonly universe: Universe,
    readonly baseToken: Token,
    readonly receiptToken: Token
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
    return `CompoundV3Mint(${this.receiptToken.toString()})`
  }
}

export class BurnCometAction extends Action {
  gasEstimate() {
    return BigInt(110000n)
  }

  async encode([amountsIn]: TokenQuantity[], dest: Address): Promise<ContractCall> {
    return new ContractCall(
      parseHexStringIntoBuffer(
        iCometInterface.encodeFunctionData('withdrawTo', [
          dest.address,
          this.baseToken.address.address,
          amountsIn.amount,
        ])
      ),
      this.receiptToken.address,
      0n,
      this.gasEstimate(),
      'CompoundV3 burn ' + this.receiptToken.symbol
    )
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [
      this.baseToken.from(amountsIn.amount)
    ]
  }

  constructor(
    readonly universe: Universe,
    readonly baseToken: Token,
    readonly receiptToken: Token
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
}
