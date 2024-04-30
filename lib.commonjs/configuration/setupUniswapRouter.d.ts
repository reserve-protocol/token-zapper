import { Currency, TradeType } from '@uniswap/sdk-core';
import { Trade as V3Trade } from '@uniswap/v3-sdk';
import { SwapRoute } from '@uniswap/smart-order-router';
import { Universe } from '../Universe';
import { DestinationOptions, InteractionConvention } from '../action/Action';
import { DexRouter } from '../aggregators/DexAggregator';
import { Address } from '../base/Address';
import { Approval } from '../base/Approval';
import { Token, TokenQuantity } from '../entities/Token';
import { Planner, Value } from '../tx-gen/Planner';
type UniQuote = {
    route: SwapRoute;
    input: TokenQuantity;
    output: TokenQuantity;
    slippage: bigint;
    block: number;
};
declare const UniswapRouterAction_base: abstract new (address: Address, inputToken: Token[], outputToken: Token[], interactionConvention: InteractionConvention, proceedsOptions: DestinationOptions, approvals: Approval[]) => {
    readonly protocol: string;
    readonly gen: typeof import("../tx-gen/Planner");
    readonly genUtils: {
        planForwardERC20(universe: Universe<import("./ChainConfiguration").Config>, planner: Planner, token: Token, amount: Value, destination: Address): void;
        erc20: {
            transfer(universe: Universe<import("./ChainConfiguration").Config>, planner: Planner, amount: Value, token: Token, destination: Address): void;
            balanceOf(universe: Universe<import("./ChainConfiguration").Config>, planner: Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): Value;
        };
    };
    outputBalanceOf(universe: Universe<import("./ChainConfiguration").Config>, planner: Planner): Value[];
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
    generateOutputTokenBalance(universe: Universe<import("./ChainConfiguration").Config>, planner: Planner, comment?: string | undefined): Value;
    plan(planner: Planner, inputs: Value[], destination: Address, predictedInputs: TokenQuantity[], outputNotUsed?: boolean | undefined): Promise<Value[]>;
    toString(): string;
    readonly addToGraph: boolean;
    readonly outputSlippage: bigint;
};
export declare class UniswapRouterAction extends UniswapRouterAction_base {
    currentQuote: UniQuote;
    readonly universe: Universe;
    private reQuote;
    get outputSlippage(): bigint;
    planV3Trade(planner: Planner, trade: V3Trade<Currency, Currency, TradeType>, input: Value, predicted: TokenQuantity): Promise<Value>;
    plan(planner: Planner, [input]: Value[], _: Address, [staticInput]: TokenQuantity[]): Promise<Value[]>;
    createdBlock: number;
    constructor(currentQuote: UniQuote, universe: Universe, reQuote: (input: TokenQuantity) => Promise<UniQuote>);
    get inputQty(): TokenQuantity;
    get outputQty(): TokenQuantity;
    toString(): string;
    quote([input]: TokenQuantity[]): Promise<TokenQuantity[]>;
    get route(): SwapRoute;
    gasEstimate(): bigint;
}
export declare const setupUniswapRouter: (universe: Universe) => Promise<{
    dex: DexRouter;
    addTradeAction: (inputToken: Token, outputToken: Token) => void;
}>;
export {};
