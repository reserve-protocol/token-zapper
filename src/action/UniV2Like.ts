import { type Address } from '../base/Address'
import { type TokenQuantity } from '../entities/Token'
import { DestinationOptions, InteractionConvention } from './Action'
import { ContractCall } from '../base/ContractCall'
import { type SwapDirection } from '../entities/dexes/TwoTokenPoolTypes'
import { type V2Pool } from '../entities/dexes/V2LikePool'
import { UniBase } from '../entities/dexes/UniBase'
import { UniswapV2Pair__factory } from '../contracts'
import { type Universe } from '../Universe'
import { parseHexStringIntoBuffer } from '../base/utils'
const iface = UniswapV2Pair__factory.createInterface()

export class UniV2Like extends UniBase {
  
  async encode (amountsIn: TokenQuantity[], destination: Address): Promise<ContractCall> {
    const amountOut = (await this.quote(amountsIn))[0]
    const [amount0, amount1] = this.zeroForOne ? [amountsIn[0], amountOut] : [amountOut, amountsIn[0]]

    return new ContractCall(
      parseHexStringIntoBuffer(
        iface.encodeFunctionData('swap', [
          amount0.amount,
          amount1.amount,
          destination.address,
          Buffer.alloc(0)
        ])
      ),
      this.pool.address,
      0n,
      'V2Swap ' + this.pool.name
    )
  }

  async quote ([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [await this.pool.swapFn(
      amountsIn,
      this
    )]
  }

  constructor (
    readonly universe: Universe,
    readonly pool: V2Pool,
    readonly direction: SwapDirection,
  ) {
    super(pool, direction, DestinationOptions.Recipient, InteractionConvention.PayBeforeCall)
  }
}
