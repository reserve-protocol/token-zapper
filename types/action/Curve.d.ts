import { PoolTemplate } from '../curve-js/src';
import { type Universe } from '../Universe';
import { Address } from '../base/Address';
import { Approval } from '../base/Approval';
import { Token, type TokenQuantity } from '../entities/Token';
import { DestinationOptions, InteractionConvention } from './Action';
import { Planner, Value } from '../tx-gen/Planner';
export declare class CurvePool {
    readonly address: Address;
    readonly lpToken: Token;
    readonly tokens: Token[];
    readonly underlyingTokens: Token[];
    readonly meta: PoolTemplate;
    readonly templateName: string;
    [Symbol.toStringTag]: string;
    constructor(address: Address, lpToken: Token, tokens: Token[], underlyingTokens: Token[], meta: PoolTemplate, templateName: string);
    toString(): string;
}
declare const CurveSwap_base: abstract new (_address: Address, inputToken: Token[], outputToken: Token[], _interactionConvention: InteractionConvention, _proceedsOptions: DestinationOptions, _approvals: Approval[]) => {
    readonly protocol: string;
    readonly gen: typeof import("../tx-gen/Planner");
    readonly genUtils: {
        planForwardERC20(universe: Universe<import("..").Config>, planner: Planner, token: Token, amount: Value, destination: Address): void;
        fraction: (uni: Universe<import("..").Config>, planner: Planner, input: Value, fraction: bigint, comment: string, name?: string | undefined) => Value | import("../tx-gen/Planner").ReturnValue;
        sub: (uni: Universe<import("..").Config>, planner: Planner, a: bigint | Value, b: bigint | Value, comment: string, name?: string | undefined) => import("../tx-gen/Planner").ReturnValue;
        erc20: {
            transfer(universe: Universe<import("..").Config>, planner: Planner, amount: Value, token: Token, destination: Address): void;
            balanceOf(universe: Universe<import("..").Config>, planner: Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): Value;
        };
    };
    readonly supportsDynamicInput: boolean;
    readonly oneUsePrZap: boolean;
    readonly returnsOutput: boolean;
    readonly addressesInUse: Set<Address>;
    outputBalanceOf(universe: Universe<import("..").Config>, planner: Planner): Value[];
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
    quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    quoteWithSlippage(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    gasEstimate(): bigint;
    exchange(amountsIn: TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
    plan(planner: Planner, inputs: Value[], destination: Address, predictedInputs: TokenQuantity[]): Promise<Value[] | null>;
    planWithOutput(universe: Universe<import("..").Config>, planner: Planner, inputs: Value[], destination: Address, predictedInputs: TokenQuantity[]): Promise<Value[]>;
    toString(): string;
    readonly addToGraph: boolean;
    readonly outputSlippage: bigint;
    combine(other: import("./Action").BaseAction): {
        new (universe: Universe<import("..").Config>): {
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
            readonly universe: Universe<import("..").Config>;
            readonly gen: typeof import("../tx-gen/Planner");
            readonly genUtils: {
                planForwardERC20(universe: Universe<import("..").Config>, planner: Planner, token: Token, amount: Value, destination: Address): void;
                fraction: (uni: Universe<import("..").Config>, planner: Planner, input: Value, fraction: bigint, comment: string, name?: string | undefined) => Value | import("../tx-gen/Planner").ReturnValue;
                sub: (uni: Universe<import("..").Config>, planner: Planner, a: bigint | Value, b: bigint | Value, comment: string, name?: string | undefined) => import("../tx-gen/Planner").ReturnValue;
                erc20: {
                    transfer(universe: Universe<import("..").Config>, planner: Planner, amount: Value, token: Token, destination: Address): void;
                    balanceOf(universe: Universe<import("..").Config>, planner: Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): Value;
                };
            };
            outputBalanceOf(universe: Universe<import("..").Config>, planner: Planner): Value[];
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
            exchange(amountsIn: TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
            planWithOutput(universe: Universe<import("..").Config>, planner: Planner, inputs: Value[], destination: Address, predictedInputs: TokenQuantity[]): Promise<Value[]>;
            readonly addToGraph: boolean;
            combine(other: import("./Action").BaseAction): {
                new (universe: Universe<import("..").Config>): any;
            };
        };
    };
};
export declare class CurveSwap extends CurveSwap_base {
    readonly universe: Universe;
    readonly pool: CurvePool;
    readonly tokenIn: Token;
    readonly tokenOut: Token;
    readonly slippage: bigint;
    get oneUsePrZap(): boolean;
    get supportsDynamicInput(): boolean;
    get returnsOutput(): boolean;
    private addressList_;
    private addPool;
    get addressesInUse(): Set<Address>;
    get outputSlippage(): bigint;
    plan(planner: Planner, inputs: Value[], _: Address, predicted: TokenQuantity[]): Promise<Value[]>;
    private estimate?;
    gasEstimate(): bigint;
    private _quote;
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    initAddressList(toks: Token[]): Promise<void>;
    constructor(universe: Universe, pool: CurvePool, tokenIn: Token, tokenOut: Token, slippage: bigint);
    toString(): string;
}
export declare const loadCurve: (universe: Universe) => Promise<{
    routerAddress: Address;
    pools: CurvePool[];
    getPoolByLPMap: Map<Token, CurvePool>;
    createRouterEdge: (tokenA: TokenQuantity, tokenB: Token, slippage: bigint) => Promise<CurveSwap>;
}>;
export type CurveApi = Awaited<ReturnType<typeof loadCurve>>;
export {};
//# sourceMappingURL=Curve.d.ts.map