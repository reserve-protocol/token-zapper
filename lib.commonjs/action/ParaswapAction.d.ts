/// <reference types="node" />
import { Transaction } from "paraswap";
import { Address, TokenQuantity, Universe } from "..";
import { ContractCall } from "../base/ContractCall";
import { Action } from "./Action";
export declare class ParaswapAction extends Action {
    readonly universe: Universe;
    readonly tx: Transaction;
    readonly inputQuantity: TokenQuantity;
    readonly outputQuantity: TokenQuantity;
    constructor(universe: Universe, tx: Transaction, inputQuantity: TokenQuantity, outputQuantity: TokenQuantity);
    quote(_: TokenQuantity[]): Promise<TokenQuantity[]>;
    gasEstimate(): bigint;
    toString(): string;
    encode(amountsIn: TokenQuantity[], destination: Address, bytes?: Buffer | undefined): Promise<ContractCall>;
    static createAction(universe: Universe, input: TokenQuantity, output: TokenQuantity, tx: Transaction): ParaswapAction;
}
