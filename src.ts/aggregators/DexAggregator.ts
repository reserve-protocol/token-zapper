import { Universe } from '..'
import { BaseAction } from '../action/Action'
import { DefaultMap } from '../base/DefaultMap'
import { Token, TokenQuantity } from '../entities/Token'
import { SwapPath } from '../searcher/Swap'
import { type SwapSignature } from './SwapSignature'
type SupportedTokenPairFn = (a: Token, b: Token) => boolean
interface IOptions {
  dynamicInput: boolean
  returnsOutput: boolean
  onePrZap: boolean
}
class SupportFnBuilder {
  private constructor(
    public readonly name: string,
    public readonly swap: SwapSignature,
    public readonly options: IOptions
  ) {}

  public static builder(name: string, swap: SwapSignature, options: IOptions) {
    const builder = new SupportFnBuilder(name, swap, options)
    return builder.createInnerBuilder()
  }

  private createInnerBuilder() {
    const supported = new DefaultMap<Token, DefaultMap<Token, boolean>>(
      () => new DefaultMap(() => false)
    )

    const builder = {
      addPair: (a: Token, b: Token, biDirectional = false) => {
        if (a === b) {
          return builder
        }

        supported.get(a).set(b, true)
        if (biDirectional) {
          supported.get(b).set(a, true)
        }
        return builder
      },
      addOneToMany: (a: Token, b: Token[], biDirectional = false) => {
        for (const i of b) {
          builder.addPair(i, a, biDirectional)
        }
        return builder
      },
      addManyToOne: (a: Token[], b: Token, biDirectional = false) => {
        for (const i of a) {
          builder.addPair(i, b, biDirectional)
        }
        return builder
      },

      addManyToMany: (a: Token[], b: Token[], biDirectional = false) => {
        for (const i of a) {
          for (const j of b) {
            builder.addPair(i, j, biDirectional)
          }
        }
        return builder
      },
      build: () => {
        if (supported.size === 0) {
          return new DexRouter(
            this.name,
            {
              check: () => true,
              description: () => ['All trades supported'],
            },
            this.swap,
            this.options
          )
        }
        let noLimits = supported.size === 0
        const fastMap = new Map<Token, Set<Token>>()
        for (const [key, value] of supported.entries()) {
          fastMap.set(
            key,
            new Set(
              [...value.entries()]
                .filter(([_, support]) => support)
                .map(([tok]) => tok)
            )
          )
        }
        const tradeSupported = (a: Token, b: Token) => {
          if (a === b) {
            return false
          }
          return noLimits ?? fastMap.get(a)?.has(b) ?? false
        }

        if (noLimits) {
          return new DexRouter(
            this.name,
            {
              check: tradeSupported,
              description: () => ['All trades supported'],
            },
            this.swap,
            this.options
          )
        }
        const describe = () => {
          const out: string[] = []
          // First find by-directional trades:
          let numberOfByDirectionalTrades = 0
          for (const [tokenA, tokenOut] of fastMap.entries()) {
            for (const tokenB of tokenOut) {
              if (fastMap.get(tokenB)?.has(tokenA) ?? false) {
                numberOfByDirectionalTrades++
              }
            }
          }
          for (const [tokenA, tokenOut] of fastMap.entries()) {
            out.push(`  bi-directional ${tokenOut.size * 2}:`)
            for (const tokenB of tokenOut) {
              if (fastMap.get(tokenB)?.has(tokenA) ?? false) {
                out.push(`    ${tokenA} <-> ${tokenB}`)
              }
            }
          }
          for (const [tokenIn, tokensOut] of fastMap.entries()) {
            out.push(`  directional ${tokensOut.size}:`)
            for (const tokenOut of tokensOut) {
              out.push(`    ${tokenIn} -> ${tokenOut}`)
            }
          }
          return out
        }

        // console.log(describe().join('\n'))

        return new DexRouter(
          this.name,
          {
            check: tradeSupported,
            description: describe,
          },
          this.swap,
          this.options
        )
      },
    }
    return builder
  }
}
export class DexRouter {
  private cache: Map<
    string,
    {
      path: Promise<SwapPath>
      timestamp: number
    }
  > = new Map()

  private cache2: Map<string, SwapPath> = new Map()

  public constructor(
    public readonly name: string,
    private readonly supportedTrade_: {
      check: SupportedTokenPairFn
      description: () => string[]
    },
    private readonly swap_: SwapSignature,
    public readonly options: IOptions
  ) {
    console.log(`Router ${name} created`)
    console.log(supportedTrade_.description().join('\n'))
  }

  describe() {
    const out: string[] = []
    out.push(`Router {`)
    out.push(`  name: ${this.name}`)
    out.push(`  supportsDynamicInputs: ${this.supportsDynamicInput}`)
    out.push(`  mustCheckConstraints: ${this.oneUsePrZap}`)
    out.push(...this.supportedTrade_.description().map((x) => `  ${x}`))
    out.push(`}`)
    return out
  }

  public static builder(name: string, swap: SwapSignature, options: IOptions) {
    const builder = SupportFnBuilder.builder(name, swap, options)
    return builder
  }

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

  get supportsDynamicInput() {
    return this.options.dynamicInput
  }

  get oneUsePrZap() {
    return this.options.onePrZap
  }

  get returnsOutput() {
    return this.options.returnsOutput
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
    const prev = this.cache.get(key)
    if (prev != null) {
      return prev.path
    }
    const out = this.swap_(abort, input, output, slippage)
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

  public supportsSwap(inputTokenQty: TokenQuantity, output: Token) {
    return this.supportedTrade_.check(inputTokenQty.token, output)
  }
  public supportsEdge(inputTokenQty: Token, output: Token) {
    return this.supportedTrade_.check(inputTokenQty, output)
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
    ) => Promise<BaseAction | null>,
    private readonly onBlock_?: (block: number) => void,
    public readonly external = false
  ) {}

  get supportsDynamicInput() {
    return this.router.supportsDynamicInput
  }

  get name() {
    return this.router.name
  }

  get supportsEdges() {
    return this.createTradeEdge_ != null
  }

  canCreateEdgeBetween(tokenA: Token, tokenB: Token) {
    if (tokenA === tokenB) {
      return false
    }
    return this.router.supportsEdge(tokenA, tokenB)
  }

  async createTradeEdge(src: Token, dst: Token) {
    if (src === dst) {
      throw new Error('Cannot create edge to self')
    }
    if (this.createTradeEdge_ == null) {
      throw new Error(
        `${this.router.name} does not support creating permanent edges`
      )
    }
    return await this.createTradeEdge_(src, dst)
  }

  public async onBlock(block: number) {
    if (this.onBlock_ != null) {
      this.onBlock_(block)
    }
    this.router.onBlock(block)
  }
}
