import { Universe } from '../Universe'
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


  constructor(
    public readonly name: string,
    private readonly swap_: SwapSignature,
    public readonly dynamicInput: boolean,
    public readonly supportedInputTokens = new Set<Token>(),
    public readonly supportedOutputTokens = new Set<Token>()
  ) { }

  private maxConcurrency = Infinity
  private pending = 0
  public withMaxConcurrency(
    concurrency: number
  ) {
    this.maxConcurrency = concurrency
    return this
  }
  private currentBlock = 0
  public onBlock(block: number, tolerance: number) {
    this.currentBlock = block
    for (const [key, data] of [...this.cache.entries()]) {
      if (data.timestamp + tolerance < this.currentBlock) {
        this.cache.delete(key)
      }
    }
  }
  public readonly swap: SwapSignature = (
    abort,
    input,
    output,
    slippage
  ) => {
    const key = `${input.amount}.${input.token.address.address}.${output.address.address}.${slippage}`
    const prev = this.cache.get(key)
    if (prev != null) {
      return prev.path
    }
    if (this.pending > this.maxConcurrency) {
      throw new Error('Too many concurrent swaps')
    }
    this.pending++
    const out = this.swap_(abort, input, output, slippage);
    this.cache.set(key, {
      path: out,
      timestamp: this.currentBlock,
    })

    return out.finally(() => {
      this.pending--
      if (this.cache.get(key)?.path === out) {
        this.cache.delete(key)
      }
    })
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
