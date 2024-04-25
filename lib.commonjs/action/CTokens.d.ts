import { type Universe } from '../Universe';
import { Approval } from '../base/Approval';
import { type Token, type TokenQuantity } from '../entities/Token';
import { Planner, Value } from '../tx-gen/Planner';
import { DestinationOptions, InteractionConvention } from './Action';
declare const MintCTokenAction_base: abstract new (address: import("..").Address, inputToken: Token[], outputToken: Token[], interactionConvention: InteractionConvention, proceedsOptions: DestinationOptions, approvals: Approval[]) => {
    readonly protocol: string;
    readonly gen: typeof import("../tx-gen/Planner");
    readonly genUtils: {
        planForwardERC20(universe: Universe<import("..").Config>, planner: Planner, token: Token, amount: Value, destination: import("..").Address): void;
        erc20: {
            transfer(universe: Universe<import("..").Config>, planner: Planner, amount: Value, token: Token, destination: import("..").Address): void;
            balanceOf(universe: Universe<import("..").Config>, planner: Planner, token: Token, owner: import("..").Address, comment?: string | undefined, varName?: string | undefined): Value;
        };
    };
    readonly address: import("..").Address;
    readonly inputToken: Token[];
    readonly outputToken: Token[];
    readonly interactionConvention: InteractionConvention;
    readonly proceedsOptions: DestinationOptions;
    readonly approvals: Approval[];
    quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    quoteWithSlippage(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    gasEstimate(): bigint;
    exchange(amountsIn: TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
    plan(planner: Planner, inputs: Value[], destination: import("..").Address, predictedInputs: TokenQuantity[], outputNotUsed?: boolean | undefined): Promise<Value[]>;
    toString(): string;
    readonly addToGraph: boolean;
    readonly outputSlippage: bigint;
};
export declare class MintCTokenAction extends MintCTokenAction_base {
    readonly universe: Universe;
    readonly underlying: Token;
    readonly cToken: Token;
    private readonly rate;
    plan(planner: Planner, inputs: Value[]): Promise<Value[]>;
    gasEstimate(): bigint;
    private readonly rateScale;
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    get outputSlippage(): bigint;
    constructor(universe: Universe, underlying: Token, cToken: Token, rate: {
        value: bigint;
    });
    toString(): string;
}
declare const BurnCTokenAction_base: abstract new (address: import("..").Address, inputToken: Token[], outputToken: Token[], interactionConvention: InteractionConvention, proceedsOptions: DestinationOptions, approvals: Approval[]) => {
    readonly protocol: string;
    readonly gen: typeof import("../tx-gen/Planner");
    readonly genUtils: {
        planForwardERC20(universe: Universe<import("..").Config>, planner: Planner, token: Token, amount: Value, destination: import("..").Address): void;
        erc20: {
            transfer(universe: Universe<import("..").Config>, planner: Planner, amount: Value, token: Token, destination: import("..").Address): void;
            balanceOf(universe: Universe<import("..").Config>, planner: Planner, token: Token, owner: import("..").Address, comment?: string | undefined, varName?: string | undefined): Value;
        };
    };
    readonly address: import("..").Address;
    readonly inputToken: Token[];
    readonly outputToken: Token[];
    readonly interactionConvention: InteractionConvention;
    readonly proceedsOptions: DestinationOptions;
    readonly approvals: Approval[];
    quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    quoteWithSlippage(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    gasEstimate(): bigint;
    exchange(amountsIn: TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
    plan(planner: Planner, inputs: Value[], destination: import("..").Address, predictedInputs: TokenQuantity[], outputNotUsed?: boolean | undefined): Promise<Value[]>;
    toString(): string;
    readonly addToGraph: boolean;
    readonly outputSlippage: bigint;
};
export declare class BurnCTokenAction extends BurnCTokenAction_base {
    readonly universe: Universe;
    readonly underlying: Token;
    readonly cToken: Token;
    private readonly rate;
    get outputSlippage(): bigint;
    plan(planner: Planner, inputs: Value[]): Promise<Value[]>;
    gasEstimate(): bigint;
    private readonly rateScale;
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, underlying: Token, cToken: Token, rate: {
        value: bigint;
    });
    toString(): string;
}
export {};
