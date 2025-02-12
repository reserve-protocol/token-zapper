import { arrayify, hexZeroPad, hexlify } from 'ethers/lib/utils'
import { Universe } from '../Universe'
import { BaseAction, DestinationOptions } from '../action/Action'
import { Address } from '../base/Address'
import { GAS_TOKEN_ADDRESS } from '../base/constants'
import { TokenQuantity } from '../entities/Token'
import { Planner, Value } from '../tx-gen/Planner'
import { Dim1Cache, Dim2Cache, MultiDimCache } from './MultiDimCache'

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

export class WrappedAction extends BaseAction {
  private readonly cache: MultiDimCache
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
    if (wrapped.inputToken.length === 1) {
      this.cache = new Dim1Cache(universe, wrapped)
    } else if (wrapped.inputToken.length === 2) {
      this.cache = new Dim2Cache(universe, wrapped)
    } else {
      throw new Error('Invalid number of inputs')
    }
  }

  get isTrade() {
    return this.wrapped.isTrade
  }
  get dependsOnRpc() {
    return false
  }
  get is1to1() {
    return this.wrapped.is1to1
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

  get dustTokens() {
    return this.wrapped.dustTokens
  }

  get addressesInUse() {
    return this.wrapped.addressesInUse
  }

  get protocol(): string {
    return this.wrapped.protocol
  }

  get actionId() {
    return this.wrapped.actionId
  }
  toString(): string {
    return `Wrapped(${this.wrapped})`
  }
  async quote(inputs: TokenQuantity[]): Promise<TokenQuantity[]> {
    return this.quoteWithDust(inputs).then((i) => i.output)
  }
  async quoteWithDust(
    inputs: TokenQuantity[]
  ): Promise<{ output: TokenQuantity[]; dust: TokenQuantity[] }> {
    try {
      const out = await this.cache.quoteWithDust(inputs)

      return out
    } catch (e) {
      throw e
    }
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

  get actionId() {
    return this.wrapped.actionId
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
  get dustTokens() {
    return this.wrapped.dustTokens
  }
  async quoteWithDust(
    inputs: TokenQuantity[]
  ): Promise<{ output: TokenQuantity[]; dust: TokenQuantity[] }> {
    return await this.wrapped.quoteWithDust(inputs)
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
    const wethActions = this.universe.wrappedTokens.get(
      this.universe.wrappedNativeToken
    )!

    planner.addComment(`ETH adapter for ${this.wrapped.protocol}`)

    const eth = this.universe.nativeToken
    const weth = this.universe.wrappedNativeToken

    const unwrappedInputs = await Promise.all(
      this.inputToken.map(async (wrapperInputToken, index) => {
        const wrappedInputToken = this.wrapped.inputToken[index]
        const outValue = inputs[index]
        if (wrapperInputToken === weth && wrappedInputToken === eth) {
          await wethActions.burn.plan(
            planner,
            [outValue],
            this.universe.execAddress,
            [predictedInputs[index]]
          )
        }
        return outValue
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
      return await Promise.all(
        this.wrapped.outputToken.map(
          async (wrappedActionOutputToken, index) => {
            const value = vals[index]
            const wrapperActionOutputToken = this.wrapped.outputToken[index]
            if (
              wrappedActionOutputToken === eth &&
              wrapperActionOutputToken === weth
            ) {
              await wethActions.mint.plan(planner, [value], destination, [])
            }
            return value
          }
        )
      )
    }

    return out
  }
}

export const isWrappedAction = (
  action: BaseAction
): action is WrappedAction => {
  return action instanceof WrappedAction
}

export const unwrapAction = (action: BaseAction): BaseAction => {
  if (action instanceof WrappedAction) {
    return unwrapAction(action.wrapped)
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
