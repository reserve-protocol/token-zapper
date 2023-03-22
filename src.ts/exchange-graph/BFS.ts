import { type Action } from '../action/Action'
import { type Token } from '../entities/Token'
import { type Universe } from '../Universe'
import { SwapPlan } from '../searcher/Swap'
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
    const node = openSet.pop()
    if (node == null) {
      break
    }
    recourse(node)
  }

  return new BFSSearchResult(start, paths, end)
}
