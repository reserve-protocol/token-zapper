import { BaseAction, type BaseAction as Action } from '../action/Action'
import { UniswapV2Swap } from '../configuration/setupUniswapV2'
import { TokenQuantity, type Token } from '../entities/Token'
import { Queue } from '../searcher/Queue'
import { Universe } from '../Universe'

type Node = {
  previous: Node | null
  token: Token
  steps: number
  action: BaseAction
  legAmount: TokenQuantity[]
}
const getPath = (node: Node) => {
  const path: Token[] = []
  let current = node
  while (true) {
    path.push(current.token)
    if (current.previous == null) {
      break
    }
    current = current.previous
  }
  return path.reverse()
}
const getActions = (node: Node) => {
  const actions: Action[] = []
  let current = node
  while (true) {
    if (current.action != null) {
      actions.push(current.action)
    }
    if (current.previous == null) {
      break
    }
    current = current.previous
  }
  return actions.reverse()
}
const includes = (node: Node, token: Token) => {
  let current = node
  while (true) {
    if (current.token === token) {
      return true
    }
    if (current.previous == null) {
      break
    }
    current = current.previous
  }
  return false
}

export const reachableTokens = async (ctx: Universe) => {
  const toVisit = new Queue<Token>()
  toVisit.push(ctx.wrappedNativeToken)

  const visited = new Map<Token, number>()
  while (!toVisit.isEmpty) {
    const token = toVisit.pop()
    if (visited.has(token)) {
      continue
    }

    const vertex = ctx.graph.vertices.get(token)
    const outgoing = [...vertex.outgoingEdges]

    let liq = visited.get(token) ?? 0
    await Promise.all(
      outgoing.map(async ([nextToken, actions]) => {
        await Promise.all(
          actions.map(async (action) => {
            if (
              action.isTrade &&
              (action.inputToken.includes(ctx.wrappedNativeToken) ||
                action.outputToken.includes(ctx.wrappedNativeToken))
            ) {
              const balance = await ctx.balanceOf(
                ctx.wrappedNativeToken,
                action.address
              )
              liq += balance.asNumber()
            }
          })
        )
        toVisit.push(nextToken)
      })
    )

    visited.set(token, liq)
  }
  const out = [...visited].map(([token, liq]) => ({ token, liq }))
  out.sort((l, r) => r.liq - l.liq)
  return out.map((i) => ({
    token: i.token,
    liquidity: i.liq,
  }))
}

export const computePreferredTokenSet = (
  ctx: Universe,
  from: Token,
  to: Token,
  maxSteps: number
) => {
  const out = new Set<Token>()
  const toVisit = new Queue<{
    token: Token
    steps: number
    tokens: Token[]
  }>()
  const visited = new Set<Token>()
  toVisit.push({
    token: from,
    tokens: [from],
    steps: 0,
  })

  while (!toVisit.isEmpty) {
    const node = toVisit.pop()

    if (node.steps > maxSteps) {
      continue
    }
    if (node.token === to) {
      for (const token of node.tokens) {
        out.add(token)
      }
      continue
    }
    visited.add(node.token)

    const vertex = ctx.graph.vertices.get(node.token)
    for (const [nextToken] of vertex.outgoingEdges) {
      if (visited.has(nextToken) || ctx.blacklistedTokens.has(nextToken)) {
        continue
      }

      toVisit.push({
        token: nextToken,
        tokens: [...node.tokens, nextToken],
        steps: node.steps + 1,
      })
    }
  }

  return out
}

export const bestPath = async (
  ctx: Universe,
  start: TokenQuantity,
  end: Token,
  idealNumberOfSteps: number,
  maxSteps: number,
  tokensMustBePriced: boolean
): Promise<
  Map<Token, { path: Token[]; actions: Action[]; legAmount: TokenQuantity[] }>
