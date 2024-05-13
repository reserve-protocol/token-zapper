import { BaseAction, DestinationOptions, InteractionConvention } from '../action/Action';
import { CurveStableSwapNGPool } from '../action/CurveStableSwapNG';
import { Address } from '../base/Address';
import { Approval } from '../base/Approval';
import { ConvexStakingWrapper as ConvexStakingWrapperEthers, IBooster } from '../contracts';
import { Token, TokenQuantity } from '../entities/Token';
import { UniverseWithCommonBaseTokens } from '../searcher/UniverseWithERC20GasTokenDefined';
import { Contract, FunctionCall, Planner, Value } from '../tx-gen/Planner';
import { CurveIntegration, CurvePool } from './setupCurve';
type ConvexStakingWrapperAddresss = string;
type ConvexStakingWrapperName = string;
interface IConvexConfig {
    boosterAddress: string;
    wrappers: {
        [tokenName: ConvexStakingWrapperName]: ConvexStakingWrapperAddresss;
    };
}
declare const BaseConvexStakingWrapper_base: abstract new (address: Address, inputToken: Token[], outputToken: Token[], interactionConvention: InteractionConvention, proceedsOptions: DestinationOptions, approvals: Approval[]) => {
    readonly protocol: string;
    readonly gen: typeof import("../tx-gen/Planner");
    readonly genUtils: {
        planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: Planner, token: Token, amount: Value, destination: Address): void;
        erc20: {
            transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: Planner, amount: Value, token: Token, destination: Address): void;
            balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): Value;
        };
    };
    readonly supportsDynamicInput: boolean;
    readonly oneUsePrZap: boolean;
    readonly returnsOutput: boolean;
    readonly addressesInUse: Set<Address>;
    outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: Planner): Value[];
    readonly address: Address;
    readonly inputToken: Token[];
    readonly outputToken: Token[];
    readonly interactionConvention: InteractionConvention;
    readonly proceedsOptions: DestinationOptions;
    readonly approvals: Approval[];
    intoSwapPath(universe: import("..").Universe<import("./ChainConfiguration").Config>, qty: TokenQuantity): Promise<import("../searcher/Swap").SwapPath>;
    quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    quoteWithSlippage(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    gasEstimate(): bigint;
    exchange(amountsIn: TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
    plan(planner: Planner, inputs: Value[], destination: Address, predictedInputs: TokenQuantity[]): Promise<Value[] | null>;
    planWithOutput(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: Planner, inputs: Value[], destination: Address, predictedInputs: TokenQuantity[]): Promise<Value[]>;
    toString(): string;
    readonly addToGraph: boolean;
    readonly outputSlippage: bigint;
    combine(other: BaseAction): {
        new (universe: import("..").Universe<import("./ChainConfiguration").Config>): {
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
            readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
            readonly gen: typeof import("../tx-gen/Planner");
            readonly genUtils: {
                planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: Planner, token: Token, amount: Value, destination: Address): void;
                erc20: {
                    transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: Planner, amount: Value, token: Token, destination: Address): void;
                    balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): Value;
                };
            };
            outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: Planner): Value[];
            readonly address: Address;
            readonly inputToken: Token[];
            readonly outputToken: Token[];
            readonly interactionConvention: InteractionConvention;
            readonly proceedsOptions: DestinationOptions;
            readonly approvals: Approval[];
            intoSwapPath(universe: import("..").Universe<import("./ChainConfiguration").Config>, qty: TokenQuantity): Promise<import("../searcher/Swap").SwapPath>;
            quoteWithSlippage(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
            exchange(amountsIn: TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
            planWithOutput(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: Planner, inputs: Value[], destination: Address, predictedInputs: TokenQuantity[]): Promise<Value[]>;
            readonly addToGraph: boolean;
            combine(other: BaseAction): {
                new (universe: import("..").Universe<import("./ChainConfiguration").Config>): any;
            };
        };
    };
};
declare abstract class BaseConvexStakingWrapper extends BaseConvexStakingWrapper_base {
    toString(): string;
    get supportsDynamicInput(): boolean;
    get oneUsePrZap(): boolean;
    get returnsOutput(): boolean;
    get outputSlippage(): bigint;
    quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    abstract planAction(input: Value): FunctionCall;
    abstract get actionName(): string;
    plan(planner: Planner, [input]: Value[], _: Address, [inputPredicted]: TokenQuantity[]): Promise<Value[] | null>;
}
declare class CurveLpToWrapper extends BaseConvexStakingWrapper {
    readonly universe: UniverseWithCommonBaseTokens;
    readonly wrapper: ConvexStakingWrapper;
    planAction(input: Value): FunctionCall;
    get actionName(): string;
    gasEstimate(): bigint;
    constructor(universe: UniverseWithCommonBaseTokens, wrapper: ConvexStakingWrapper);
}
declare class ConvexDepositToWrapper extends BaseConvexStakingWrapper {
    readonly universe: UniverseWithCommonBaseTokens;
    readonly wrapper: ConvexStakingWrapper;
    planAction(input: Value): FunctionCall;
    get actionName(): string;
    gasEstimate(): bigint;
    constructor(universe: UniverseWithCommonBaseTokens, wrapper: ConvexStakingWrapper);
}
declare class WrapperToCurveLp extends BaseConvexStakingWrapper {
    readonly universe: UniverseWithCommonBaseTokens;
    readonly wrapper: ConvexStakingWrapper;
    planAction(input: Value): FunctionCall;
    get actionName(): string;
    gasEstimate(): bigint;
    constructor(universe: UniverseWithCommonBaseTokens, wrapper: ConvexStakingWrapper);
}
declare class WrapperToConvexDeposit extends BaseConvexStakingWrapper {
    readonly universe: UniverseWithCommonBaseTokens;
    readonly wrapper: ConvexStakingWrapper;
    planAction(input: Value): FunctionCall;
    get actionName(): string;
    gasEstimate(): bigint;
    constructor(universe: UniverseWithCommonBaseTokens, wrapper: ConvexStakingWrapper);
}
declare class ConvexStakingWrapper {
    readonly curve: CurveIntegration;
    readonly wrapperToken: Token;
    readonly curveToken: Token;
    readonly convexToken: Token;
    readonly convexPoolAddress: Address;
    readonly curvePool: CurvePool | CurveStableSwapNGPool;
    readonly convexPoolId: number;
    readonly contracts: {
        contracts: {
            wrapperTokenInst: ConvexStakingWrapperEthers;
            boosterInst: IBooster;
        };
        weiroll: {
            wrapperToken: Contract;
            boosterInst: Contract;
        };
    };
    toString(): string;
    readonly curveLpToWrapper: CurveLpToWrapper;
    readonly convexDepositToWrapper: ConvexDepositToWrapper;
    readonly unwrapToCurveLp: WrapperToCurveLp;
    readonly unwrapToConvexDeposit: WrapperToConvexDeposit;
    get universe(): UniverseWithCommonBaseTokens;
    private constructor();
    attachToUniverse(): Promise<void>;
    static fromConfigAddress(curveIntegration: CurveIntegration, boosterInst: IBooster, { wrapperAddress, name, }: {
        wrapperAddress: string;
        name: string;
    }): Promise<ConvexStakingWrapper>;
}
export declare class ReserveConvex {
    readonly wrapperTokens: ConvexStakingWrapper[];
    constructor(wrapperTokens: ConvexStakingWrapper[]);
    toString(): string;
}
export declare const setupConvexStakingWrappers: (universe: UniverseWithCommonBaseTokens, curveIntegration: CurveIntegration, config: IConvexConfig) => Promise<ReserveConvex>;
export {};
//# sourceMappingURL=setupConvexStakingWrappers.d.ts.map