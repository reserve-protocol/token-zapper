import { type Token, type TokenQuantity } from '../entities/Token';
import { type Universe } from '../Universe';
import { Action } from './Action';
import { Planner, Value } from '../tx-gen/Planner';
export declare class StETHRateProvider {
    readonly universe: Universe;
    readonly steth: Token;
    constructor(universe: Universe, steth: Token);
    quoteMint(amountsIn: TokenQuantity): Promise<TokenQuantity>;
    quoteBurn(amountsIn: TokenQuantity): Promise<TokenQuantity>;
}
export declare class MintStETH extends Action {
    readonly universe: Universe;
    readonly steth: Token;
    readonly rateProvider: Pick<StETHRateProvider, 'quoteMint'>;
    plan(planner: Planner, inputs: Value[]): Promise<Value[]>;
    gasEstimate(): bigint;
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, steth: Token, rateProvider: Pick<StETHRateProvider, 'quoteMint'>);
    toString(): string;
}
export declare class BurnStETH extends Action {
    readonly universe: Universe;
    readonly steth: Token;
    readonly rateProvider: Pick<StETHRateProvider, 'quoteBurn'>;
    gasEstimate(): bigint;
    plan(planner: Planner, inputs: Value[]): Promise<Value[]>;
    quote([qty]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, steth: Token, rateProvider: Pick<StETHRateProvider, 'quoteBurn'>);
    toString(): string;
    /**
     * Prevents this edge of being picked up by the graph searcher, but it can still be used
     * by the zapper.
     */
    get addToGraph(): boolean;
}
//# sourceMappingURL=StEth.d.ts.map