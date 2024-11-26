import { type Token, type TokenQuantity } from '../entities/Token'
import { type Universe } from '../Universe'
import { Action, DestinationOptions, InteractionConvention } from './Action'

import { Address } from '..'
import { IWrappedNative__factory } from '../contracts/factories/contracts/IWrappedNative__factory'
import * as gen from '../tx-gen/Planner'

export class DepositAction extends Action('WETH') {
  gasEstimate(): bigint {
    return 25000n
  }
  async plan(planner: gen.Planner, inputs: gen.Value[], destination: Address) {
    const wethlib = gen.Contract.createContract(
      IWrappedNative__factory.connect(
        this.wrappedToken.address.address,
        this.universe.provider
      )
    )
    planner.add(wethlib.deposit().withValue(inputs[0]))
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

export class WithdrawAction extends Action('WETH') {
  gasEstimate(): bigint {
    return 25000n
  }
  async plan(planner: gen.Planner, inputs: gen.Value[], destination: Address) {
    const wethlib = gen.Contract.createContract(
      IWrappedNative__factory.connect(
        this.wrappedToken.address.address,
        this.universe.provider
      )
    )
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
