import { arrayify, hexZeroPad, hexlify } from 'ethers/lib/utils'
import { Universe } from '../Universe'
import {
  BaseAction,
  DestinationOptions,
  InteractionConvention,
} from '../action/Action'
import { Address } from '../base/Address'
import { GAS_TOKEN_ADDRESS } from '../base/constants'
import { Token, TokenQuantity } from '../entities/Token'
import { Planner, Value } from '../tx-gen/Planner'
import { BlockCache } from '../base/BlockBasedCache'

const remapAddr = (addr: Address) => {
  if (addr === Address.ZERO) {
    return Address.from(GAS_TOKEN_ADDRESS)
  }
  return addr
}
const combineAddreses = (token0: Token, token1: Token) => {
  const addr0 = remapAddr(token0.address)
  const addr1 = remapAddr(token1.address)
  if (addr0.integer === addr1.integer) {
    throw new Error(
      `Cannot combine addresses of the same token: ${token0} and ${token1}`
    )
  }
  let val = addr0.integer ^ addr1.integer
  return Address.fromBuffer(Buffer.from(arrayify(hexZeroPad(hexlify(val), 20))))
}

export class TradeAction extends BaseAction {
  constructor(
    public readonly universe: Universe,
    public readonly from: Token,
    public readonly to: Token
  ) {
    super(
      combineAddreses(from, to),
      [from],
      [to],
      InteractionConvention.None,
      DestinationOptions.Recipient,
      []
    )
  }

  get oneUsePrZap(): boolean {
    return true
  }

  get addressesInUse() {
    return new Set([this.address])
  }

  get protocol(): string {
    return `Trade ${this.from} -> ${this.to}`
  }

  toString(): string {
    return `Trade(${this.from} -> ${this.to})`
  }
  async quote([amountIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    const [priceIn, priceOut] = await Promise.all([
      this.universe.fairPrice(amountIn),
      this.universe.fairPrice(this.outputToken[0].one),
    ])
    if (priceIn == null || priceOut == null) {
      throw new Error(`Unable to find price for ${this.from} or ${this.to}`)
    }
    const outToken = this.outputToken[0]
    const amountOut = priceIn.into(outToken).div(priceOut.into(outToken))

    let slippage = 0.9999
    if (priceIn.amount > 25000_00000000n) {
      slippage *= 0.999
    }
    if (priceIn.amount > 100000_00000000n) {
      slippage *= 0.999
    }
    if (priceIn.amount > 200000_00000000n) {
      slippage *= 0.99
    }

    return [amountOut.mul(outToken.from(slippage))]
  }
  gasEstimate(): bigint {
    return 250_000n
  }
  get isTrade() {
    return true
  }
  get dependsOnRpc() {
    return false
  }

  plan(
    planner: Planner,
    inputs: Value[],
    destination: Address,
    predictedInputs: TokenQuantity[]
  ): Promise<null | Value[]> {
    throw new Error('Abstract Action')
  }
}

const log2 = (x: bigint) => {
  let out = 0
  while (x !== 0n) {
    x /= 2n
    out++
  }
  return BigInt(out - 1 <= 0 ? 1 : out - 1)
}

export class WrappedAction extends BaseAction {
  private readonly cachedResults: BlockCache<bigint, TokenQuantity[]>
  constructor(
    public readonly universe: Universe,
    public readonly wrapped: BaseAction
  ) {
    super(
      wrapped.address,
      wrapped.inputToken,
      wrapped.outputToken,
      wrapped.interactionConvention,
      wrapped.proceedsOptions,
      wrapped.approvals
    )
    this.cachedResults = universe.createCache(async (amountIn) => {
      const inp = this.inputToken[0].from(amountIn)
      const out = await this.wrapped.quote([inp])
      if (out.length !== 1) {
        throw new Error('Expected single output')
      }

      return out
    }, 12000)
  }

  get isTrade() {
    return true
  }
  get dependsOnRpc() {
    return false
  }

  get oneUsePrZap(): boolean {
    return true
  }

  get addressesInUse() {
    return this.wrapped.addressesInUse
  }

  get protocol(): string {
    return `TradeWrapped(${
      this.wrapped.protocol
    }, ${this.wrapped.inputToken.join(', ')} -> ${this.wrapped.outputToken.join(
      ', '
    )})`
  }

  toString(): string {
    return `WrappedTrade(${this.wrapped.toString()})`
  }
  async quote([amountIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    try {
      if (amountIn.isZero) {
        return [this.outputToken[0].zero]
      }
      const orderOfMagnitude = log2(amountIn.amount)
      const in0 = 2n ** orderOfMagnitude
      const [[q0], [q1]] = await Promise.all([
        this.cachedResults.get(in0),
        this.cachedResults.get(in0 * 2n),
      ])

      const s = q1.sub(q0)
      const tokenIn = amountIn.token
      const tokenOut = this.outputToken[0]

      const x0 = tokenIn.from(in0).into(tokenOut)
      const slope = s.div(x0)
      const d = amountIn.into(tokenOut).sub(x0)

      const approx = slope.mul(d).add(q0).mul(tokenOut.from(0.992))
      return [approx]
    } catch (e) {
      return [this.outputToken[0].zero]
    }
  }
  gasEstimate(): bigint {
    return this.wrapped.gasEstimate()
  }
  plan(
    planner: Planner,
    inputs: Value[],
    destination: Address,
    predictedInputs: TokenQuantity[]
  ): Promise<null | Value[]> {
    throw new Error('Abstract Action')
  }
}

export const isAbstractAction = (
  action: BaseAction
): action is TradeAction | WrappedAction => {
  return action instanceof TradeAction || action instanceof WrappedAction
}

export const isWrappedAction = (
  action: BaseAction
): action is WrappedAction => {
  return action instanceof WrappedAction
}
