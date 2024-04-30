import { type Universe } from '../Universe';
import { Address } from '../base/Address';
import { Approval } from '../base/Approval';
import { ICurveStableSwapNG } from '../contracts';
import { type Token, type TokenQuantity } from '../entities/Token';
import { Planner, Value } from '../tx-gen/Planner';
import { DestinationOptions, InteractionConvention } from './Action';
export declare class CurveStableSwapNGPool {
    readonly universe: Universe;
    readonly pool: Token;
    readonly underlying: Token[];
    readonly addLiqudity: CurveStableSwapNGAddLiquidity[];
    readonly removeLiquidity: CurveStableSwapNGRemoveLiquidity[];
    readonly poolInstance: ICurveStableSwapNG;
    constructor(universe: Universe, pool: Token, underlying: Token[]);
    toString(): string;
    getAddLiquidityAction(input: Token): CurveStableSwapNGAddLiquidity;
    getRemoveLiquidityAction(input: Token): CurveStableSwapNGRemoveLiquidity;
}
declare const CurveStableSwapNGAddLiquidity_base: abstract new (address: Address, inputToken: Token[], outputToken: Token[], interactionConvention: InteractionConvention, proceedsOptions: DestinationOptions, approvals: Approval[]) => {
    readonly protocol: string;
    readonly gen: typeof import("../tx-gen/Planner");
    readonly genUtils: {
        planForwardERC20(universe: Universe<import("..").Config>, planner: Planner, token: Token, amount: Value, destination: Address): void;
        erc20: {
            transfer(universe: Universe<import("..").Config>, planner: Planner, amount: Value, token: Token, destination: Address): void;
            balanceOf(universe: Universe<import("..").Config>, planner: Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): Value;
        };
    };
    outputBalanceOf(universe: Universe<import("..").Config>, planner: Planner): Value[];
    readonly address: Address;
    readonly inputToken: Token[];
    readonly outputToken: Token[];
    readonly interactionConvention: InteractionConvention;
    readonly proceedsOptions: DestinationOptions;
    readonly approvals: Approval[];
    quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    quoteWithSlippage(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    gasEstimate(): bigint;
    exchange(amountsIn: TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
    generateOutputTokenBalance(universe: Universe<import("..").Config>, planner: Planner, comment?: string | undefined): Value;
    plan(planner: Planner, inputs: Value[], destination: Address, predictedInputs: TokenQuantity[], outputNotUsed?: boolean | undefined): Promise<Value[]>;
    toString(): string;
    readonly addToGraph: boolean;
    readonly outputSlippage: bigint;
};
export declare class CurveStableSwapNGAddLiquidity extends CurveStableSwapNGAddLiquidity_base {
    readonly universe: Universe;
    readonly pool: CurveStableSwapNGPool;
    readonly tokenIndex: number;
    get outputSlippage(): bigint;
    gasEstimate(): bigint;
    plan(planner: Planner, [input]: Value[], _: Address, predicted: TokenQuantity[]): Promise<Value[]>;
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, pool: CurveStableSwapNGPool, tokenIndex: number);
    toString(): string;
}
declare const CurveStableSwapNGRemoveLiquidity_base: abstract new (address: Address, inputToken: Token[], outputToken: Token[], interactionConvention: InteractionConvention, proceedsOptions: DestinationOptions, approvals: Approval[]) => {
    readonly protocol: string;
    readonly gen: typeof import("../tx-gen/Planner");
    readonly genUtils: {
        planForwardERC20(universe: Universe<import("..").Config>, planner: Planner, token: Token, amount: Value, destination: Address): void;
        erc20: {
            transfer(universe: Universe<import("..").Config>, planner: Planner, amount: Value, token: Token, destination: Address): void;
            balanceOf(universe: Universe<import("..").Config>, planner: Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): Value;
        };
    };
    outputBalanceOf(universe: Universe<import("..").Config>, planner: Planner): Value[];
    readonly address: Address;
    readonly inputToken: Token[];
    readonly outputToken: Token[];
    readonly interactionConvention: InteractionConvention;
    readonly proceedsOptions: DestinationOptions;
    readonly approvals: Approval[];
    quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    quoteWithSlippage(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    gasEstimate(): bigint;
    exchange(amountsIn: TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
    generateOutputTokenBalance(universe: Universe<import("..").Config>, planner: Planner, comment?: string | undefined): Value;
    plan(planner: Planner, inputs: Value[], destination: Address, predictedInputs: TokenQuantity[], outputNotUsed?: boolean | undefined): Promise<Value[]>;
    toString(): string;
    readonly addToGraph: boolean;
    readonly outputSlippage: bigint;
};
export declare class CurveStableSwapNGRemoveLiquidity extends CurveStableSwapNGRemoveLiquidity_base {
    readonly universe: Universe;
    readonly pool: CurveStableSwapNGPool;
    readonly tokenIndex: number;
    get outputSlippage(): bigint;
    gasEstimate(): bigint;
    plan(planner: Planner, inputs: Value[], _: Address, predicted: TokenQuantity[]): Promise<Value[]>;
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, pool: CurveStableSwapNGPool, tokenIndex: number);
    toString(): string;
}
export declare const setupCurveStableSwapNGPool: (universe: Universe, pool: Token) => Promise<CurveStableSwapNGPool>;
export {};
//# sourceMappingURL=CurveStableSwapNG.d.ts.map