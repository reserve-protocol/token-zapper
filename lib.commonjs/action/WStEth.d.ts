import { type Universe } from '../Universe';
import { Approval } from '../base/Approval';
import { type Token, type TokenQuantity } from '../entities/Token';
import * as gen from '../tx-gen/Planner';
import { DestinationOptions, InteractionConvention } from './Action';
export declare class WStETHRateProvider {
    readonly universe: Universe;
    readonly steth: Token;
    readonly wsteth: Token;
    get outputSlippage(): bigint;
    private wstethInstance;
    constructor(universe: Universe, steth: Token, wsteth: Token);
    quoteMint(amountsIn: TokenQuantity): Promise<TokenQuantity>;
    quoteBurn(amountsIn: TokenQuantity): Promise<TokenQuantity>;
}
declare const MintWStETH_base: abstract new (address: import("..").Address, inputToken: Token[], outputToken: Token[], interactionConvention: InteractionConvention, proceedsOptions: DestinationOptions, approvals: Approval[]) => {
    readonly protocol: string;
    readonly gen: typeof gen;
    readonly genUtils: {
        planForwardERC20(universe: Universe<import("..").Config>, planner: gen.Planner, token: Token, amount: gen.Value, destination: import("..").Address): void;
        erc20: {
            transfer(universe: Universe<import("..").Config>, planner: gen.Planner, amount: gen.Value, token: Token, destination: import("..").Address): void;
            balanceOf(universe: Universe<import("..").Config>, planner: gen.Planner, token: Token, owner: import("..").Address, comment?: string | undefined, varName?: string | undefined): gen.Value;
        };
    };
    outputBalanceOf(universe: Universe<import("..").Config>, planner: gen.Planner): gen.Value[];
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
    generateOutputTokenBalance(universe: Universe<import("..").Config>, planner: gen.Planner, comment?: string | undefined): gen.Value;
    plan(planner: gen.Planner, inputs: gen.Value[], destination: import("..").Address, predictedInputs: TokenQuantity[], outputNotUsed?: boolean | undefined): Promise<gen.Value[]>;
    toString(): string;
    readonly addToGraph: boolean;
    readonly outputSlippage: bigint;
};
export declare class MintWStETH extends MintWStETH_base {
    readonly universe: Universe;
    readonly steth: Token;
    readonly wsteth: Token;
    readonly rateProvider: Pick<WStETHRateProvider, 'quoteMint'>;
    get outputSlippage(): bigint;
    gasEstimate(): bigint;
    plan(planner: gen.Planner, inputs: gen.Value[]): Promise<gen.ReturnValue[]>;
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, steth: Token, wsteth: Token, rateProvider: Pick<WStETHRateProvider, 'quoteMint'>);
    toString(): string;
}
declare const BurnWStETH_base: abstract new (address: import("..").Address, inputToken: Token[], outputToken: Token[], interactionConvention: InteractionConvention, proceedsOptions: DestinationOptions, approvals: Approval[]) => {
    readonly protocol: string;
    readonly gen: typeof gen;
    readonly genUtils: {
        planForwardERC20(universe: Universe<import("..").Config>, planner: gen.Planner, token: Token, amount: gen.Value, destination: import("..").Address): void;
        erc20: {
            transfer(universe: Universe<import("..").Config>, planner: gen.Planner, amount: gen.Value, token: Token, destination: import("..").Address): void;
            balanceOf(universe: Universe<import("..").Config>, planner: gen.Planner, token: Token, owner: import("..").Address, comment?: string | undefined, varName?: string | undefined): gen.Value;
        };
    };
    outputBalanceOf(universe: Universe<import("..").Config>, planner: gen.Planner): gen.Value[];
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
    generateOutputTokenBalance(universe: Universe<import("..").Config>, planner: gen.Planner, comment?: string | undefined): gen.Value;
    plan(planner: gen.Planner, inputs: gen.Value[], destination: import("..").Address, predictedInputs: TokenQuantity[], outputNotUsed?: boolean | undefined): Promise<gen.Value[]>;
    toString(): string;
    readonly addToGraph: boolean;
    readonly outputSlippage: bigint;
};
export declare class BurnWStETH extends BurnWStETH_base {
    readonly universe: Universe;
    readonly steth: Token;
    readonly wsteth: Token;
    readonly rateProvider: Pick<WStETHRateProvider, 'quoteBurn'>;
    get outputSlippage(): bigint;
    gasEstimate(): bigint;
    plan(planner: gen.Planner, inputs: gen.Value[]): Promise<gen.ReturnValue[]>;
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, steth: Token, wsteth: Token, rateProvider: Pick<WStETHRateProvider, 'quoteBurn'>);
    toString(): string;
}
export {};
