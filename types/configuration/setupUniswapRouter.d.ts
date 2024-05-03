import { Universe } from '../Universe';
import { DestinationOptions, InteractionConvention } from '../action/Action';
import { DexRouter } from '../aggregators/DexAggregator';
import { Address } from '../base/Address';
import { Approval } from '../base/Approval';
import { Token, TokenQuantity } from '../entities/Token';
import { Planner, Value } from '../tx-gen/Planner';
declare class UniswapPool {
    readonly address: Address;
    readonly token0: Token;
    readonly token1: Token;
    readonly fee: number;
    constructor(address: Address, token0: Token, token1: Token, fee: number);
    toString(): string;
}
declare class UniswapStep {
    readonly pool: UniswapPool;
    readonly tokenIn: Token;
    readonly tokenOut: Token;
    constructor(pool: UniswapPool, tokenIn: Token, tokenOut: Token);
    toString(): string;
}
export declare class UniswapTrade {
    readonly to: Address;
    readonly gasEstimate: bigint;
    readonly input: TokenQuantity;
    readonly output: TokenQuantity;
    readonly swaps: UniswapStep[];
    readonly addresses: Set<Address>;
    readonly outputWithSlippage: TokenQuantity;
    constructor(to: Address, gasEstimate: bigint, input: TokenQuantity, output: TokenQuantity, swaps: UniswapStep[], addresses: Set<Address>, outputWithSlippage: TokenQuantity);
    toString(): string;
}
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
    readonly oneUsePrZap: boolean;
    readonly addressesInUse: Set<Address>;
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
    plan(planner: Planner, inputs: Value[], destination: Address, predictedInputs: TokenQuantity[], outputNotUsed?: boolean | undefined): Promise<Value[]>;
    toString(): string;
    readonly addToGraph: boolean;
    readonly outputSlippage: bigint;
};
export declare class UniswapRouterAction extends UniswapRouterAction_base {
    currentQuote: UniswapTrade;
    readonly universe: Universe;
    readonly dex: DexRouter;
    get oneUsePrZap(): boolean;
    get outputSlippage(): bigint;
    planV3Trade(planner: Planner, trade: UniswapTrade, input: Value | bigint): Promise<Value>;
    plan(planner: Planner, [input]: Value[], _: Address, [staticInput]: TokenQuantity[]): Promise<Value[]>;
    createdBlock: number;
    constructor(currentQuote: UniswapTrade, universe: Universe, dex: DexRouter);
    get inputQty(): TokenQuantity;
    get outputQty(): TokenQuantity;
    toString(): string;
    get addressesInUse(): Set<Address>;
    quote([input]: TokenQuantity[]): Promise<TokenQuantity[]>;
    get route(): UniswapTrade;
    gasEstimate(): bigint;
}
export declare const setupUniswapRouter: (universe: Universe) => Promise<{
    dex: DexRouter;
    addTradeAction: (inputToken: Token, outputToken: Token) => void;
}>;
export {};
//# sourceMappingURL=setupUniswapRouter.d.ts.map