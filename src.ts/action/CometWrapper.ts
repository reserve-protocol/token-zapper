import { type Universe } from '../Universe'
import { type Address } from '../base/Address'
import { Approval } from '../base/Approval'
import { ContractCall } from '../base/ContractCall'
import { parseHexStringIntoBuffer } from '../base/utils'
import { WrappedComet__factory } from '../contracts/factories/contracts/Compv3.sol/WrappedComet__factory'
import { type Token, type TokenQuantity } from '../entities/Token'
import { Action, DestinationOptions, InteractionConvention } from './Action'

const iWrappedCometInterface = WrappedComet__factory.createInterface()

export class MintCometWrapperAction extends Action {
  gasEstimate() {
    return BigInt(110000n)
  }
  async encode(
    [amountsIn]: TokenQuantity[],
    dest: Address
  ): Promise<ContractCall> {
    return new ContractCall(
      parseHexStringIntoBuffer(
        iWrappedCometInterface.encodeFunctionData('deposit', [amountsIn.amount])
      ),
      this.receiptToken.address,
      0n,
      this.gasEstimate(),
      'CompoundV3Wrapper mint ' + this.receiptToken.symbol
    )
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [
      this.receiptToken.from(
        await WrappedComet__factory.connect(
          this.receiptToken.address.address,
          this.universe.provider
        ).convertDynamicToStatic(amountsIn.amount)
      ),
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

  get outputSlippage() {
    return 3000000n
  }
}

export class BurnCometWrapperAction extends Action {
  gasEstimate() {
    return BigInt(110000n)
  }

  async encode(
    [amountsIn]: TokenQuantity[],
    dest: Address
  ): Promise<ContractCall> {
    const [withdrawalAmount] = await this.quote([amountsIn])
    return new ContractCall(
      parseHexStringIntoBuffer(
        iWrappedCometInterface.encodeFunctionData('withdrawTo', [
          dest.address,
          withdrawalAmount.amount,
        ])
      ),
      this.receiptToken.address,
      0n,
      this.gasEstimate(),
      'CompoundV3Wrapper burn ' + this.receiptToken.symbol
    )
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [
      this.baseToken.from(
        await WrappedComet__factory.connect(
          this.receiptToken.address.address,
          this.universe.provider
        ).convertStaticToDynamic(amountsIn.amount)
      ),
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
  get outputSlippage() {
    return 300000n
  }
}
