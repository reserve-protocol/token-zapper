import { type Address } from '../base/Address'
import { type TokenQuantity } from '../entities/Token'
import { DestinationOptions, InteractionConvention } from './Action'
import { ContractCall } from '../base/ContractCall'
import { type SwapDirection } from '../entities/dexes/TwoTokenPoolTypes'
import { type V2Pool } from '../entities/dexes/V2LikePool'
import { UniBase } from '../entities/dexes/UniBase'
import { type Universe } from '../Universe'
import { parseHexStringIntoBuffer } from '../base/utils'
import { Buffer } from 'buffer'
import { UniswapV2Pair__factory } from '../contracts/factories/contracts/UniswapV2Pair__factory'
import { Planner, Value } from '../tx-gen/Planner'

const iface = UniswapV2Pair__factory.createInterface()

export class UniV2Like extends UniBase {
  async plan(planner: Planner, inputs: Value[], _: Address): Promise<Value[]> {
    throw new Error('Method not implemented.')
  }
  gasEstimate() {
    return BigInt(110000n)
  }
  async encode(
    amountsIn: TokenQuantity[],
    destination: Address
  ): Promise<ContractCall> {
    const amountOut = await this.pool.swapFn(amountsIn[0], this)
    const [amount0, amount1] =
      amountsIn[0].token === this.pool.token0
        ? [amountsIn[0], amountOut]
        : [amountOut, amountsIn[0]]

    return new ContractCall(
      parseHexStringIntoBuffer(
        iface.encodeFunctionData('swap', [
          amount0.amount,
          amount1.amount,
          destination.address,
          Buffer.alloc(0),
        ])
      ),
      this.pool.address,
      0n,
      this.gasEstimate(),
      'V2Swap ' + this.pool.name
    )
  }

  /**
   * @node V2Actions can quote in both directions!
   * @returns
   */
  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [await this.pool.swapFn(amountsIn, this)]
  }

  constructor(
    readonly universe: Universe,
    readonly pool: V2Pool,
    readonly direction: SwapDirection
  ) {
    super(
      pool,
      direction,
      DestinationOptions.Recipient,
      InteractionConvention.PayBeforeCall
    )
  }

  toString(): string {
    return `UniV2Like(${this.inputToken.symbol.toString()}.${
      this.address.address
    }.${this.outputToken.symbol.toString()})`
  }
}
