import { Address } from '../base/Address';
import { type Token, type TokenQuantity } from '../entities/Token';
import { TokenAmounts } from '../entities/TokenAmounts';
import { type Approval } from '../base/Approval';
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
export declare enum EdgeType {
    MINT = 0,
    BURN = 1,
    SWAP = 2
}
export declare const plannerUtils: {
    planForwardERC20(universe: Universe, planner: gen.Planner, token: Token, amount: gen.Value, destination: Address): void;
    erc20: {
        transfer(universe: Universe, planner: gen.Planner, amount: gen.Value, token: Token, destination: Address): void;
        balanceOf(universe: Universe, planner: gen.Planner, token: Token, owner: Address, comment?: string, varName?: string): gen.Value;
    };
};
export declare abstract class BaseAction {
    _address: Address;
    readonly inputToken: Token[];
    readonly outputToken: Token[];
    _interactionConvention: InteractionConvention;
    _proceedsOptions: DestinationOptions;
    _approvals: Approval[];
    readonly gen: typeof gen;
    readonly genUtils: {
        planForwardERC20(universe: Universe<import("..").Config>, planner: gen.Planner, token: Token, amount: gen.Value, destination: Address): void;
        erc20: {
            transfer(universe: Universe<import("..").Config>, planner: gen.Planner, amount: gen.Value, token: Token, destination: Address): void;
            balanceOf(universe: Universe<import("..").Config>, planner: gen.Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): gen.Value;
        };
    };
    get supportsDynamicInput(): boolean;
    get oneUsePrZap(): boolean;
    get returnsOutput(): boolean;
    get addressesInUse(): Set<Address>;
    outputBalanceOf(universe: Universe, planner: gen.Planner): gen.Value[];
    get protocol(): string;
    get interactionConvention(): InteractionConvention;
    get proceedsOptions(): DestinationOptions;
    get approvals(): Approval[];
    get address(): Address;
    constructor(_address: Address, inputToken: Token[], outputToken: Token[], _interactionConvention: InteractionConvention, _proceedsOptions: DestinationOptions, _approvals: Approval[]);
    intoSwapPath(universe: Universe, qty: TokenQuantity): Promise<import("../searcher/Swap").SwapPath>;
    abstract quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    quoteWithSlippage(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    abstract gasEstimate(): bigint;
    exchange(amountsIn: TokenQuantity[], balances: TokenAmounts): Promise<void>;
    abstract plan(planner: gen.Planner, inputs: gen.Value[], destination: Address, predictedInputs: TokenQuantity[]): Promise<null | gen.Value[]>;
    planWithOutput(universe: Universe, planner: gen.Planner, inputs: gen.Value[], destination: Address, predictedInputs: TokenQuantity[]): Promise<gen.Value[]>;
    toString(): string;
    get addToGraph(): boolean;
    get outputSlippage(): bigint;
    combine(other: BaseAction): {
        new (universe: Universe): {
            readonly protocol: string;
            toString(): string;
            quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
            readonly supportsDynamicInput: boolean;
            readonly oneUsePrZap: boolean;
            readonly addressesInUse: Set<Address>;
            readonly returnsOutput: boolean;
            readonly outputSlippage: bigint;
            gasEstimate(): bigint;
            plan(planner: gen.Planner, inputs: gen.Value[], destination: Address, predicted: TokenQuantity[]): Promise<null | gen.Value[]>;
            readonly universe: Universe;
            readonly gen: typeof gen;
            readonly genUtils: {
                planForwardERC20(universe: Universe<import("..").Config>, planner: gen.Planner, token: Token, amount: gen.Value, destination: Address): void;
                erc20: {
                    transfer(universe: Universe<import("..").Config>, planner: gen.Planner, amount: gen.Value, token: Token, destination: Address): void;
                    balanceOf(universe: Universe<import("..").Config>, planner: gen.Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): gen.Value;
                };
            };
            outputBalanceOf(universe: Universe<import("..").Config>, planner: gen.Planner): gen.Value[];
            readonly interactionConvention: InteractionConvention;
            readonly proceedsOptions: DestinationOptions;
            readonly approvals: Approval[];
            readonly address: Address;
            _address: Address;
            readonly inputToken: Token[];
            readonly outputToken: Token[];
            _interactionConvention: InteractionConvention;
            _proceedsOptions: DestinationOptions;
            _approvals: Approval[];
            intoSwapPath(universe: Universe<import("..").Config>, qty: TokenQuantity): Promise<import("../searcher/Swap").SwapPath>;
            quoteWithSlippage(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
            exchange(amountsIn: TokenQuantity[], balances: TokenAmounts): Promise<void>;
            planWithOutput(universe: Universe<import("..").Config>, planner: gen.Planner, inputs: gen.Value[], destination: Address, predictedInputs: TokenQuantity[]): Promise<gen.Value[]>;
            readonly addToGraph: boolean;
            combine(other: BaseAction): {
                new (universe: Universe): any;
            };
        };
    };
}
declare class TradeEdgeAction extends BaseAction {
    readonly universe: Universe;
    readonly choices: BaseAction[];
    private currentChoice;
    private get current();
    get interactionConvention(): InteractionConvention;
    get proceedsOptions(): DestinationOptions;
    get approvals(): Approval[];
    get address(): Address;
    quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    gasEstimate(): bigint;
    plan(planner: gen.Planner, inputs: gen.Value[], destination: Address, predicted: TokenQuantity[]): Promise<null | gen.Value[]>;
    get totalChoices(): number;
    get outputSlippage(): bigint;
    get supportsDynamicInput(): boolean;
    get oneUsePrZap(): boolean;
    get returnsOutput(): boolean;
    get addressesInUse(): Set<Address>;
    get addToGraph(): boolean;
    constructor(universe: Universe, choices: BaseAction[]);
}
export declare const isMultiChoiceEdge: (edge: BaseAction) => edge is TradeEdgeAction;
export declare const createMultiChoiceAction: (universe: Universe, choices: BaseAction[]) => BaseAction;
export declare const Action: (proto: string) => abstract new (_address: Address, inputToken: Token[], outputToken: Token[], _interactionConvention: InteractionConvention, _proceedsOptions: DestinationOptions, _approvals: Approval[]) => {
    readonly protocol: string;
    readonly gen: typeof gen;
    readonly genUtils: {
        planForwardERC20(universe: Universe, planner: gen.Planner, token: Token, amount: gen.Value, destination: Address): void;
        erc20: {
            transfer(universe: Universe, planner: gen.Planner, amount: gen.Value, token: Token, destination: Address): void;
            balanceOf(universe: Universe, planner: gen.Planner, token: Token, owner: Address, comment?: string, varName?: string): gen.Value;
        };
    };
    readonly supportsDynamicInput: boolean;
    readonly oneUsePrZap: boolean;
    readonly returnsOutput: boolean;
    readonly addressesInUse: Set<Address>;
    outputBalanceOf(universe: Universe, planner: gen.Planner): gen.Value[];
    readonly interactionConvention: InteractionConvention;
    readonly proceedsOptions: DestinationOptions;
    readonly approvals: Approval[];
    readonly address: Address;
    _address: Address;
    readonly inputToken: Token[];
    readonly outputToken: Token[];
    _interactionConvention: InteractionConvention;
    _proceedsOptions: DestinationOptions;
    _approvals: Approval[];
    intoSwapPath(universe: Universe, qty: TokenQuantity): Promise<import("../searcher/Swap").SwapPath>;
    quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    quoteWithSlippage(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    gasEstimate(): bigint;
    exchange(amountsIn: TokenQuantity[], balances: TokenAmounts): Promise<void>;
    plan(planner: gen.Planner, inputs: gen.Value[], destination: Address, predictedInputs: TokenQuantity[]): Promise<null | gen.Value[]>;
    planWithOutput(universe: Universe, planner: gen.Planner, inputs: gen.Value[], destination: Address, predictedInputs: TokenQuantity[]): Promise<gen.Value[]>;
    toString(): string;
    readonly addToGraph: boolean;
    readonly outputSlippage: bigint;
    combine(other: BaseAction): {
        new (universe: Universe): {
            readonly protocol: string;
            toString(): string;
            quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
            readonly supportsDynamicInput: boolean;
            readonly oneUsePrZap: boolean;
            readonly addressesInUse: Set<Address>;
            readonly returnsOutput: boolean;
            readonly outputSlippage: bigint;
            gasEstimate(): bigint;
            plan(planner: gen.Planner, inputs: gen.Value[], destination: Address, predicted: TokenQuantity[]): Promise<null | gen.Value[]>;
            readonly universe: Universe;
            readonly gen: typeof gen;
            readonly genUtils: {
                planForwardERC20(universe: Universe, planner: gen.Planner, token: Token, amount: gen.Value, destination: Address): void;
                erc20: {
                    transfer(universe: Universe, planner: gen.Planner, amount: gen.Value, token: Token, destination: Address): void;
                    balanceOf(universe: Universe, planner: gen.Planner, token: Token, owner: Address, comment?: string, varName?: string): gen.Value;
                };
            };
            outputBalanceOf(universe: Universe, planner: gen.Planner): gen.Value[];
            readonly interactionConvention: InteractionConvention;
            readonly proceedsOptions: DestinationOptions;
            readonly approvals: Approval[];
            readonly address: Address;
            _address: Address;
            readonly inputToken: Token[];
            readonly outputToken: Token[];
            _interactionConvention: InteractionConvention;
            _proceedsOptions: DestinationOptions;
            _approvals: Approval[];
            intoSwapPath(universe: Universe, qty: TokenQuantity): Promise<import("../searcher/Swap").SwapPath>;
            quoteWithSlippage(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
            exchange(amountsIn: TokenQuantity[], balances: TokenAmounts): Promise<void>;
            planWithOutput(universe: Universe, planner: gen.Planner, inputs: gen.Value[], destination: Address, predictedInputs: TokenQuantity[]): Promise<gen.Value[]>;
            readonly addToGraph: boolean;
            combine(other: BaseAction): {
                new (universe: Universe): any;
            };
        };
    };
};
export {};
