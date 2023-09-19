
import { type Universe } from '../Universe'
import { type Address } from '../base/Address'
import { Approval } from '../base/Approval'
import { ContractCall } from '../base/ContractCall'
import { parseHexStringIntoBuffer } from '../base/utils'
import { type Token, type TokenQuantity } from '../entities/Token'
import { Action, DestinationOptions, InteractionConvention } from './Action'

import { WrappedComet__factory } from '../contracts/factories/Compv3.sol/WrappedComet__factory'
const iWrappedCometInterface = WrappedComet__factory.createInterface()


export class MintCometWrapperAction extends Action {
  gasEstimate() {
    return BigInt(110000n)
  }
  async encode([amountsIn]: TokenQuantity[]): Promise<ContractCall> {
    return new ContractCall(
      parseHexStringIntoBuffer(
        iWrappedCometInterface.encodeFunctionData('deposit', [
          amountsIn.amount,
        ])
      ),
      this.receiptToken.address,
      0n,
      this.gasEstimate(),
      'CompoundV3Wrapper mint ' + this.receiptToken.symbol
    )
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    const rate = await this.getRate()
    const amountOut = (amountsIn.amount * amountsIn.token.one.amount) / rate
    return [
      this.receiptToken.from(amountOut)
    ]
  }

  constructor(
    readonly universe: Universe,
    readonly baseToken: Token,
    readonly receiptToken: Token,
    readonly getRate: () => Promise<bigint>
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
    return `CompoundV3WrapperMint(${this.receiptToken.toString()})`
  }
}

export class BurnCometWrapperAction extends Action {
  gasEstimate() {
    return BigInt(110000n)
  }

  async encode([amountsIn]: TokenQuantity[], dest: Address): Promise<ContractCall> {
    return new ContractCall(
      parseHexStringIntoBuffer(
        iWrappedCometInterface.encodeFunctionData('withdrawTo', [
            dest.address,
            amountsIn.amount,
        ])
      ),
      this.receiptToken.address,
      0n,
      this.gasEstimate(),
      'CompoundV3Wrapper burn ' + this.receiptToken.symbol
    )
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    const rate = await this.getRate()
    const amountOut = (amountsIn.amount * rate) / amountsIn.token.one.amount
    return [
      this.baseToken.from(amountOut)
    ]
  }

  constructor(
    readonly universe: Universe,
    readonly baseToken: Token,
    readonly receiptToken: Token,
    readonly getRate: () => Promise<bigint>
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
