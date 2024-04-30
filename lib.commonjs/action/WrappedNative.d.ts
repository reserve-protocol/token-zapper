import { type Token, type TokenQuantity } from '../entities/Token';
import { type Universe } from '../Universe';
import { InteractionConvention, DestinationOptions } from './Action';
import * as gen from '../tx-gen/Planner';
import { Address } from '..';
declare const DepositAction_base: abstract new (address: Address, inputToken: Token[], outputToken: Token[], interactionConvention: InteractionConvention, proceedsOptions: DestinationOptions, approvals: import("../base/Approval").Approval[]) => {
    readonly protocol: string;
    readonly gen: typeof gen;
    readonly genUtils: {
        planForwardERC20(universe: Universe<import("..").Config>, planner: gen.Planner, token: Token, amount: gen.Value, destination: Address): void;
        erc20: {
            transfer(universe: Universe<import("..").Config>, planner: gen.Planner, amount: gen.Value, token: Token, destination: Address): void;
            balanceOf(universe: Universe<import("..").Config>, planner: gen.Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): gen.Value;
        };
    };
    outputBalanceOf(universe: Universe<import("..").Config>, planner: gen.Planner): gen.Value[];
    readonly address: Address;
    readonly inputToken: Token[];
    readonly outputToken: Token[];
    readonly interactionConvention: InteractionConvention;
    readonly proceedsOptions: DestinationOptions;
    readonly approvals: import("../base/Approval").Approval[];
    quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    quoteWithSlippage(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    gasEstimate(): bigint;
    exchange(amountsIn: TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
    plan(planner: gen.Planner, inputs: gen.Value[], destination: Address, predictedInputs: TokenQuantity[], outputNotUsed?: boolean | undefined): Promise<gen.Value[]>;
    toString(): string;
    readonly addToGraph: boolean;
    readonly outputSlippage: bigint;
};
export declare class DepositAction extends DepositAction_base {
    readonly universe: Universe;
    readonly wrappedToken: Token;
    gasEstimate(): bigint;
    plan(planner: gen.Planner, inputs: gen.Value[], destination: Address): Promise<gen.Value[]>;
    quote([qty]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, wrappedToken: Token);
    toString(): string;
}
declare const WithdrawAction_base: abstract new (address: Address, inputToken: Token[], outputToken: Token[], interactionConvention: InteractionConvention, proceedsOptions: DestinationOptions, approvals: import("../base/Approval").Approval[]) => {
    readonly protocol: string;
    readonly gen: typeof gen;
    readonly genUtils: {
        planForwardERC20(universe: Universe<import("..").Config>, planner: gen.Planner, token: Token, amount: gen.Value, destination: Address): void;
        erc20: {
            transfer(universe: Universe<import("..").Config>, planner: gen.Planner, amount: gen.Value, token: Token, destination: Address): void;
            balanceOf(universe: Universe<import("..").Config>, planner: gen.Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): gen.Value;
        };
    };
    outputBalanceOf(universe: Universe<import("..").Config>, planner: gen.Planner): gen.Value[];
    readonly address: Address;
    readonly inputToken: Token[];
    readonly outputToken: Token[];
    readonly interactionConvention: InteractionConvention;
    readonly proceedsOptions: DestinationOptions;
    readonly approvals: import("../base/Approval").Approval[];
    quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    quoteWithSlippage(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    gasEstimate(): bigint;
    exchange(amountsIn: TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
    plan(planner: gen.Planner, inputs: gen.Value[], destination: Address, predictedInputs: TokenQuantity[], outputNotUsed?: boolean | undefined): Promise<gen.Value[]>;
    toString(): string;
    readonly addToGraph: boolean;
    readonly outputSlippage: bigint;
};
export declare class WithdrawAction extends WithdrawAction_base {
    readonly universe: Universe;
    readonly wrappedToken: Token;
    gasEstimate(): bigint;
    plan(planner: gen.Planner, inputs: gen.Value[], destination: Address): Promise<gen.Value[]>;
    quote([qty]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, wrappedToken: Token);
    toString(): string;
}
export {};
