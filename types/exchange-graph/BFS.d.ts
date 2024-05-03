import { type BaseAction as Action } from '../action/Action';
import { type Token } from '../entities/Token';
import { type Universe } from '../Universe';
import { SwapPlan } from '../searcher/Swap';
import { type Graph } from './Graph';
declare class ChoicesPrStep {
    readonly universe: Universe;
    readonly optionsPrStep: Action[][];
    constructor(universe: Universe, optionsPrStep: Action[][]);
    convertToSingularPaths(): SwapPlan[];
}
declare class BFSSearchResult {
    readonly input: Token;
    readonly steps: ChoicesPrStep[];
    readonly output: Token;
    constructor(input: Token, steps: ChoicesPrStep[], output: Token);
}
export declare const bfs: (universe: Universe, graph: Graph, start: Token, end: Token, maxLength: number) => BFSSearchResult;
export {};
//# sourceMappingURL=BFS.d.ts.map