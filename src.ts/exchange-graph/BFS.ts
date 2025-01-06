import { type BaseAction as Action } from '../action/Action'
import { Address } from '../base/Address'
import { type Token } from '../entities/Token'
import { SwapPlan } from '../searcher/Swap'
import { type Universe } from '../Universe'
import { type Graph } from './Graph'

class ChoicesPrStep {
  constructor(
    readonly universe: Universe,
    public readonly optionsPrStep: Action[][]
  ) {}

  convertToSingularPaths(): SwapPlan[] {
    const paths: SwapPlan[] = []

    const processLevel = (currentPath: Action[], level: number) => {
      if (level >= this.optionsPrStep.length) {
        paths.push(new SwapPlan(this.universe, currentPath))
        return
      }
      const prefix = currentPath
      for (const head of this.optionsPrStep[level]) {
        if (head == null) {
          break
        }
        const nextPath = prefix.concat(head)
        processLevel(nextPath, level + 1)
      }
    }

    processLevel([], 0)
    return paths
  }
}
class BFSSearchResult {
  constructor(
    public readonly input: Token,
    public readonly steps: ChoicesPrStep[],
    public readonly output: Token
  ) {}

  public get found() {
    return this.steps.length > 0
  }
}
class OpenSetNode {
  private constructor(
    readonly token: Token,
    readonly length: number,
    readonly transition: { actions: Action[]; node: OpenSetNode } | null
  ) {}

  hasVisited(token: Token) {
    let current = this as OpenSetNode
    while (current.transition != null) {
      if (current.token === token) {
        return true
      }
      current = current.transition.node
    }
    return current.token === token
  }

  createEdge(token: Token, actions: Action[]) {
    return new OpenSetNode(token, this.length + 1, { actions, node: this })
  }

  static createStart(token: Token) {
    return new OpenSetNode(token, 0, null)
  }
}
export const bfs = (
  universe: Universe,
  graph: Graph,
  start: Token,
  end: Token,
  maxLength: number
): BFSSearchResult => {
  const paths: ChoicesPrStep[] = []
  const openSet: OpenSetNode[] = []
  const recourse = (node: OpenSetNode) => {
    if (node.token === end) {
      let current = node
      const stepOptionsInReverse: Action[][] = []
      while (current.transition != null) {
        stepOptionsInReverse.push(current.transition.actions)
        current = current.transition.node
      }
      stepOptionsInReverse.reverse()
      const multiPath = new ChoicesPrStep(universe, stepOptionsInReverse)
      paths.push(multiPath)
      return
    }

    if (node.length >= maxLength) {
      return
    }
    const vertex = graph.vertices.get(node.token)
    for (const [nextToken, actions] of vertex.outgoingEdges) {
      if (node.hasVisited(nextToken)) {
        continue
      }

      if (actions.length === 0) {
        continue
      }
      openSet.push(node.createEdge(nextToken, actions))
    }
  }
  openSet.push(OpenSetNode.createStart(start))
  for (let i = 0; i < 10000; i++) {
    const node = openSet.shift()
    if (node == null) {
      break
    }
    recourse(node)
  }

  return new BFSSearchResult(start, paths, end)
}

export const shortestPath = (
  ctx: Universe,
  start: Token,
  end: Token,
  addressesUsed: Set<Address> = new Set()
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
  const incompatibleActions = new Set<Action>()
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
      if (
        actions.some((action) => {
          if (action.isTrade) {
            return true
          }
          if (!action.oneUsePrZap) {
            return false
          }
          if (incompatibleActions.has(action)) {
            return true
          }
          for (const addr of action.addressesInUse) {
            if (addressesUsed.has(addr)) {
              incompatibleActions.add(action)
              return true
            }
          }
          return false
        })
      ) {
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
