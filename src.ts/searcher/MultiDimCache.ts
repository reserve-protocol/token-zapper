import { Universe } from '../Universe'
import { BaseAction } from '../action/Action'
import { BlockCache } from '../base/BlockBasedCache'
import { DefaultMap } from '../base/DefaultMap'
import { TokenQuantity } from '../entities/Token'

const log2 = (x: bigint) => {
  let out = 0n
  while ((x >>= 1n)) out++
  return out
}

type QuoteWithDustResult = {
  output: TokenQuantity[]
  dust: TokenQuantity[]
}
const globalCache = new DefaultMap<
  BaseAction,
  Map<bigint, Promise<QuoteWithDustResult>>
>(() => new Map())

const globalCache2d = new DefaultMap<
  BaseAction,
  Map<string, Promise<QuoteWithDustResult>>
>(() => new Map())

const computeOutputs1d = (
  y0: TokenQuantity[],
  y1: TokenQuantity[],
  amountIn: TokenQuantity,
  x0: TokenQuantity,
  dx: TokenQuantity
) => {
  const dys = y0.map((t, index) => y1[index].sub(t))

  const x = amountIn

  const progression = x.sub(x0).div(dx)

  const approx = dys.map((dy, index) => {
    return progression.into(dy.token).mul(dy).add(y0[index])
  })

  return approx
}

const computeOutputs2d = (
  p00: TokenQuantity[], // values[x1][y1]
  p01: TokenQuantity[], // values[x1][y2]
  p10: TokenQuantity[], // values[x2][y1]
  p11: TokenQuantity[], // values[x2][y2]
  f0: TokenQuantity, //  (((x2 - x) * (y2 - y)) / ((x2 - x1) * (y2 - y1)))
  f1: TokenQuantity, //  (((x - x1) * (y2 - y)) / ((x2 - x1) * (y2 - y1)))
  f2: TokenQuantity, //  (((x2 - x) * (y - y1)) / ((x2 - x1) * (y2 - y1)))
  f3: TokenQuantity //  (((x - x1) * (y - y1)) / ((x2 - x1) * (y2 - y1)))
) => {
  const out: TokenQuantity[] = []
  for (let i = 0; i < p00.length; i++) {
    const q11 = p00[i].mul(f0)
    const q21 = p10[i].mul(f1)
    const q12 = p01[i].mul(f2)
    const q22 = p11[i].mul(f3)
    out.push(q11.token.from(q11.amount + q21.amount + q12.amount + q22.amount))
  }
  return out
}

const comoputeFactors = (
  x: TokenQuantity,
  x1: TokenQuantity,
  x2: TokenQuantity,
  y: TokenQuantity,
  y1: TokenQuantity,
  y2: TokenQuantity
) => {
  const divisor = x2.sub(x1).mul(y2.sub(y1))

  const x2subx = x2.sub(x)
  const y2suby = y2.sub(y)
  const xsubx1 = x.sub(x1)
  const ysuby1 = y.sub(y1)

  const f0 = x2subx.mul(y2suby).div(divisor)
  const f1 = xsubx1.mul(y2suby).div(divisor)
  const f2 = x2subx.mul(ysuby1).div(divisor)
  const f3 = xsubx1.mul(ysuby1).div(divisor)

  return [f0, f1, f2, f3]
}
export interface MultiDimCache {
  quote: (amountIn: TokenQuantity[]) => Promise<TokenQuantity[]>
  quoteWithDust: (amountIn: TokenQuantity[]) => Promise<QuoteWithDustResult>
}

const inputIntoRanges = (resolution: bigint, amountIn: TokenQuantity) => {
  const orderOfMagnitude = log2(amountIn.amount)

  let in0 = 2n ** orderOfMagnitude
  let in1 = 2n ** (orderOfMagnitude + 1n)
  let range = in1 - in0

  const parts = range / resolution
  const lowerTick = (amountIn.amount - in0) / parts
  in0 = in0 + lowerTick * parts
  in1 = in1 - (resolution - (lowerTick + 1n)) * parts
  range = in1 - in0

  return [in0, in1, range]
}
export class Dim1Cache implements MultiDimCache {
  private readonly cachedResults: BlockCache<bigint, QuoteWithDustResult>
  private readonly innerCache: Map<bigint, Promise<QuoteWithDustResult>>
  private block: number = 0

  private get inputToken() {
    return this.wrapped.inputToken[0]
  }
  constructor(
    public readonly universe: Universe,
    public readonly wrapped: BaseAction
  ) {
    this.cachedResults = universe.createCache(async (amountIn) => {
      return await this.wrapped.quoteWithDust([this.inputToken.from(amountIn)])
    }, 12000)
    this.innerCache = globalCache.get(wrapped)
  }

