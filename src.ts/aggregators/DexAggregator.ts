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
  ) {}

  private currentBlock = 0
  public onBlock(block: number) {
    this.currentBlock = block
    for (const [key, data] of [...this.cache.entries()]) {
      if (data.timestamp !== this.currentBlock) {
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
    src,
    dst,
    input,
    output,
    slippage
  ) => {
    const key = `${input.amount}.${input.token.address.address}.${output.address.address}.${slippage}`
    const prev = this.cache.get(key)
    if (prev != null) {
      return prev.path
    }
    const out = this.swap_(abort, src, dst, input, output, slippage)
      .then((path) => {
        this.cache2.set(key, path)
        return path
      })
      .catch((e) => {
        this.cache.delete(key)
        throw e
      })
    this.cache.set(key, {
      path: out,
      timestamp: this.currentBlock,
    })
    return await out
  }

  supportsSwap(inputTokenQty: TokenQuantity, output: Token) {
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

  [Symbol.toStringTag] = 'DexAggregator'

  toString() {
    return `DexAggregator(name=${this.name})`
  }
}
