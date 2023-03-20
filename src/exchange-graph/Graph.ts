import { type Action } from '../action/Action'
import { type Token } from '../entities/Token'
import { DefaultMap } from '../base/DefaultMap'

export class Vertex {
  private readonly _outgoingEdges = new DefaultMap<Token, Action[]>(() => ([]))
  constructor (public readonly token: Token) { }
  public addOutgoing (edge: Action) {
    edge.output.forEach(output => this._outgoingEdges.get(output).push(edge))
  }

  get outgoingEdges (): Map<Token, Action[]> {
    return this._outgoingEdges
  }
}

export class Graph {
  public readonly vertices = new DefaultMap<Token, Vertex>((token) => new Vertex(token))
  public readonly graph = new DefaultMap<Token, DefaultMap<Token, Action[]>>(() => new DefaultMap(() => ([])))

  addVertex (v: Token) {
    if (this.vertices.has(v)) {
      return this.vertices.get(v)
    }
    const out = new Vertex(v)
    this.vertices.set(v, out)
    return out
  }

  addEdge (edge: Action) {
    edge.input.forEach(e => { this.addVertex(e).addOutgoing(edge) })
    edge.output.forEach(e => this.addVertex(e))

    edge.input.forEach(input => {
      const subGraph = this.graph.get(input)
      edge.output.forEach(output => {
        subGraph.get(output).push(edge)
      })
    })
  }
}
