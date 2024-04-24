import { type BaseAction as Action } from '../action/Action'
import { Token } from '../entities/Token'
import { DefaultMap } from '../base/DefaultMap'

export class Vertex {
  private readonly _outgoingEdges = new DefaultMap<Token, Action[]>(() => [])
  constructor(public readonly token: Token) {}
  public addOutgoing(edge: Action) {
    edge.outputToken.forEach((output) => this._outgoingEdges.get(output).push(edge))
  }

  get outgoingEdges(): Map<Token, Action[]> {
    return this._outgoingEdges
  }
}

export class Graph {
  public readonly vertices = new DefaultMap<Token, Vertex>(
    (token) => new Vertex(token)
  )
  public readonly graph = new DefaultMap<Token, DefaultMap<Token, Action[]>>(
    () => new DefaultMap(() => [])
  )

  addVertex(v: Token) {
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
    edge.outputToken.forEach((e) => this.addVertex(e))

    edge.inputToken.forEach((input) => {
      const subGraph = this.graph.get(input)
      edge.outputToken.forEach((output) => {
        subGraph.get(output).push(edge)
      })
    })
  }
}
