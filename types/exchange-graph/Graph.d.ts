import { type BaseAction as Action } from '../action/Action';
import { Token } from '../entities/Token';
import { DefaultMap } from '../base/DefaultMap';
export declare class Vertex {
    readonly token: Token;
    private readonly _outgoingEdges;
    constructor(token: Token);
    addOutgoing(edge: Action): void;
    get outgoingEdges(): Map<Token, Action[]>;
}
export declare class Graph {
    readonly vertices: DefaultMap<Token, Vertex>;
    readonly graph: DefaultMap<Token, DefaultMap<Token, Action[]>>;
    addVertex(v: Token): Vertex;
    addEdge(edge: Action): void;
}
//# sourceMappingURL=Graph.d.ts.map