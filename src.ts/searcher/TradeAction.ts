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
import { DefaultMap } from '../base/DefaultMap'
import { Dim2Cache } from './MultiDimCache'

const remapAddr = (addr: Address) => {
  if (addr === Address.ZERO) {
    return Address.from(GAS_TOKEN_ADDRESS)
  }
  return addr
}
export const combineAddreses = (token0: Address, token1: Address) => {
  const addr0 = remapAddr(token0)
  const addr1 = remapAddr(token1)
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
      combineAddreses(from.address, to.address),
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
  let out = 0n
  while ((x >>= 1n)) out++
  return out
}

const RESOLUTION = 8n
const globalCache = new DefaultMap<
  BaseAction,
  Map<bigint, Promise<TokenQuantity[]>>
>(() => new Map())
export class WrappedAction extends BaseAction {
  private readonly cachedResults: BlockCache<bigint, TokenQuantity[]>
  private readonly dim2Cache: Dim2Cache
  private readonly innerCache: Map<bigint, Promise<TokenQuantity[]>>
  private block: number = 0
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

    this.dim2Cache = new Dim2Cache(universe, wrapped)
    this.innerCache = globalCache.get(wrapped)

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
    return this.wrapped.isTrade
  }
  get dependsOnRpc() {
    return false
  }

  get returnsOutput(): boolean {
    return this.wrapped.returnsOutput
  }

  get oneUsePrZap(): boolean {
    return this.wrapped.oneUsePrZap
  }

  public liquidity(): Promise<number> {
    return this.wrapped.liquidity()
  }

  get addressesInUse() {
    return this.wrapped.addressesInUse
  }

  get protocol(): string {
    return this.wrapped.protocol
  }

  toString(): string {
    return this.wrapped.toString()
  }
  async quoteInnerQuote(amountIn: TokenQuantity): Promise<TokenQuantity[]> {
    try {
      if (amountIn.isZero) {
        return [this.outputToken[0].zero]
      }
      const orderOfMagnitude = log2(amountIn.amount)

      let in0 = 2n ** orderOfMagnitude
      let in1 = 2n ** (orderOfMagnitude + 1n)
      let range = in1 - in0

      const parts = range / RESOLUTION
      const lowerTick = (amountIn.amount - in0) / parts
      in0 = in0 + lowerTick * parts
      in1 = in1 - (RESOLUTION - (lowerTick + 1n)) * parts
      range = in1 - in0

      const [[q0], [q1]] = await Promise.all([
        this.cachedResults.get(in0),
        this.cachedResults.get(in1),
      ])

      const s = q1.sub(q0)
      const tokenIn = amountIn.token
      const tokenOut = this.outputToken[0]

      const x0 = tokenIn.from(in0).into(tokenOut)
      const slope = s.into(tokenOut).div(tokenIn.from(range).into(tokenOut))
      const d = amountIn.into(tokenOut).sub(x0)

      const approx = slope.mul(d).add(q0)
      return [approx]
    } catch (e) {
      return [this.outputToken[0].zero]
    }
  }
  async quote(inputs: TokenQuantity[]): Promise<TokenQuantity[]> {
    if (this.block !== this.universe.currentBlock) {
      this.innerCache.clear()
      this.block = this.universe.currentBlock
    }
    if (inputs.length === 1) {
      const amountIn = inputs[0]
      let out = this.innerCache.get(amountIn.amount)
      if (out == null) {
        out = this.quoteInnerQuote(amountIn)
        this.innerCache.set(amountIn.amount, out)
      }
      return await out
    } else if (inputs.length === 2) {
      const out = await this.dim2Cache.quote(inputs)
      // console.log(`Quote 2d cache ${this.wrapped.protocol} ${inputs} -> ${out}`)
      return [out]
    }
    throw new Error('Invalid number of inputs')
  }
  gasEstimate(): bigint {
    return this.wrapped.gasEstimate()
  }
  async plan(
    planner: Planner,
    inputs: Value[],
    destination: Address,
    predictedInputs: TokenQuantity[]
  ): Promise<null | Value[]> {
    return await this.wrapped.plan(
      planner,
      inputs,
      destination,
      predictedInputs
    )
  }
}

export class NativeInputWrapper extends BaseAction {
  get returnsOutput(): boolean {
    return this.wrapped.returnsOutput
  }
  constructor(
    private readonly universe: Universe,
    public readonly wrapped: BaseAction
  ) {
    super(
      wrapped.address,
      wrapped.inputToken.map((i) => {
        if (i === universe.nativeToken) {
          return universe.wrappedNativeToken
        }
        return i
      }),
      wrapped.outputToken.map((i) => {
        if (i === universe.nativeToken) {
          return universe.wrappedNativeToken
        }
        return i
      }),
      wrapped.interactionConvention,
      wrapped.proceedsOptions,
      wrapped.approvals
    )
  }

  get is1to1() {
    return this.wrapped.is1to1
  }

  get isTrade() {
    return this.wrapped.isTrade
  }
  get dependsOnRpc() {
    return this.wrapped.dependsOnRpc
  }

  get oneUsePrZap(): boolean {
    return this.wrapped.oneUsePrZap
  }

  public liquidity(): Promise<number> {
    return this.wrapped.liquidity()
  }

  get addressesInUse() {
    return this.wrapped.addressesInUse
  }

  get protocol(): string {
    return this.wrapped.protocol
  }

