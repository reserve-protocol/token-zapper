import { type Universe } from '../Universe';
import { type Address } from '../base/Address';
import { IRETHRouter } from '../contracts/contracts/IRETHRouter';
import { type Token, type TokenQuantity } from '../entities/Token';
import { Planner, Value } from '../tx-gen/Planner';
import { DestinationOptions, InteractionConvention } from './Action';
export declare class REthRouter {
    private readonly universe;
    readonly reth: Token;
    readonly routerAddress: Address;
    readonly routerInstance: IRETHRouter;
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
declare const ETHToRETH_base: abstract new (address: Address, inputToken: Token[], outputToken: Token[], interactionConvention: InteractionConvention, proceedsOptions: DestinationOptions, approvals: import("../base/Approval").Approval[]) => {
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
    readonly approvals: import("../base/Approval").Approval[];
    quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    quoteWithSlippage(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    gasEstimate(): bigint;
    exchange(amountsIn: TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
    plan(planner: Planner, inputs: Value[], destination: Address, predictedInputs: TokenQuantity[], outputNotUsed?: boolean | undefined): Promise<Value[]>;
    toString(): string;
    readonly addToGraph: boolean;
    readonly outputSlippage: bigint;
};
export declare class ETHToRETH extends ETHToRETH_base {
    readonly universe: Universe;
    readonly router: IRouter;
    plan(planner: Planner, [input]: Value[], _: Address, [inputPrecomputed]: TokenQuantity[]): Promise<Value[]>;
    gasEstimate(): bigint;
    quote([ethQty]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, router: IRouter);
    toString(): string;
}
declare const RETHToETH_base: abstract new (address: Address, inputToken: Token[], outputToken: Token[], interactionConvention: InteractionConvention, proceedsOptions: DestinationOptions, approvals: import("../base/Approval").Approval[]) => {
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
    readonly approvals: import("../base/Approval").Approval[];
    quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    quoteWithSlippage(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    gasEstimate(): bigint;
    exchange(amountsIn: TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
    plan(planner: Planner, inputs: Value[], destination: Address, predictedInputs: TokenQuantity[], outputNotUsed?: boolean | undefined): Promise<Value[]>;
    toString(): string;
    readonly addToGraph: boolean;
    readonly outputSlippage: bigint;
};
export declare class RETHToETH extends RETHToETH_base {
    readonly universe: Universe;
    readonly router: IRouter;
    plan(planner: Planner, [input]: Value[], _: Address, [inputPrecomputed]: TokenQuantity[]): Promise<Value[]>;
    gasEstimate(): bigint;
    quote([ethQty]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, router: IRouter);
    toString(): string;
}
export {};
//# sourceMappingURL=REth.d.ts.map