import { type Universe } from '../Universe'
import { type Address } from '../base/Address'
import { Approval } from '../base/Approval'
import { ContractCall } from '../base/ContractCall'
import { parseHexStringIntoBuffer } from '../base/utils'
import { CTokenWrapper__factory } from '../contracts/factories/contracts/ICToken.sol/CTokenWrapper__factory'
import { type Token, type TokenQuantity } from '../entities/Token'
import { Planner, Value } from '../tx-gen/Planner'
import { Action, DestinationOptions, InteractionConvention } from './Action'

const iCTokenWrapper = CTokenWrapper__factory.createInterface()

export class MintCTokenWrapperAction extends Action {
  async plan(
    planner: Planner,
    inputs: Value[],
    destination: Address
  ): Promise<Value[]> {
    const lib = this.gen.Contract.createLibrary(
      CTokenWrapper__factory.connect(
        this.receiptToken.address.address,
        this.universe.provider
      )
    )
    planner.add(lib.deposit(inputs[0], destination.address))!
    const out = this.genUtils.erc20.balanceOf(
      this.universe,
      planner,
      this.output[0],
      destination
    )
    return [out!]
  }
  gasEstimate() {
    return BigInt(110000n)
  }
  async encode(
    [amountsIn]: TokenQuantity[],
    dest: Address
  ): Promise<ContractCall> {
    return new ContractCall(
      parseHexStringIntoBuffer(
        iCTokenWrapper.encodeFunctionData('deposit', [
          amountsIn.amount,
          dest.address,
        ])
      ),
      this.receiptToken.address,
      0n,
      this.gasEstimate(),
      'CompoundV2Wrapper mint ' + this.receiptToken.symbol
    )
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [this.receiptToken.from(amountsIn.amount)]
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
    return `CompoundV2WrapperMint(${this.receiptToken.toString()})`
  }
}

export class BurnCTokenWrapperAction extends Action {
  async plan(
    planner: Planner,
    inputs: Value[],
    destination: Address
  ): Promise<Value[]> {
    const lib = this.gen.Contract.createLibrary(
      CTokenWrapper__factory.connect(
        this.receiptToken.address.address,
        this.universe.provider
      )
    )
    planner.add(lib.withdraw(inputs[0], destination.address))!
    const out = this.genUtils.erc20.balanceOf(
      this.universe,
      planner,
      this.output[0],
      destination
    )
    return [out!]
  }
  gasEstimate() {
    return BigInt(110000n)
  }

  async encode(
    [amountsIn]: TokenQuantity[],
    dest: Address
  ): Promise<ContractCall> {
    return new ContractCall(
      parseHexStringIntoBuffer(
        iCTokenWrapper.encodeFunctionData('withdraw', [
          amountsIn.amount,
          dest.address,
        ])
      ),
      this.receiptToken.address,
      0n,
      this.gasEstimate(),
      'CompoundV2Wrapper burn ' + this.receiptToken.symbol
    )
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [this.baseToken.from(amountsIn.amount)]
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
    return `CompoundV2WrapperBurn(${this.receiptToken.toString()})`
  }
}