  toString(): string {
    return this.wrapped.toString()
  }
  async quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]> {
    return (
      await this.wrapped.quote(
        amountsIn.map((i) => {
          if (i.token === this.universe.nativeToken) {
            return this.universe.wrappedNativeToken.from(i.amount)
          }
          return i
        })
      )
    ).map((i) => {
      if (i.token === this.universe.wrappedNativeToken) {
        return this.universe.nativeToken.from(i.amount)
      }
      return i
    })
  }
  gasEstimate(): bigint {
    return this.wrapped.gasEstimate()
  }
  async plan(
    planner: Planner,
    inputs: Value[],
    destination: Address,
    predictedInputs: TokenQuantity[]
  ): Promise<null | Value[]> {
    const wrappedToken = this.universe.wrappedTokens.get(
      this.universe.wrappedNativeToken
    )!

    planner.addComment(`ETH adapter for ${this.wrapped.protocol}`)

    const eth = this.universe.nativeToken
    const weth = this.universe.wrappedNativeToken

    const unwrappedInputs = await Promise.all(
      this.inputToken.map(async (token, index) => {
        const wrappedActionInputToken = this.wrapped.inputToken[index]
        if (token === weth && wrappedActionInputToken === eth) {
          const out = await wrappedToken.burn.plan(
            planner,
            [inputs[index]],
            this.universe.execAddress,
            [predictedInputs[index]]
          )
          if (out == null) {
            throw new Error(
              `Panic! Unexpected result from weth withdrawal action`
            )
          }
          return out[0]
        }
        return inputs[index]
      })
    )
    const unwrappedPredictedInputs = predictedInputs.map((i, index) => {
      const wrappedActionPredictedInputToken = this.wrapped.inputToken[index]
      if (i.token === weth && wrappedActionPredictedInputToken === eth) {
        return this.universe.nativeToken.from(i.amount)
      }
      return i
    })

    let out = await this.wrapped.plan(
      planner,
      unwrappedInputs,
      destination,
      unwrappedPredictedInputs
    )

    if (out != null) {
      const vals = out
      this.wrapped.outputToken.map((i, index) => {
        const value = vals[index]
        if (i === this.universe.nativeToken) {
          wrappedToken.mint.plan(planner, [value], destination, [])
        }
        return value
      })
    }

    return out
  }
}

export class MultiStepAction extends BaseAction {
  public toString(): string {
    return `${this.inputToken.join(', ')} ${
      this.steps.length
    } actions -> ${this.outputToken.join(', ')}`
  }
  public get protocol(): string {
    return this.steps.map((i) => i.protocol).join('-')
  }
  public async liquidity(): Promise<number> {
    const liquidity = await Promise.all(this.steps.map((i) => i.liquidity()))
    return liquidity.reduce((acc, i) => Math.min(acc, i), Infinity)
  }
  async quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]> {
    let out = amountsIn
    for (const step of this.steps) {
      out = await step.quote(out)
    }
    return out
  }
  gasEstimate(): bigint {
    return this.steps.reduce((acc, i) => acc + i.gasEstimate(), 0n)
  }
  async plan(
    planner: Planner,
    inputs: Value[],
    _: Address,
    predictedInputs: TokenQuantity[]
  ): Promise<null | Value[]> {
    let out = inputs
    let predictedOut = predictedInputs
    for (const step of this.steps) {
      let before: null | Value = null
      if (!step.returnsOutput) {
        before = this.genUtils.erc20.balanceOf(
          this.universe,
          planner,
          step.outputToken[0],
          this.universe.execAddress
        )
      }
      const stepOut = await step.plan(
        planner,
        out,
        this.universe.execAddress,
        predictedOut
      )
      predictedOut = await step.quote(predictedOut)
      if (stepOut != null) {
        out = stepOut
        continue
      }
      const after = this.genUtils.erc20.balanceOf(
        this.universe,
        planner,
        step.outputToken[0],
        this.universe.execAddress
      )
      out = [
        this.genUtils.sub(
          this.universe,
          planner,
          after,
          before!,
          `Balance after ${step.protocol}`,
          `${step}_out`
        ),
      ]
    }
    return out
  }
  private addrsInUse: Set<Address> | null = null
  constructor(
    public readonly universe: Universe,
    public readonly steps: BaseAction[]
  ) {
    super(
      steps.reduce((acc, i) => combineAddreses(acc, i.address), Address.ZERO),
      steps[0].inputToken,
      steps[steps.length - 1].outputToken,
      steps[0].interactionConvention,
      DestinationOptions.Callee,
      steps.flatMap((i) => i.approvals)
    )
  }

  get isTrade() {
    return true
  }
  get dependsOnRpc() {
    return this.steps.some((i) => i.dependsOnRpc)
  }
  get oneUsePrZap() {
    return this.steps.every((i) => i.oneUsePrZap)
  }
  get addressesInUse() {
    if (this.addrsInUse == null) {
      this.addrsInUse = new Set<Address>()
      for (const step of this.steps) {
        for (const addr of step.addressesInUse) {
          this.addrsInUse.add(addr)
        }
      }
    }
    return this.addrsInUse
  }
}

export const isAbstractAction = (action: BaseAction): action is TradeAction => {
  return action instanceof TradeAction
}

export const isWrappedAction = (
  action: BaseAction
): action is WrappedAction => {
  return action instanceof WrappedAction
}

export const unwrapAction = (action: BaseAction): BaseAction => {
  while (isWrappedAction(action)) {
    action = action.wrapped
  }
  return action
}

export const wrapGasToken = <T extends BaseAction>(
  universe: Universe,
  i: T
): T => {
  let act: BaseAction = i
  if (act.inputToken.some((i) => i === universe.nativeToken)) {
    act = new NativeInputWrapper(universe, act)
  }
  return act as T
}

export const wrapAction = (universe: Universe, i: BaseAction) => {
  let act = i
  if (act.is1to1 && act.inputToken[0] === universe.nativeToken) {
    act = new NativeInputWrapper(universe, act)
  }
  if (act.dependsOnRpc) {
    act = new WrappedAction(universe, act)
  }
  return act
}
