/// <reference types="node" />
import { Transaction } from "paraswap";
import { Address, TokenQuantity, Universe } from "..";
import { ContractCall } from "../base/ContractCall";
import { Action } from "./Action";
import { Planner, Value } from "../tx-gen/Planner";
export declare class ParaswapAction extends Action {
    readonly universe: Universe;
    readonly tx: Transaction;
    readonly inputQuantity: TokenQuantity;
    readonly outputQuantity: TokenQuantity;
    plan(planner: Planner, inputs: Value[], destination: Address, predictedInputs: TokenQuantity[]): Promise<Value[]>;
    constructor(universe: Universe, tx: Transaction, inputQuantity: TokenQuantity, outputQuantity: TokenQuantity);
    quote(_: TokenQuantity[]): Promise<TokenQuantity[]>;
    gasEstimate(): bigint;
    toString(): string;
    encode(amountsIn: TokenQuantity[], destination: Address, bytes?: Buffer | undefined): Promise<ContractCall>;
    static createAction(universe: Universe, input: TokenQuantity, output: TokenQuantity, tx: Transaction): ParaswapAction;
}
//# sourceMappingURL=ParaswapAction.d.ts.map