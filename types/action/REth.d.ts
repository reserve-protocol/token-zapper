import { type Universe } from '../Universe';
import { Address } from '../base/Address';
import { IRETHRouter } from '../contracts/contracts/IRETHRouter';
import { type Token, type TokenQuantity } from '../entities/Token';
import { Planner, Value } from '../tx-gen/Planner';
import { DestinationOptions, InteractionConvention } from './Action';
import { Approval } from '../base/Approval';
export declare class REthRouter {
    private readonly universe;
    readonly reth: Token;
    readonly routerAddress: Address;
    readonly routerInstance: IRETHRouter;
    readonly mintViaWETH: WETHToRETH;
    readonly mintViaETH: ETHToRETH;
    readonly burnToWETH: RETHToWETH;
    readonly burnToETH: RETHToETH;
    constructor(universe: Universe, reth: Token, routerAddress: Address);
    gasEstimate(): bigint;
    optimiseToREth(qtyETH: TokenQuantity): Promise<{
        portions: [import("ethers").BigNumber, import("ethers").BigNumber];
        amountOut: TokenQuantity;
        params: readonly [import("ethers").BigNumber, import("ethers").BigNumber, import("ethers").BigNumber, import("ethers").BigNumber, bigint];
    }>;
    optimiseFromREth(qtyETH: TokenQuantity): Promise<{
        portions: [import("ethers").BigNumber, import("ethers").BigNumber];
        amountOut: TokenQuantity;
        params: readonly [import("ethers").BigNumber, import("ethers").BigNumber, import("ethers").BigNumber, import("ethers").BigNumber, bigint];
    }>;
}
type IRouter = Pick<InstanceType<typeof REthRouter>, 'optimiseToREth' | 'optimiseFromREth' | 'reth' | 'gasEstimate' | 'routerInstance'>;
declare const RocketPoolBase_base: abstract new (address: Address, inputToken: Token[], outputToken: Token[], interactionConvention: InteractionConvention, proceedsOptions: DestinationOptions, approvals: Approval[]) => {
    readonly protocol: string;
    readonly gen: typeof import("../tx-gen/Planner");
    readonly genUtils: {
        planForwardERC20(universe: Universe<import("..").Config>, planner: Planner, token: Token, amount: Value, destination: Address): void;
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
declare abstract class RocketPoolBase extends RocketPoolBase_base {
    abstract get action(): string;
    toString(): string;
}
export declare class ETHToRETH extends RocketPoolBase {
    readonly universe: Universe;
    readonly router: IRouter;
    get action(): string;
    get outputSlippage(): bigint;
    plan(planner: Planner, [input_]: Value[], _: Address, [inputPrecomputed]: TokenQuantity[]): Promise<Value[]>;
    gasEstimate(): bigint;
    quote([input]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, router: IRouter);
}
export declare class WETHToRETH extends RocketPoolBase {
    readonly universe: Universe;
    readonly router: IRouter;
    get action(): string;
    get outputSlippage(): bigint;
    plan(planner: Planner, [input]: Value[], _: Address, [inputPrecomputed]: TokenQuantity[]): Promise<Value[]>;
    gasEstimate(): bigint;
    quote([input]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, router: IRouter);
}
export declare class RETHToWETH extends RocketPoolBase {
    readonly universe: Universe;
    readonly router: IRouter;
    get action(): string;
    get outputSlippage(): bigint;
    plan(planner: Planner, [input_]: Value[], _: Address, [inputPrecomputed]: TokenQuantity[]): Promise<Value[]>;
    gasEstimate(): bigint;
    quote([ethQty]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, router: IRouter);
}
export declare class RETHToETH extends RocketPoolBase {
    readonly universe: Universe;
    readonly router: IRouter;
    get action(): string;
    get outputSlippage(): bigint;
    plan(planner: Planner, [input_]: Value[], _: Address, [inputPrecomputed]: TokenQuantity[]): Promise<Value[]>;
    gasEstimate(): bigint;
    quote([ethQty]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, router: IRouter);
}
export {};
//# sourceMappingURL=REth.d.ts.map