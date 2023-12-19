import { type Token, type TokenQuantity } from '../entities/Token'
import { type Universe } from '../Universe'
import { parseHexStringIntoBuffer } from '../base/utils'
import { InteractionConvention, DestinationOptions, Action } from './Action'
import { ContractCall } from '../base/ContractCall'
import { IWrappedNative__factory } from '../contracts/factories/contracts/IWrappedNative__factory'
import * as gen from '../tx-gen/Planner'
import { Address } from '..'

const iWrappedNativeIFace = IWrappedNative__factory.createInterface()

export class DepositAction extends Action {
  
  gasEstimate(): bigint {
    return 25000n
  }
  async encode([amountsIn]: TokenQuantity[]): Promise<ContractCall> {
    return new ContractCall(
      parseHexStringIntoBuffer(
        iWrappedNativeIFace.encodeFunctionData('deposit')
      ),
      this.wrappedToken.address,
      amountsIn.amount,
      this.gasEstimate(),
      'Wrap Native Token'
    )
  }
  async plan(planner: gen.Planner, inputs: gen.Value[], destination: Address) {
    const wethlib = gen.Contract.createContract(IWrappedNative__factory.connect(
      this.wrappedToken.address.address,
      this.universe.provider
    ))
    planner.add(wethlib.deposit({ value: inputs[0] }))
    return [inputs[0]]
  }

  async quote([qty]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [qty.into(this.wrappedToken)]
  }

  constructor(readonly universe: Universe, readonly wrappedToken: Token) {
    super(
      wrappedToken.address,
      [universe.nativeToken],
      [wrappedToken],
      InteractionConvention.None,
      DestinationOptions.Callee,
      []
    )
  }

  toString(): string {
    return `Wrap(${this.universe.nativeToken.toString()})`
  }
}

export class WithdrawAction extends Action {
  gasEstimate(): bigint {
    return 25000n
  }
  async encode([amountsIn]: TokenQuantity[]): Promise<ContractCall> {
    return new ContractCall(
      parseHexStringIntoBuffer(
        iWrappedNativeIFace.encodeFunctionData('withdraw', [amountsIn.amount])
      ),
      this.wrappedToken.address,
      0n,
      this.gasEstimate(),
      'Unwrap Native Token'
    )
  }
  async plan(planner: gen.Planner, inputs: gen.Value[], destination: Address) {
    const wethlib = gen.Contract.createContract(IWrappedNative__factory.connect(
      this.wrappedToken.address.address,
      this.universe.provider
    ))
    planner.add(wethlib.withdraw(inputs[0]))
    return [inputs[0]]
  }

  async quote([qty]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [qty.into(this.universe.nativeToken)]
  }

  constructor(readonly universe: Universe, readonly wrappedToken: Token) {
    super(
      wrappedToken.address,
      [wrappedToken],
      [universe.nativeToken],
      InteractionConvention.None,
      DestinationOptions.Callee,
      []
    )
  }

  toString(): string {
    return `Unwrap(${this.wrappedToken.toString()})`
  }
}
