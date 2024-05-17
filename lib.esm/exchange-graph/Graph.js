import { Token } from '../entities/Token';
import { DefaultMap } from '../base/DefaultMap';
export class Vertex {
    token;
    _outgoingEdges = new DefaultMap(() => []);
    constructor(token) {
        this.token = token;
    }
    addOutgoing(edge) {
        edge.outputToken.forEach((output) => this._outgoingEdges.get(output).push(edge));
    }
    get outgoingEdges() {
        return this._outgoingEdges;
    }
}
export class Graph {
    vertices = new DefaultMap((token) => new Vertex(token));
    graph = new DefaultMap(() => new DefaultMap(() => []));
    addVertex(v) {
        if (!(v instanceof Token)) {
            throw new Error('Not token');
        }
        if (this.vertices.has(v)) {
            return this.vertices.get(v);
        }
        const out = new Vertex(v);
        this.vertices.set(v, out);
        return out;
    }
    addEdge(edge) {
        edge.inputToken.forEach((e) => this.addVertex(e).addOutgoing(edge));
        edge.outputToken.forEach((e) => this.addVertex(e));
        edge.inputToken.forEach((input) => {
            const subGraph = this.graph.get(input);
            edge.outputToken.forEach((output) => {
                subGraph.get(output).push(edge);
            });
        });
    }
}
//# sourceMappingURL=Graph.js.map