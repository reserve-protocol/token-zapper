import { Universe } from '../Universe'
import { BaseAction } from '../action/Action'
import { DefaultMap } from '../base/DefaultMap'
import { TokenQuantity } from '../entities/Token'

const log2 = (x: bigint) => {
  let out = 0n
  while ((x >>= 1n)) out++
  return out
}
const RESOLUTION_COL = 4n
const RESOLUTION_ROW = 4n

export class Dim2Cache {
  private block: number = 0
  private lastClear: number = 0
  private readonly cachedResults = new DefaultMap<
    bigint,
    DefaultMap<bigint, Promise<TokenQuantity>>
  >((dim1Qty) => {
    const inp1 = this.action.inputToken[0].from(dim1Qty)
    return new DefaultMap<bigint, Promise<TokenQuantity>>(async (dim2Qty) => {
      const inp2 = this.action.inputToken[1].from(dim2Qty)
      const out = await this.action.quote([inp1, inp2])
      return out[0]
    })
  })
  async sampleRow(
    amountIn: TokenQuantity,
    rowCache: DefaultMap<bigint, Promise<TokenQuantity>>
  ): Promise<TokenQuantity> {
    try {
      if (amountIn.isZero) {
        return this.action.outputToken[0].zero
      }
      const orderOfMagnitude = log2(amountIn.amount)

      let in0 = 2n ** orderOfMagnitude
      let in1 = 2n ** (orderOfMagnitude + 1n)
      let range = in1 - in0

      const parts = range / RESOLUTION_ROW
      const lowerTick = (amountIn.amount - in0) / parts
      in0 = in0 + lowerTick * parts
      in1 = in1 - (RESOLUTION_ROW - (lowerTick + 1n)) * parts
      range = in1 - in0

      const results = await Promise.all([rowCache.get(in0), rowCache.get(in1)])
      const q0 = results[0]
      const q1 = results[1]
      const s = q1.sub(q0)
      const tokenIn = amountIn.token
      const tokenOut = this.action.outputToken[0]

      const x0 = tokenIn.from(in0).into(tokenOut)
      const slope = s.into(tokenOut).div(tokenIn.from(range).into(tokenOut))
      const d = amountIn.into(tokenOut).sub(x0)

      const approx = slope.mul(d).add(q0)
      return approx
    } catch (e) {
      return this.action.outputToken[0].zero
    }
  }
  private async sample([column, row]: TokenQuantity[]): Promise<TokenQuantity> {
    const orderOfMagnitude = log2(column.amount)
    let in1 = 2n ** orderOfMagnitude
    let in0 = 2n ** (orderOfMagnitude + 1n)
    let range = in1 - in0

    let parts = range / RESOLUTION_COL
    parts = parts === 0n ? 1n : parts
    const lowerTick = (column.amount - in0) / parts
    in0 = in0 + lowerTick * parts
    in1 = in1 - (RESOLUTION_COL - (lowerTick + 1n)) * parts
    range = in1 - in0

    const results = await Promise.all([
      this.sampleRow(row, this.cachedResults.get(in0)),
      this.sampleRow(row, this.cachedResults.get(in1)),
    ])
    const q0 = results[0]
    const q1 = results[1]
    const s = q1.sub(q0)
    const tokenIn = column.token
    const tokenOut = this.action.outputToken[0]

    const x0 = tokenIn.from(in0).into(tokenOut)
    const slope = s.into(tokenOut).div(tokenIn.from(range).into(tokenOut))
    const d = column.into(tokenOut).sub(x0)

    const approx = slope.mul(d).add(q0)
    return approx
  }
  constructor(
    private readonly universe: Universe,
    private readonly action: BaseAction
  ) {}

  async quote(inputs: TokenQuantity[]): Promise<TokenQuantity> {
    if (
      this.block !== this.universe.currentBlock &&
      Date.now() - this.lastClear > 20000
    ) {
      this.cachedResults.clear()
      this.lastClear = Date.now()
      this.block = this.universe.currentBlock
    }
    return await this.sample(inputs)
  }
}
