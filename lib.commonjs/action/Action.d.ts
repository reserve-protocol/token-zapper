/// <reference types="node" />
import { Address } from '../base/Address';
import { type Token, type TokenQuantity } from '../entities/Token';
import { TokenAmounts } from '../entities/TokenAmounts';
import { type Approval } from '../base/Approval';
import { type ContractCall } from '../base/ContractCall';
import * as gen from '../tx-gen/Planner';
import { Universe } from '..';
export declare enum InteractionConvention {
    PayBeforeCall = 0,
    CallbackBased = 1,
    ApprovalRequired = 2,
    None = 3
}
export declare enum DestinationOptions {
    Recipient = 0,
    Callee = 1
}
export declare const plannerUtils: {
    planForwardERC20(universe: Universe, planner: gen.Planner, token: Token, amount: gen.Value, destination: Address): void;
    erc20: {
        transfer(universe: Universe, planner: gen.Planner, amount: gen.Value, token: Token, destination: Address): void;
        balanceOf(universe: Universe, planner: gen.Planner, token: Token, owner: Address, comment?: string, varName?: string): gen.Value;
    };
};
export declare abstract class Action {
    readonly address: Address;
    readonly input: readonly Token[];
    readonly output: readonly Token[];
    readonly interactionConvention: InteractionConvention;
    readonly proceedsOptions: DestinationOptions;
    readonly approvals: readonly Approval[];
    protected readonly gen: typeof gen;
    protected readonly genUtils: {
        planForwardERC20(universe: Universe<import("..").Config>, planner: gen.Planner, token: Token, amount: gen.Value, destination: Address): void;
        erc20: {
            transfer(universe: Universe<import("..").Config>, planner: gen.Planner, amount: gen.Value, token: Token, destination: Address): void;
            balanceOf(universe: Universe<import("..").Config>, planner: gen.Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): gen.Value;
        };
    };
    constructor(address: Address, input: readonly Token[], output: readonly Token[], interactionConvention: InteractionConvention, proceedsOptions: DestinationOptions, approvals: readonly Approval[]);
    abstract quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    quoteWithSlippage(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    abstract gasEstimate(): bigint;
    exchange(amountsIn: TokenQuantity[], balances: TokenAmounts): Promise<void>;
    abstract encode(amountsIn: TokenQuantity[], destination: Address, bytes?: Buffer): Promise<ContractCall>;
    abstract plan(planner: gen.Planner, inputs: gen.Value[], destination: Address, predictedInputs: TokenQuantity[], outputNotUsed?: boolean): Promise<gen.Value[]>;
    toString(): string;
    get addToGraph(): boolean;
    get outputSlippage(): bigint;
}
