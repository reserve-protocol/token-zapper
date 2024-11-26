import { type BaseAction as Action } from '../action/Action'
import { Token } from '../entities/Token'
import { DefaultMap } from '../base/DefaultMap'

export class Vertex {
  private actions = new Set<Action>()
  private readonly _outgoingEdges = new DefaultMap<Token, Action[]>(() => [])
  private readonly _incomingEdges = new DefaultMap<Token, Action[]>(() => [])
  constructor(public readonly token: Token) {}
  public addOutgoing(edge: Action) {
    if (this.actions.has(edge)) {
      return
    }
    this.actions.add(edge)
    if (edge.inputToken.length !== 1) {
      return
    }
    edge.outputToken.forEach((output) =>
      this._outgoingEdges.get(output).push(edge)
    )
  }
  public addIncoming(edge: Action) {
    if (this.actions.has(edge)) {
      return
    }
    this.actions.add(edge)
    if (edge.outputToken.length !== 1) {
      return
    }

    edge.inputToken.forEach((input) =>
      this._incomingEdges.get(input).push(edge)
    )
  }

  get outgoingEdges(): Map<Token, Action[]> {
    return this._outgoingEdges
  }
  get incomingEdges(): Map<Token, Action[]> {
    return this._incomingEdges
  }
}

export class Graph {
  public readonly vertices = new DefaultMap<Token, Vertex>(
    (token) => new Vertex(token)
  )
  public readonly graph = new DefaultMap<Token, DefaultMap<Token, Action[]>>(
    () => new DefaultMap(() => [])
  )

  private addVertex(v: Token) {
    if (!(v instanceof Token)) {
      throw new Error('Not token')
    }
    if (this.vertices.has(v)) {
      return this.vertices.get(v)
    }
    const out = new Vertex(v)
    this.vertices.set(v, out)
    return out
  }

  addEdge(edge: Action) {
    edge.inputToken.forEach((e) => this.addVertex(e).addOutgoing(edge))
    edge.outputToken.forEach((e) => this.addVertex(e).addIncoming(edge))

    edge.inputToken.forEach((input) => {
      const subGraph = this.graph.get(input)
      edge.outputToken.forEach((output) => {
        subGraph.get(output).push(edge)
      })
    })
  }
}
