"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bfs = void 0;
const Swap_1 = require("../searcher/Swap");
class ChoicesPrStep {
    universe;
    optionsPrStep;
    constructor(universe, optionsPrStep) {
        this.universe = universe;
        this.optionsPrStep = optionsPrStep;
    }
    convertToSingularPaths() {
        const paths = [];
        const processLevel = (currentPath, level) => {
            if (level >= this.optionsPrStep.length) {
                paths.push(new Swap_1.SwapPlan(this.universe, currentPath));
                return;
            }
            const prefix = currentPath;
            for (const head of this.optionsPrStep[level]) {
                if (head == null) {
                    break;
                }
                const nextPath = prefix.concat(head);
                processLevel(nextPath, level + 1);
            }
        };
        processLevel([], 0);
        return paths;
    }
}
class BFSSearchResult {
    input;
    steps;
    output;
    constructor(input, steps, output) {
        this.input = input;
        this.steps = steps;
        this.output = output;
    }
}
class OpenSetNode {
    token;
    length;
    transition;
    constructor(token, length, transition) {
        this.token = token;
        this.length = length;
        this.transition = transition;
    }
    hasVisited(token) {
        let current = this;
        while (current.transition != null) {
            if (current.token === token) {
                return true;
            }
            current = current.transition.node;
        }
        return current.token === token;
    }
    createEdge(token, actions) {
        return new OpenSetNode(token, this.length + 1, { actions, node: this });
    }
    static createStart(token) {
        return new OpenSetNode(token, 0, null);
    }
}
const bfs = (universe, graph, start, end, maxLength) => {
    const paths = [];
    const openSet = [];
    const recourse = (node) => {
        if (node.token === end) {
            let current = node;
            const stepOptionsInReverse = [];
            while (current.transition != null) {
                stepOptionsInReverse.push(current.transition.actions);
                current = current.transition.node;
            }
            stepOptionsInReverse.reverse();
            const multiPath = new ChoicesPrStep(universe, stepOptionsInReverse);
            paths.push(multiPath);
            return;
        }
        if (node.length >= maxLength) {
            return;
        }
        const vertex = graph.vertices.get(node.token);
        for (const [nextToken, actions] of vertex.outgoingEdges) {
            if (node.hasVisited(nextToken)) {
                continue;
            }
            if (actions.length === 0) {
                continue;
            }
            openSet.push(node.createEdge(nextToken, actions));
        }
    };
    openSet.push(OpenSetNode.createStart(start));
    for (let i = 0; i < 10000; i++) {
        const node = openSet.pop();
        if (node == null) {
            break;
        }
        recourse(node);
    }
    return new BFSSearchResult(start, paths, end);
};
exports.bfs = bfs;
//# sourceMappingURL=BFS.js.map