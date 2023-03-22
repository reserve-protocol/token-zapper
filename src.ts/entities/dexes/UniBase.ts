import { type Address } from '../../base/Address'
import { type Token } from '../Token'
import {
  type DestinationOptions,
  Action,
  type InteractionConvention,
} from '../../action/Action'
import { type SwapDirection } from './TwoTokenPoolTypes'

export abstract class UniBase extends Action {
  public readonly zeroForOne: boolean
  public readonly outputToken: Token
  public readonly inputToken: Token
  constructor(
    basePool: {
      address: Address
      token0: Token
      token1: Token
    },

    readonly direction: SwapDirection,
    readonly destination: DestinationOptions,
    readonly interactionConvention: InteractionConvention
  ) {
    super(
      basePool.address,
      [direction === '0->1' ? basePool.token0 : basePool.token1],
      [direction === '0->1' ? basePool.token1 : basePool.token0],
      interactionConvention,
      destination,
      []
    )
    this.zeroForOne = direction === '0->1'
    this.outputToken = this.zeroForOne ? basePool.token1 : basePool.token0
    this.inputToken = this.zeroForOne ? basePool.token0 : basePool.token1
  }
}