  private async quoteInnerQuote(
    amountIn: TokenQuantity
  ): Promise<QuoteWithDustResult> {
    if (amountIn.isZero) {
      return this.zeroResult()
    }
    try {
      const [in0, in1, range] = inputIntoRanges(
        this.universe.config.cacheResolution,
        amountIn
      )

      const [y0s, y1s] = await Promise.all([
        this.cachedResults.get(in0),
        this.cachedResults.get(in1),
      ])

      const tokenIn = amountIn.token

      const x0 = tokenIn.from(in0)
      const dx = tokenIn.from(range)

      return {
        output: computeOutputs1d(y0s.output, y1s.output, amountIn, x0, dx),
        dust: computeOutputs1d(y0s.dust, y1s.dust, amountIn, x0, dx),
      }
    } catch (e) {
      console.error(e)
      return this.zeroResult()
    }
  }

  private zeroResult() {
    return {
      output: this.wrapped.outputToken.map((i) => i.zero),
      dust: [],
    }
  }
  private resetCache() {
    if (this.block !== this.universe.currentBlock) {
      this.innerCache.clear()
      this.block = this.universe.currentBlock
    }
  }

  public async quote(amountIn: TokenQuantity[]): Promise<TokenQuantity[]> {
    const out = await this.quoteWithDust(amountIn)
    return out.output
  }

  public async quoteWithDust(
    amountIn: TokenQuantity[]
  ): Promise<QuoteWithDustResult> {
    this.resetCache()
    const out = this.innerCache.get(amountIn[0].amount)
    if (out != null) {
      return await out
    }
    const res = this.quoteInnerQuote(amountIn[0])
    this.innerCache.set(amountIn[0].amount, res)
    return await res
  }
}

export class Dim2Cache implements MultiDimCache {
  private block: number = 0
  private readonly cachedResults: DefaultMap<
    bigint,
    BlockCache<bigint, QuoteWithDustResult>
  >
  private readonly innerCache: Map<string, Promise<QuoteWithDustResult>>

  constructor(
    private readonly universe: Universe,
    private readonly wrapped: BaseAction
  ) {
    this.cachedResults = new DefaultMap((xbn: bigint) => {
      const x = this.wrapped.inputToken[0].from(xbn)
      return universe.createCache<bigint, QuoteWithDustResult>(async (ybn) => {
        return await this.wrapped.quoteWithDust([
          x,
          this.wrapped.inputToken[1].from(ybn),
        ])
      }, 12000)
    })
    this.innerCache = globalCache2d.get(this.wrapped)
  }

  private async sample(
    x: TokenQuantity,
    y: TokenQuantity
  ): Promise<QuoteWithDustResult> {
    const resolution = this.universe.config.cacheResolution
    const [xin0, xin1] = inputIntoRanges(resolution, x)
    const [yin0, yin1] = inputIntoRanges(resolution, y)
    const cols0 = this.cachedResults.get(xin0)
    const cols1 = this.cachedResults.get(xin1)

    const [p00, p01, p10, p11] = await Promise.all([
      cols0.get(yin0),
      cols0.get(yin1),
      cols1.get(yin0),
      cols1.get(yin1),
    ])

    const x0 = x.token.from(xin0)
    const y0 = y.token.from(yin0)
    const x1 = x.token.from(xin1)
    const y1 = y.token.from(yin1)

    const [f0, f1, f2, f3] = comoputeFactors(x, x0, x1, y, y0, y1)
    const outputs = computeOutputs2d(
      p00.output,
      p01.output,
      p10.output,
      p11.output,
      f0,
      f1,
      f2,
      f3
    )
    if (this.wrapped.dustTokens.length === 0) {
      return {
        output: outputs,
        dust: [],
      }
    }
    return {
      output: outputs,
      dust: computeOutputs2d(
        p00.dust,
        p01.dust,
        p10.dust,
        p11.dust,
        f0,
        f1,
        f2,
        f3
      ),
    }
  }

  public async quote(amountIn: TokenQuantity[]): Promise<TokenQuantity[]> {
    const out = await this.quoteWithDust(amountIn)

    return out.output
  }

  private resetCache() {
    if (this.block !== this.universe.currentBlock) {
      this.innerCache.clear()
      this.block = this.universe.currentBlock
    }
  }

  public async quoteWithDust([
    x,
    y,
  ]: TokenQuantity[]): Promise<QuoteWithDustResult> {
    this.resetCache()
    const key = `${x.amount}-${y.amount}`
    const out = this.innerCache.get(key)
    if (out != null) {
      return await out
    }
    const promise = this.sample(x, y)
    this.innerCache.set(key, promise)
    return await promise
  }
}
