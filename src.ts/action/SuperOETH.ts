import { type Token, type TokenQuantity } from '../entities/Token'
import { Action, DestinationOptions, InteractionConvention } from './Action'

import { BaseUniverse } from '../configuration/base'
import { IWrappedNative__factory } from '../contracts/factories/contracts/IWrappedNative__factory'
import * as gen from '../tx-gen/Planner'
import { Address } from '../base/Address'

const originZapper = Address.from('0x3b56c09543D3068f8488ED34e6F383c3854d2bC1')

export class SuperOETHDeposit extends Action('SuperOETH') {
  gasEstimate(): bigint {
    return 150000n
  }
  async plan(planner: gen.Planner, inputs: gen.Value[], destination: Address) {
    const wethlib = gen.Contract.createContract(
      IWrappedNative__factory.connect(
        originZapper.address,
        this.universe.provider
      )
    )
    planner.add(wethlib.deposit().withValue(inputs[0]))
    return [inputs[0]]
  }

  async quote([qty]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [qty.into(this.outputToken[0])]
  }

  constructor(readonly universe: BaseUniverse) {
    super(
      universe.commonTokens.SuperOETH.address,
      [universe.nativeToken],
      [universe.commonTokens.SuperOETH],
      InteractionConvention.None,
      DestinationOptions.Callee,
      []
    )
  }

  get actionName(): string {
    return 'deposit'
  }
}
