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
    readonly address: Address;
    readonly inputToken: Token[];
    readonly outputToken: Token[];
    readonly interactionConvention: InteractionConvention;
    readonly proceedsOptions: DestinationOptions;
    readonly approvals: Approval[];
    readonly gen: typeof gen;
    readonly genUtils: {
        planForwardERC20(universe: Universe<import("..").Config>, planner: gen.Planner, token: Token, amount: gen.Value, destination: Address): void;
        erc20: {
            transfer(universe: Universe<import("..").Config>, planner: gen.Planner, amount: gen.Value, token: Token, destination: Address): void;
            balanceOf(universe: Universe<import("..").Config>, planner: gen.Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): gen.Value;
        };
    };
    outputBalanceOf(universe: Universe, planner: gen.Planner): gen.Value[];
    get protocol(): string;
    constructor(address: Address, inputToken: Token[], outputToken: Token[], interactionConvention: InteractionConvention, proceedsOptions: DestinationOptions, approvals: Approval[]);
    abstract quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    quoteWithSlippage(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    abstract gasEstimate(): bigint;
    exchange(amountsIn: TokenQuantity[], balances: TokenAmounts): Promise<void>;
    abstract plan(planner: gen.Planner, inputs: gen.Value[], destination: Address, predictedInputs: TokenQuantity[], outputNotUsed?: boolean): Promise<gen.Value[]>;
    toString(): string;
    get addToGraph(): boolean;
    get outputSlippage(): bigint;
}
export declare const Action: (proto: string) => abstract new (address: Address, inputToken: Token[], outputToken: Token[], interactionConvention: InteractionConvention, proceedsOptions: DestinationOptions, approvals: Approval[]) => {
    readonly protocol: string;
    readonly gen: typeof gen;
    readonly genUtils: {
        planForwardERC20(universe: Universe, planner: gen.Planner, token: Token, amount: gen.Value, destination: Address): void;
        erc20: {
            transfer(universe: Universe, planner: gen.Planner, amount: gen.Value, token: Token, destination: Address): void;
            balanceOf(universe: Universe, planner: gen.Planner, token: Token, owner: Address, comment?: string, varName?: string): gen.Value;
        };
    };
    outputBalanceOf(universe: Universe, planner: gen.Planner): gen.Value[];
    readonly address: Address;
    readonly inputToken: Token[];
    readonly outputToken: Token[];
    readonly interactionConvention: InteractionConvention;
    readonly proceedsOptions: DestinationOptions;
    readonly approvals: Approval[];
    quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    quoteWithSlippage(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    gasEstimate(): bigint;
    exchange(amountsIn: TokenQuantity[], balances: TokenAmounts): Promise<void>;
    plan(planner: gen.Planner, inputs: gen.Value[], destination: Address, predictedInputs: TokenQuantity[], outputNotUsed?: boolean): Promise<gen.Value[]>;
    toString(): string;
    readonly addToGraph: boolean;
    readonly outputSlippage: bigint;
};
//# sourceMappingURL=Action.d.ts.map