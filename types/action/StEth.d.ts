import { type Token, type TokenQuantity } from '../entities/Token';
import { type Universe } from '../Universe';
import { DestinationOptions, InteractionConvention } from './Action';
import { Planner, Value } from '../tx-gen/Planner';
export declare class StETHRateProvider {
    readonly universe: Universe;
    readonly steth: Token;
    constructor(universe: Universe, steth: Token);
    quoteMint(amountsIn: TokenQuantity): Promise<TokenQuantity>;
    quoteBurn(amountsIn: TokenQuantity): Promise<TokenQuantity>;
}
declare const MintStETH_base: abstract new (address: import("..").Address, inputToken: Token[], outputToken: Token[], interactionConvention: InteractionConvention, proceedsOptions: DestinationOptions, approvals: import("../base/Approval").Approval[]) => {
    readonly protocol: string;
    readonly gen: typeof import("../tx-gen/Planner");
    readonly genUtils: {
        planForwardERC20(universe: Universe<import("..").Config>, planner: Planner, token: Token, amount: Value, destination: import("..").Address): void;
        erc20: {
            transfer(universe: Universe<import("..").Config>, planner: Planner, amount: Value, token: Token, destination: import("..").Address): void;
            balanceOf(universe: Universe<import("..").Config>, planner: Planner, token: Token, owner: import("..").Address, comment?: string | undefined, varName?: string | undefined): Value;
        };
    };
    outputBalanceOf(universe: Universe<import("..").Config>, planner: Planner): Value[];
    readonly address: import("..").Address;
    readonly inputToken: Token[];
    readonly outputToken: Token[];
    readonly interactionConvention: InteractionConvention;
    readonly proceedsOptions: DestinationOptions;
    readonly approvals: import("../base/Approval").Approval[];
    quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    quoteWithSlippage(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    gasEstimate(): bigint;
    exchange(amountsIn: TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
    generateOutputTokenBalance(universe: Universe<import("..").Config>, planner: Planner, comment?: string | undefined): Value;
    plan(planner: Planner, inputs: Value[], destination: import("..").Address, predictedInputs: TokenQuantity[], outputNotUsed?: boolean | undefined): Promise<Value[]>;
    toString(): string;
    readonly addToGraph: boolean;
    readonly outputSlippage: bigint;
};
export declare class MintStETH extends MintStETH_base {
    readonly universe: Universe;
    readonly steth: Token;
    readonly rateProvider: Pick<StETHRateProvider, 'quoteMint'>;
    plan(planner: Planner, inputs: Value[]): Promise<Value[]>;
    gasEstimate(): bigint;
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, steth: Token, rateProvider: Pick<StETHRateProvider, 'quoteMint'>);
    toString(): string;
}
declare const BurnStETH_base: abstract new (address: import("..").Address, inputToken: Token[], outputToken: Token[], interactionConvention: InteractionConvention, proceedsOptions: DestinationOptions, approvals: import("../base/Approval").Approval[]) => {
    readonly protocol: string;
    readonly gen: typeof import("../tx-gen/Planner");
    readonly genUtils: {
        planForwardERC20(universe: Universe<import("..").Config>, planner: Planner, token: Token, amount: Value, destination: import("..").Address): void;
        erc20: {
            transfer(universe: Universe<import("..").Config>, planner: Planner, amount: Value, token: Token, destination: import("..").Address): void;
            balanceOf(universe: Universe<import("..").Config>, planner: Planner, token: Token, owner: import("..").Address, comment?: string | undefined, varName?: string | undefined): Value;
        };
    };
    outputBalanceOf(universe: Universe<import("..").Config>, planner: Planner): Value[];
    readonly address: import("..").Address;
    readonly inputToken: Token[];
    readonly outputToken: Token[];
    readonly interactionConvention: InteractionConvention;
    readonly proceedsOptions: DestinationOptions;
    readonly approvals: import("../base/Approval").Approval[];
    quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    quoteWithSlippage(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    gasEstimate(): bigint;
    exchange(amountsIn: TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
    generateOutputTokenBalance(universe: Universe<import("..").Config>, planner: Planner, comment?: string | undefined): Value;
    plan(planner: Planner, inputs: Value[], destination: import("..").Address, predictedInputs: TokenQuantity[], outputNotUsed?: boolean | undefined): Promise<Value[]>;
    toString(): string;
    readonly addToGraph: boolean;
    readonly outputSlippage: bigint;
};
export declare class BurnStETH extends BurnStETH_base {
    readonly universe: Universe;
    readonly steth: Token;
    readonly rateProvider: Pick<StETHRateProvider, 'quoteBurn'>;
    gasEstimate(): bigint;
    plan(planner: Planner, inputs: Value[]): Promise<Value[]>;
    quote([qty]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, steth: Token, rateProvider: Pick<StETHRateProvider, 'quoteBurn'>);
    toString(): string;
    /**
     * Prevents this edge of being picked up by the graph searcher, but it can still be used
     * by the zapper.
     */
    get addToGraph(): boolean;
}
export {};
//# sourceMappingURL=StEth.d.ts.map