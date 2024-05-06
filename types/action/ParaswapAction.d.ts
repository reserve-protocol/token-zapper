import { Transaction } from 'paraswap';
import { Address, TokenQuantity, Universe } from '..';
import { Approval } from '../base/Approval';
import { Planner, Value } from '../tx-gen/Planner';
import { DestinationOptions, InteractionConvention } from './Action';
declare const ParaswapAction_base: abstract new (address: Address, inputToken: import("..").Token[], outputToken: import("..").Token[], interactionConvention: InteractionConvention, proceedsOptions: DestinationOptions, approvals: Approval[]) => {
    readonly protocol: string;
    readonly gen: typeof import("../tx-gen/Planner");
    readonly genUtils: {
        planForwardERC20(universe: Universe<import("..").Config>, planner: Planner, token: import("..").Token, amount: Value, destination: Address): void;
        erc20: {
            transfer(universe: Universe<import("..").Config>, planner: Planner, amount: Value, token: import("..").Token, destination: Address): void;
            balanceOf(universe: Universe<import("..").Config>, planner: Planner, token: import("..").Token, owner: Address, comment?: string | undefined, varName?: string | undefined): Value;
        };
    };
    readonly supportsDynamicInput: boolean;
    readonly oneUsePrZap: boolean;
    readonly returnsOutput: boolean;
    readonly addressesInUse: Set<Address>;
    outputBalanceOf(universe: Universe<import("..").Config>, planner: Planner): Value[];
    readonly address: Address;
    readonly inputToken: import("..").Token[];
    readonly outputToken: import("..").Token[];
    readonly interactionConvention: InteractionConvention;
    readonly proceedsOptions: DestinationOptions;
    readonly approvals: Approval[];
    quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    quoteWithSlippage(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    gasEstimate(): bigint;
    exchange(amountsIn: TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
    plan(planner: Planner, inputs: Value[], destination: Address, predictedInputs: TokenQuantity[]): Promise<Value[] | null>;
    planWithOutput(universe: Universe<import("..").Config>, planner: Planner, inputs: Value[], destination: Address, predictedInputs: TokenQuantity[]): Promise<Value[]>;
    toString(): string;
    readonly addToGraph: boolean;
    readonly outputSlippage: bigint;
    combine(other: import("./Action").BaseAction): {
        new (universe: Universe<import("..").Config>): {
            readonly protocol: string;
            toString(): string;
            quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
            readonly supportsDynamicInput: boolean;
            readonly oneUsePrZap: boolean;
            readonly addressesInUse: Set<Address>;
            readonly returnsOutput: boolean;
            readonly outputSlippage: bigint;
            gasEstimate(): bigint;
            plan(planner: Planner, inputs: Value[], destination: Address, predicted: TokenQuantity[]): Promise<Value[] | null>;
            readonly universe: Universe<import("..").Config>;
            readonly gen: typeof import("../tx-gen/Planner");
            readonly genUtils: {
                planForwardERC20(universe: Universe<import("..").Config>, planner: Planner, token: import("..").Token, amount: Value, destination: Address): void;
                erc20: {
                    transfer(universe: Universe<import("..").Config>, planner: Planner, amount: Value, token: import("..").Token, destination: Address): void;
                    balanceOf(universe: Universe<import("..").Config>, planner: Planner, token: import("..").Token, owner: Address, comment?: string | undefined, varName?: string | undefined): Value;
                };
            };
            outputBalanceOf(universe: Universe<import("..").Config>, planner: Planner): Value[];
            readonly address: Address;
            readonly inputToken: import("..").Token[];
            readonly outputToken: import("..").Token[];
            readonly interactionConvention: InteractionConvention;
            readonly proceedsOptions: DestinationOptions;
            readonly approvals: Approval[];
            quoteWithSlippage(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
            exchange(amountsIn: TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
            planWithOutput(universe: Universe<import("..").Config>, planner: Planner, inputs: Value[], destination: Address, predictedInputs: TokenQuantity[]): Promise<Value[]>;
            readonly addToGraph: boolean;
            combine(other: import("./Action").BaseAction): {
                new (universe: Universe<import("..").Config>): any;
            };
        };
    };
};
export declare class ParaswapAction extends ParaswapAction_base {
    readonly universe: Universe;
    readonly tx: Transaction;
    readonly inputQuantity: TokenQuantity;
    readonly outputQuantity: TokenQuantity;
    plan(planner: Planner, inputs: Value[], destination: Address, predictedInputs: TokenQuantity[]): Promise<Value[]>;
    constructor(universe: Universe, tx: Transaction, inputQuantity: TokenQuantity, outputQuantity: TokenQuantity);
    quote(_: TokenQuantity[]): Promise<TokenQuantity[]>;
    gasEstimate(): bigint;
    toString(): string;
    static createAction(universe: Universe, input: TokenQuantity, output: TokenQuantity, tx: Transaction): ParaswapAction;
}
export {};
//# sourceMappingURL=ParaswapAction.d.ts.map