import { PoolTemplate } from '../curve-js/src';
import { type IRoute } from '../curve-js/src/interfaces';
import { type Universe } from '../Universe';
import { Address } from '../base/Address';
import { Approval } from '../base/Approval';
import { Token, type TokenQuantity } from '../entities/Token';
import { DestinationOptions, InteractionConvention } from './Action';
import { Planner, Value } from '../tx-gen/Planner';
declare class CurvePool {
    readonly address: Address;
    readonly tokens: Token[];
    readonly underlyingTokens: Token[];
    readonly meta: PoolTemplate;
    readonly templateName: string;
    [Symbol.toStringTag]: string;
    constructor(address: Address, tokens: Token[], underlyingTokens: Token[], meta: PoolTemplate, templateName: string);
    toString(): string;
}
declare const CurveSwap_base: abstract new (address: Address, inputToken: Token[], outputToken: Token[], interactionConvention: InteractionConvention, proceedsOptions: DestinationOptions, approvals: Approval[]) => {
    readonly protocol: string;
    readonly gen: typeof import("../tx-gen/Planner");
    readonly genUtils: {
        planForwardERC20(universe: Universe<import("..").Config>, planner: Planner, token: Token, amount: Value, destination: Address): void;
        erc20: {
            transfer(universe: Universe<import("..").Config>, planner: Planner, amount: Value, token: Token, destination: Address): void;
            balanceOf(universe: Universe<import("..").Config>, planner: Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): Value;
        };
    };
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
export declare class CurveSwap extends CurveSwap_base {
    readonly universe: Universe;
    readonly pool: CurvePool;
    readonly tokenIn: Token;
    readonly tokenOut: Token;
    private readonly predefinedRoutes;
    plan(planner: Planner, inputs: Value[], _: Address, [amountsIn]: TokenQuantity[]): Promise<Value[]>;
    private estimate?;
    gasEstimate(): bigint;
    private _quote;
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, pool: CurvePool, tokenIn: Token, tokenOut: Token, predefinedRoutes: Record<string, Promise<IRoute>>);
    toString(): string;
}
export declare const loadCurve: (universe: Universe, predefinedRoutes_: Record<string, IRoute>) => Promise<{
    createLpToken: (token: Token) => Promise<void>;
    createRouterEdge: (tokenA: Token, tokenB: Token) => CurveSwap;
}>;
export {};