> => {
  const graph = ctx.graph
  const result = new Map<
    Token,
    { path: Token[]; actions: Action[]; legAmount: TokenQuantity[] }
  >()

  if (idealNumberOfSteps === 0) {
    const directEdges = graph.vertices.get(start.token).outgoingEdges.get(end)
    if (directEdges != null && directEdges.length > 0) {
      return new Map([
        [
          end,
          {
            path: [start.token, end],
            actions: directEdges.filter((i) => i.is1to1),
            legAmount: [start],
          },
        ],
      ])
    }
  }

  const preferedTokens = computePreferredTokenSet(
    ctx,
    start.token,
    end,
    maxSteps
  )

  if (preferedTokens.size === 0) {
    return new Map()
  }

  const toVisit = new Queue<Node>()
  toVisit.push({
    previous: null,
    steps: 0,
    action: null as any,
    token: start.token,
    legAmount: [start],
  })

  while (!toVisit.isEmpty) {
    const node = toVisit.pop()
    const lastToken = node.token
    if (ctx.blacklistedTokens.has(lastToken)) {
      continue
    }
    let previous = result.get(lastToken)
    if (previous == null) {
      result.set(lastToken, {
        path: getPath(node),
        actions: getActions(node),
        legAmount: node.legAmount,
      })
    } else {
      if (previous.legAmount[0].amount < node.legAmount[0].amount) {
        result.set(lastToken, {
          path: getPath(node),
          actions: getActions(node),
          legAmount: node.legAmount,
        })
      } else {
        continue
      }
    }
    if (lastToken === end) {
      continue
    }

    if (node.steps >= maxSteps) {
      continue
    }
    if (node.steps >= idealNumberOfSteps) {
      if (result.has(end)) {
        continue
      }
    }
    const vertex = graph.vertices.get(node.token)
    await Promise.all(
      [...vertex.outgoingEdges]
        .filter(([nextToken]) => {
          if (ctx.blacklistedTokens.has(nextToken)) {
            return false
          }
          if (preferedTokens != null && !preferedTokens.has(nextToken)) {
            return false
          }
          return !includes(node, nextToken)
        })
        .map(async ([nextToken, actions]) => {
          if (nextToken !== end) {
            if (graph.vertices.get(nextToken).outgoingEdges.size <= 1) {
              return
            }
          }
          if (ctx.blacklistedTokens.has(nextToken)) {
            return
          }
          await Promise.all(
            actions
              .filter((action) => action.is1to1)
              .map(async (action) => {
                try {
                  // if (action.isTrade) {
                  //   const bals = await action.balances(
                  //     ctx,
                  //     node.legAmount[0].token
                  //   )
                  //   const bal = bals.find(
                  //     (b) => b.token === node.legAmount[0].token
                  //   )
                  //   if (bal == null) {
                  //     return
                  //   }
                  //   if (bal.amount < minAmount) {
                  //     return
                  //   }
                  // }
                  let newLegAmount
                  if (action instanceof UniswapV2Swap) {
                    newLegAmount = await action.quoteWithoutFeeCheck(
                      node.legAmount
                    )
                  } else {
                    newLegAmount = await action.quote(node.legAmount)
                  }
                  if (newLegAmount[0].amount === 0n) {
                    return
                  }
                  if (
                    result.get(nextToken)?.legAmount[0].amount ??
                    0n > newLegAmount[0].amount
                  ) {
                    return
                  }
                  if (newLegAmount[0].token !== nextToken) {
                    console.log(
                      `newLegAmount[0].token !== nextToken ${newLegAmount[0].token} !== ${nextToken}`
                    )
                    console.log(action.inputToken.join(', '))
                    console.log(action.outputToken.join(', '))
                    return
                  }
                  toVisit.push({
                    previous: node,
                    token: nextToken,
                    steps: node.steps + 1,
                    legAmount: newLegAmount,
                    action: action,
                  })
                } catch (e) {}
              })
          )
        })
    )
  }
  return result
}

export const shortestPath = (
  ctx: Universe,
  start: Token,
  end: Token,
  predicate: (act: BaseAction) => boolean
) => {
  const graph = ctx.graph
  const visited = new Set<Token>()
  const toVisit: {
    path: Token[]
    weight: number
  }[] = [
    {
      path: [start],
      weight: 0,
    },
  ]

  const results: {
    path: Token[]
    weight: number
  }[] = []
  visited.add(start)
  while (toVisit.length !== 0) {
    const node = toVisit.shift()!

    const previous = node.path.at(-1)!
    if (previous === end) {
      results.push(node)
      continue
    }
    if (!graph.vertices.has(previous)) {
      continue
    }
    for (const [nextToken, actions] of graph.vertices
      .get(previous)
      .outgoingEdges.entries()) {
      if (!actions.some((action) => predicate(action))) {
        continue
      }
      if (ctx.blacklistedTokens.has(nextToken)) {
        continue
      }

      if (nextToken !== end) {
        if (visited.has(nextToken)) {
          continue
        }
        visited.add(nextToken)
      }

      let tokenWeight = 1

      if (ctx.lpTokens.has(nextToken)) {
        tokenWeight = ctx.lpTokens.get(nextToken)!.poolTokens.length ** 2
      }
      if (ctx.rTokensInfo.tokens.has(nextToken)) {
        tokenWeight = ctx.getRTokenDeployment(nextToken).basket.length
      }

      toVisit.push({
        path: [...node.path, nextToken],
        weight: node.weight + tokenWeight,
      })
    }
  }

  results.sort((l, r) => l.weight - r.weight)
  if (results.length === 0) {
    return []
  }
  return results[0].path
}
