import { type Address } from '../base/Address';
import { type Token, type TokenQuantity } from '../entities/Token';
import { type Universe } from '../Universe';
import { Action } from './Action';
import { ContractCall } from '../base/ContractCall';
import { Planner, Value } from '../tx-gen/Planner';
export declare class MintSATokensAction extends Action {
    readonly universe: Universe;
    readonly underlying: Token;
    readonly saToken: Token;
    private readonly rate;
    get outputSlippage(): bigint;
    plan(planner: Planner, inputs: Value[], destination: Address): Promise<import("../tx-gen/Planner").ReturnValue[]>;
    gasEstimate(): bigint;
    encode([amountsIn]: TokenQuantity[], destination: Address): Promise<ContractCall>;
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, underlying: Token, saToken: Token, rate: {
        value: bigint;
    });
    toString(): string;
}
export declare class BurnSATokensAction extends Action {
    readonly universe: Universe;
    readonly underlying: Token;
    readonly saToken: Token;
    private readonly rate;
    get outputSlippage(): bigint;
    plan(planner: Planner, inputs: Value[], destination: Address): Promise<import("../tx-gen/Planner").ReturnValue[]>;
    gasEstimate(): bigint;
    encode([amountsIn]: TokenQuantity[], destination: Address): Promise<ContractCall>;
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, underlying: Token, saToken: Token, rate: {
        value: bigint;
    });
    toString(): string;
}
//# sourceMappingURL=SATokens.d.ts.map