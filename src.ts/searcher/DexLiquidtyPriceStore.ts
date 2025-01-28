import { DefaultMap } from '../base/DefaultMap'
import { Universe } from '../Universe'
import { BaseAction } from '../action/Action'
import { bestPath } from '../exchange-graph/BFS'
import { Token, TokenQuantity } from '../entities/Token'
import { unwrapAction, wrapAction } from './TradeAction'
import { optimiseTradesInOutQty } from './optimiseTrades'

export class DexLiquidtyPriceStore {
  private bestPathCache = new DefaultMap<
    Token,
    Map<Token, Promise<BaseAction[][]>>
  >(() => new Map<Token, Promise<BaseAction[][]>>())

  private async computeTradesPath(input: TokenQuantity, target: Token) {
    let path = this.bestPathCache.get(input.token).get(target)
    if (path != null) {
      return path
    }

    path = new Promise(async (resolve, reject) => {
      try {
        const tokenPath = await bestPath(this.universe, input, target, 1).then(
          (m) => m.get(target)?.path ?? []
        )
        if (tokenPath.length === 0) {
          throw Error(`No path found from ${input.token} to ${target}`)
        }

        let out: BaseAction[][] = []

        for (let step = 0; step < tokenPath.length - 1; step++) {
          const from = tokenPath[step]
          const to = tokenPath[step + 1]
          if (from === to) {
            continue
          }
          const tradeActions =
            this.universe.graph.vertices
              .get(from)
              .outgoingEdges.get(to)
              ?.filter((e) => e.is1to1 && e.isTrade) ?? []
          if (tradeActions.length === 0) {
            throw new Error(`No trade actions found for ${from} to ${to}`)
          }
          out.push(tradeActions.map((act) => wrapAction(this.universe, act)))
          this.bestPathCache.get(input.token).set(to, Promise.resolve([...out]))
        }
        resolve(out)
      } catch (e) {
        console.error(
          `Error computing trades path from ${input.token} to ${target}: ${e}`
        )
        reject(e)
      }
    })
    this.bestPathCache.get(input.token).set(target, path)
    try {
      return await path
    } catch (e) {
      this.bestPathCache.get(input.token).delete(target)
      throw e
    }
  }

  private async evaluateTradeActions(
    input: TokenQuantity,
    path: BaseAction[][]
  ) {
    const inputNum = input.asNumber()
    let legAmt = input
    const steps: {
      input: TokenQuantity
      actions: BaseAction[]
      splits: number[]
      output: TokenQuantity
    }[] = []
    for (const actions of path) {
      const res = await optimiseTradesInOutQty(legAmt, actions, 4)

      const sum = res.inputs.reduce((l, r) => l + r, 0)
      const splits = res.inputs.map((i) => i / sum)

      const out = (
        await Promise.all(
          actions
            .map((act, index) => [act, splits[index]] as const)
            .filter(([_, input]) => input !== 0)
            .map(async ([act, inp]) => {
              const input = legAmt.mul(legAmt.token.from(inp))
              const out = await unwrapAction(act)
                .quote([input])
                .catch(() => {
                  return [act.outputToken[0].zero]
                })

              return out
            })
        )
      ).reduce((l, r) => [l[0].add(r[0])])

      steps.push({
        input: legAmt,
        actions: actions.filter((_, index) => res.inputs[index] !== 0),
        splits: res.inputs.filter((i) => i !== 0),
        output: out[0],
      })
      legAmt = out[0]
    }
    return {
      output: legAmt,
      price: legAmt.asNumber() / inputNum,
      steps,
    }
  }

  public async getBestQuotePath(input: TokenQuantity, quote: Token) {
    const path = await this.computeTradesPath(input, quote)
    return await this.evaluateTradeActions(input, path)
  }

  constructor(private readonly universe: Universe) {}
}
