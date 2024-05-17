import { type Address } from '../base/Address';
import { Approval } from '../base/Approval';
import { type Token, type TokenQuantity } from '../entities/Token';
import { Planner, Value } from '../tx-gen/Planner';
import { BaseAction, DestinationOptions, InteractionConvention } from './Action';
export declare class LPToken {
    readonly token: Token;
    readonly poolTokens: Token[];
    readonly burn: (amount: TokenQuantity) => Promise<TokenQuantity[]>;
    readonly mint: (amountsIn: TokenQuantity[]) => Promise<TokenQuantity>;
    readonly planBurn?: ((planner: Planner, inputs: Value[], destination: Address) => Promise<Value[]>) | undefined;
    readonly mintAction: BaseAction;
    readonly burnAction: BaseAction;
    constructor(token: Token, poolTokens: Token[], burn: (amount: TokenQuantity) => Promise<TokenQuantity[]>, mint: (amountsIn: TokenQuantity[]) => Promise<TokenQuantity>, planBurn?: ((planner: Planner, inputs: Value[], destination: Address) => Promise<Value[]>) | undefined);
    toString(): string;
}
declare const LPTokenMint_base: abstract new (address: Address, inputToken: Token[], outputToken: Token[], interactionConvention: InteractionConvention, proceedsOptions: DestinationOptions, approvals: Approval[]) => {
    readonly protocol: string;
    readonly gen: typeof import("../tx-gen/Planner");
    readonly genUtils: {
        planForwardERC20(universe: import("..").Universe<import("..").Config>, planner: Planner, token: Token, amount: Value, destination: Address): void;
        erc20: {
            transfer(universe: import("..").Universe<import("..").Config>, planner: Planner, amount: Value, token: Token, destination: Address): void;
            balanceOf(universe: import("..").Universe<import("..").Config>, planner: Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): Value;
        };
    };
    readonly supportsDynamicInput: boolean;
    readonly oneUsePrZap: boolean;
    readonly returnsOutput: boolean;
    readonly addressesInUse: Set<Address>;
    outputBalanceOf(universe: import("..").Universe<import("..").Config>, planner: Planner): Value[];
    readonly address: Address;
    readonly inputToken: Token[];
    readonly outputToken: Token[];
    readonly interactionConvention: InteractionConvention;
    readonly proceedsOptions: DestinationOptions;
    readonly approvals: Approval[];
    intoSwapPath(universe: import("..").Universe<import("..").Config>, qty: TokenQuantity): Promise<import("../searcher/Swap").SwapPath>;
    quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    quoteWithSlippage(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    gasEstimate(): bigint;
    exchange(amountsIn: TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
    plan(planner: Planner, inputs: Value[], destination: Address, predictedInputs: TokenQuantity[]): Promise<Value[] | null>;
    planWithOutput(universe: import("..").Universe<import("..").Config>, planner: Planner, inputs: Value[], destination: Address, predictedInputs: TokenQuantity[]): Promise<Value[]>;
    toString(): string;
    readonly addToGraph: boolean;
    readonly outputSlippage: bigint;
    combine(other: BaseAction): {
        new (universe: import("..").Universe<import("..").Config>): {
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
            readonly universe: import("..").Universe<import("..").Config>;
            readonly gen: typeof import("../tx-gen/Planner");
            readonly genUtils: {
                planForwardERC20(universe: import("..").Universe<import("..").Config>, planner: Planner, token: Token, amount: Value, destination: Address): void;
                erc20: {
                    transfer(universe: import("..").Universe<import("..").Config>, planner: Planner, amount: Value, token: Token, destination: Address): void;
                    balanceOf(universe: import("..").Universe<import("..").Config>, planner: Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): Value;
                };
            };
            outputBalanceOf(universe: import("..").Universe<import("..").Config>, planner: Planner): Value[];
            readonly address: Address;
            readonly inputToken: Token[];
            readonly outputToken: Token[];
            readonly interactionConvention: InteractionConvention;
            readonly proceedsOptions: DestinationOptions;
            readonly approvals: Approval[];
            intoSwapPath(universe: import("..").Universe<import("..").Config>, qty: TokenQuantity): Promise<import("../searcher/Swap").SwapPath>;
            quoteWithSlippage(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
            exchange(amountsIn: TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
            planWithOutput(universe: import("..").Universe<import("..").Config>, planner: Planner, inputs: Value[], destination: Address, predictedInputs: TokenQuantity[]): Promise<Value[]>;
            readonly addToGraph: boolean;
            combine(other: BaseAction): {
                new (universe: import("..").Universe<import("..").Config>): any;
            };
        };
    };
};
export declare class LPTokenMint extends LPTokenMint_base {
    readonly lpToken: LPToken;
    plan(planner: Planner, inputs: Value[], destination: Address): Promise<Value[]>;
    toString(): string;
    quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    gasEstimate(): bigint;
    constructor(lpToken: LPToken);
}
declare const LPTokenBurn_base: abstract new (address: Address, inputToken: Token[], outputToken: Token[], interactionConvention: InteractionConvention, proceedsOptions: DestinationOptions, approvals: Approval[]) => {
    readonly protocol: string;
    readonly gen: typeof import("../tx-gen/Planner");
    readonly genUtils: {
        planForwardERC20(universe: import("..").Universe<import("..").Config>, planner: Planner, token: Token, amount: Value, destination: Address): void;
        erc20: {
            transfer(universe: import("..").Universe<import("..").Config>, planner: Planner, amount: Value, token: Token, destination: Address): void;
            balanceOf(universe: import("..").Universe<import("..").Config>, planner: Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): Value;
        };
    };
    readonly supportsDynamicInput: boolean;
    readonly oneUsePrZap: boolean;
    readonly returnsOutput: boolean;
    readonly addressesInUse: Set<Address>;
    outputBalanceOf(universe: import("..").Universe<import("..").Config>, planner: Planner): Value[];
    readonly address: Address;
    readonly inputToken: Token[];
    readonly outputToken: Token[];
    readonly interactionConvention: InteractionConvention;
    readonly proceedsOptions: DestinationOptions;
    readonly approvals: Approval[];
    intoSwapPath(universe: import("..").Universe<import("..").Config>, qty: TokenQuantity): Promise<import("../searcher/Swap").SwapPath>;
    quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    quoteWithSlippage(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    gasEstimate(): bigint;
    exchange(amountsIn: TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
    plan(planner: Planner, inputs: Value[], destination: Address, predictedInputs: TokenQuantity[]): Promise<Value[] | null>;
    planWithOutput(universe: import("..").Universe<import("..").Config>, planner: Planner, inputs: Value[], destination: Address, predictedInputs: TokenQuantity[]): Promise<Value[]>;
    toString(): string;
    readonly addToGraph: boolean;
    readonly outputSlippage: bigint;
    combine(other: BaseAction): {
        new (universe: import("..").Universe<import("..").Config>): {
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
            readonly universe: import("..").Universe<import("..").Config>;
            readonly gen: typeof import("../tx-gen/Planner");
            readonly genUtils: {
                planForwardERC20(universe: import("..").Universe<import("..").Config>, planner: Planner, token: Token, amount: Value, destination: Address): void;
                erc20: {
                    transfer(universe: import("..").Universe<import("..").Config>, planner: Planner, amount: Value, token: Token, destination: Address): void;
                    balanceOf(universe: import("..").Universe<import("..").Config>, planner: Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): Value;
                };
            };
            outputBalanceOf(universe: import("..").Universe<import("..").Config>, planner: Planner): Value[];
            readonly address: Address;
            readonly inputToken: Token[];
            readonly outputToken: Token[];
            readonly interactionConvention: InteractionConvention;
            readonly proceedsOptions: DestinationOptions;
            readonly approvals: Approval[];
            intoSwapPath(universe: import("..").Universe<import("..").Config>, qty: TokenQuantity): Promise<import("../searcher/Swap").SwapPath>;
            quoteWithSlippage(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
            exchange(amountsIn: TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
            planWithOutput(universe: import("..").Universe<import("..").Config>, planner: Planner, inputs: Value[], destination: Address, predictedInputs: TokenQuantity[]): Promise<Value[]>;
            readonly addToGraph: boolean;
            combine(other: BaseAction): {
                new (universe: import("..").Universe<import("..").Config>): any;
            };
        };
    };
};
export declare class LPTokenBurn extends LPTokenBurn_base {
    readonly lpToken: LPToken;
    plan(planner: Planner, inputs: Value[], destination: Address): Promise<Value[]>;
    toString(): string;
    quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    gasEstimate(): bigint;
    constructor(lpToken: LPToken);
}
export {};
