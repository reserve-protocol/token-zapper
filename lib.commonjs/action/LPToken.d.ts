import { type Address } from '../base/Address';
import { type Token, type TokenQuantity } from '../entities/Token';
import { Planner, Value } from '../tx-gen/Planner';
import { Action } from './Action';
export declare class LPToken {
    readonly token: Token;
    readonly poolTokens: Token[];
    readonly burn: (amount: TokenQuantity) => Promise<TokenQuantity[]>;
    readonly mint: (amountsIn: TokenQuantity[]) => Promise<TokenQuantity>;
    readonly planBurn?: ((planner: Planner, inputs: Value[], destination: Address) => Promise<Value[]>) | undefined;
    readonly mintAction: Action;
    readonly burnAction: Action;
    constructor(token: Token, poolTokens: Token[], burn: (amount: TokenQuantity) => Promise<TokenQuantity[]>, mint: (amountsIn: TokenQuantity[]) => Promise<TokenQuantity>, planBurn?: ((planner: Planner, inputs: Value[], destination: Address) => Promise<Value[]>) | undefined);
    toString(): string;
}
export declare class LPTokenMint extends Action {
    readonly lpToken: LPToken;
    plan(planner: Planner, inputs: Value[], destination: Address): Promise<Value[]>;
    toString(): string;
    quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    gasEstimate(): bigint;
    constructor(lpToken: LPToken);
}
export declare class LPTokenBurn extends Action {
    readonly lpToken: LPToken;
    plan(planner: Planner, inputs: Value[], destination: Address): Promise<Value[]>;
    toString(): string;
    quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    gasEstimate(): bigint;
    constructor(lpToken: LPToken);
}
