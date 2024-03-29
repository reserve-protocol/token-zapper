import { ParamType } from '@ethersproject/abi'
import { type Universe } from '../Universe'
import { type Address } from '../base/Address'
import { Approval } from '../base/Approval'
import { ContractCall } from '../base/ContractCall'
import { parseHexStringIntoBuffer } from '../base/utils'
import { WrappedComet__factory } from '../contracts/factories/contracts/Compv3.sol/WrappedComet__factory'
import { type Token, type TokenQuantity } from '../entities/Token'
import { Planner, Value } from '../tx-gen/Planner'
import { Action, DestinationOptions, InteractionConvention } from './Action'

const iWrappedCometInterface = WrappedComet__factory.createInterface()

export class MintCometWrapperAction extends Action {
  async plan(
    planner: Planner,
    inputs: Value[],
    destination: Address
  ): Promise<Value[]> {
    const lib = this.gen.Contract.createContract(
      WrappedComet__factory.connect(
        this.receiptToken.address.address,
        this.universe.provider
      )
    )
    planner.add(lib.deposit(inputs[0]))
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
    return 1000000n
  }
}

export class BurnCometWrapperAction extends Action {
  async plan(
    planner: Planner,
    inputs: Value[],
    destination: Address
  ): Promise<Value[]> {
    const lib = this.gen.Contract.createContract(
      WrappedComet__factory.connect(
        this.receiptToken.address.address,
        this.universe.provider
      )
    )
    const amount = planner.add(lib.convertStaticToDynamic(inputs[0]))
    planner.add(lib.withdrawTo(destination.address, amount))

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
      DestinationOptions.Callee,
      []
    )
  }
  toString(): string {
    return `CompoundV3Burn(${this.receiptToken.toString()})`
  }
  get outputSlippage() {
    return 1500000n
  }
}
