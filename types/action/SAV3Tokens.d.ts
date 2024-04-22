import { type Universe } from '../Universe';
import { type Address } from '../base/Address';
import { type Token, type TokenQuantity } from '../entities/Token';
import { Planner, Value } from '../tx-gen/Planner';
import { Action } from './Action';
export declare class MintSAV3TokensAction extends Action {
    readonly universe: Universe;
    readonly underlying: Token;
    readonly saToken: Token;
    private readonly rate;
    get outputSlippage(): bigint;
    plan(planner: Planner, inputs: Value[], destination: Address, predicted: TokenQuantity[]): Promise<Value[]>;
    gasEstimate(): bigint;
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, underlying: Token, saToken: Token, rate: {
        value: bigint;
    });
    toString(): string;
}
export declare class BurnSAV3TokensAction extends Action {
    readonly universe: Universe;
    readonly underlying: Token;
    readonly saToken: Token;
    private readonly rate;
    private inst;
    get outputSlippage(): bigint;
    plan(planner: Planner, inputs: Value[], destination: Address, predicted: TokenQuantity[]): Promise<Value[]>;
    gasEstimate(): bigint;
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, underlying: Token, saToken: Token, rate: {
        value: bigint;
    });
    toString(): string;
}
//# sourceMappingURL=SAV3Tokens.d.ts.map