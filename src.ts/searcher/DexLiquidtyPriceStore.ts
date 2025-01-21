import { DefaultMap } from '../base/DefaultMap'
import { Universe } from '../Universe'
import { BaseAction } from '../action/Action'
import { shortestPath } from '../exchange-graph/BFS'
import { Token, TokenQuantity } from '../entities/Token'
import { wrapAction } from './TradeAction'
import { optimiseTradesInOutQty } from './optimiseTrades'

export class DexLiquidtyPriceStore {
  private shortestPaths = new DefaultMap<
    Token,
    DefaultMap<Token, BaseAction[][]>
  >(
    (token) =>
      new DefaultMap<Token, BaseAction[][]>((target) =>
        this.computeTradesPath(token, target)
      )
  )

  private computeTradesPath(token: Token, target: Token) {
    console.log(`Computing trades path from ${token} to ${target}`)
    let path = shortestPath(
      this.universe,
      token,
      target,
      (act) => act.is1to1 && act.isTrade
    )
    const weth = this.universe.wrappedNativeToken
    const eth = this.universe.nativeToken

    path = path.map((t) => (t === eth ? weth : t))
    console.log(`Got token path ${path.join(' -> ')}`)
    let out: BaseAction[][] = []
    for (let step = 0; step < path.length - 1; step++) {
      const from = path[step]
      const to = path[step + 1]
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
      console.log(
        `Got trade actions ${tradeActions
          .map((act) => `${act.protocol}.${act.actionName}`)
          .join(', ')}`
      )
      out.push(tradeActions.map((act) => wrapAction(this.universe, act)))
    }

    return out
  }

  private async evaluateTradeActions(
    input: TokenQuantity,
    path: BaseAction[][]
  ) {
    const inputNum = input.asNumber()
    let legAmt = input
    for (const actions of path) {
      const res = await optimiseTradesInOutQty(legAmt, actions)
      legAmt = actions[0].outputToken[0].from(res.output)
    }
    return {
      output: legAmt,
      price: legAmt.asNumber() / inputNum,
    }
  }

  public async getPrice(input: TokenQuantity, quote: Token) {
    const path = this.shortestPaths.get(input.token).get(quote)
    const res = await this.evaluateTradeActions(input, path)
    return res
  }

  constructor(private readonly universe: Universe) {}
}
