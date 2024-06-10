import { Universe } from '..'
import { RouterAction } from '../action/RouterAction'
import { Token, TokenQuantity } from '../entities/Token'
import { SwapPath } from '../searcher/Swap'
import { type SwapSignature } from './SwapSignature'
export class DexRouter {
  private cache: Map<
    string,
    {
      path: Promise<SwapPath>
      timestamp: number
    }
  > = new Map()

  private cache2: Map<string, SwapPath> = new Map()

  constructor(
    public readonly name: string,
    private readonly swap_: SwapSignature,
    public readonly dynamicInput: boolean,
    public readonly supportedInputTokens = new Set<Token>(),
    public readonly supportedOutputTokens = new Set<Token>()
  ) { }

  private currentBlock = 0
  public onBlock(block: number, tolerance: number) {
    this.currentBlock = block
    for (const [key, data] of [...this.cache.entries()]) {
      if (data.timestamp + tolerance < this.currentBlock) {
        this.cache.delete(key)
        this.cache2.delete(key)
      }
    }
  }

  getPrevious(input: TokenQuantity, output: Token, slippage: bigint) {
    const key = `${input.amount}.${input.token.address.address}.${output.address.address}.${slippage}`
    return this.cache2.get(key)
  }

  public readonly swap: SwapSignature = async (
    abort,
    input,
    output,
    slippage
  ) => {
    const key = `${input.amount}.${input.token.address.address}.${output.address.address}.${slippage}`
    const prev = this.cache2.get(key)
    if (prev != null) {
      return prev
    }
    const out = this.swap_(abort, input, output, slippage)
      .then((path) => {
        this.cache2.set(key, path)
        return path
      })
      .catch((e) => {
        this.cache.delete(key)
        throw e
      });
    this.cache.set(key, {
      path: out,
      timestamp: this.currentBlock,
    })

    return await out
  }

  supportsSwap(inputTokenQty: TokenQuantity, output: Token) {
    if (this.supportedInputTokens.size === 0 && this.supportedOutputTokens.size === 0) {
      return true
    }
    if (
      this.supportedInputTokens.size !== 0 &&
      !this.supportedInputTokens.has(inputTokenQty.token)
    ) {
      return false
    }
    if (
      this.supportedOutputTokens.size !== 0 &&
      !this.supportedOutputTokens.has(output)
    ) {
      return false
    }
    return true
  }

  [Symbol.toStringTag] = 'Router'

  toString() {
    return `Router(${this.name})`
  }
}

export class TradingVenue {
  toString() {
    return `Venue(${this.router.name})`
  }
  constructor(
    public readonly universe: Universe,
    public readonly router: DexRouter,
    private readonly createTradeEdge_?: (
      src: Token,
      dst: Token
    ) => Promise<RouterAction | null>
  ) { }


  get supportsDynamicInput() {
    return this.router.dynamicInput
  }

  get name() {
    return this.router.name
  }

  get supportsEdges() {
    return this.createTradeEdge_ != null
  }

  canCreateEdgeBetween(
    tokenA: Token,
    tokenB: Token
  ) {
    if (this.router.supportedInputTokens.size !== 0) {
      if (!this.router.supportedInputTokens.has(tokenA)) {
        return false
      }
    }
    if (this.router.supportedOutputTokens.size !== 0) {
      if (!this.router.supportedOutputTokens.has(tokenB)) {
        return false
      }
    }
    return true
  }

  async createTradeEdge(src: Token, dst: Token) {
    if (this.createTradeEdge_ == null) {
      throw new Error(
        `${this.router.name} does not support creating permanent edges`
      )
    }
    return await this.createTradeEdge_(src, dst)
  }
}
