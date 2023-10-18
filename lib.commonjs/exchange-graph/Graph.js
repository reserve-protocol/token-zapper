"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Graph = exports.Vertex = void 0;
const Token_1 = require("../entities/Token");
const DefaultMap_1 = require("../base/DefaultMap");
class Vertex {
    token;
    _outgoingEdges = new DefaultMap_1.DefaultMap(() => []);
    constructor(token) {
        this.token = token;
    }
    addOutgoing(edge) {
        edge.output.forEach((output) => this._outgoingEdges.get(output).push(edge));
    }
    get outgoingEdges() {
        return this._outgoingEdges;
    }
}
exports.Vertex = Vertex;
class Graph {
    vertices = new DefaultMap_1.DefaultMap((token) => new Vertex(token));
    graph = new DefaultMap_1.DefaultMap(() => new DefaultMap_1.DefaultMap(() => []));
    addVertex(v) {
        if (!(v instanceof Token_1.Token)) {
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
        edge.input.forEach((e) => this.addVertex(e).addOutgoing(edge));
        edge.output.forEach((e) => this.addVertex(e));
        edge.input.forEach((input) => {
            const subGraph = this.graph.get(input);
            edge.output.forEach((output) => {
                subGraph.get(output).push(edge);
            });
        });
    }
}
exports.Graph = Graph;
//# sourceMappingURL=Graph.js.map