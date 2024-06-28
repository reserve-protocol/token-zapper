import { Address } from '../base/Address';
import { Approval } from '../base/Approval';
import { AaveV3Deployment, AaveV3Reserve } from '../configuration/setupAaveV3';
import { IStaticATokenV3LM } from '../contracts';
import { type Token, type TokenQuantity } from '../entities/Token';
import { Contract, FunctionCall, Planner, Value } from '../tx-gen/Planner';
import { DestinationOptions, InteractionConvention } from './Action';
declare const BaseAaveV3_base: abstract new (_address: Address, inputToken: Token[], outputToken: Token[], _interactionConvention: InteractionConvention, _proceedsOptions: DestinationOptions, _approvals: Approval[]) => {
    readonly protocol: string;
    readonly gen: typeof import("../tx-gen/Planner");
    readonly genUtils: {
        planForwardERC20(universe: import("..").Universe<import("..").Config>, planner: Planner, token: Token, amount: Value, destination: Address): void;
        erc20: {
            transfer(universe: import("..").Universe<import("..").Config>, planner: Planner, amount: Value, token: Token, destination: Address): void;
            balanceOf(universe: import("..").Universe<import("..").Config>, planner: Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): Value;
        };
    };
    readonly supportsDynamicInput: boolean;
    readonly oneUsePrZap: boolean;
    readonly returnsOutput: boolean;
    readonly addressesInUse: Set<Address>;
    outputBalanceOf(universe: import("..").Universe<import("..").Config>, planner: Planner): Value[];
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
    intoSwapPath(universe: import("..").Universe<import("..").Config>, qty: TokenQuantity): Promise<import("../searcher/Swap").SwapPath>;
    quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    quoteWithSlippage(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    gasEstimate(): bigint;
    exchange(amountsIn: TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
    plan(planner: Planner, inputs: Value[], destination: Address, predictedInputs: TokenQuantity[]): Promise<Value[] | null>;
    planWithOutput(universe: import("..").Universe<import("..").Config>, planner: Planner, inputs: Value[], destination: Address, predictedInputs: TokenQuantity[]): Promise<Value[]>;
    toString(): string;
    readonly addToGraph: boolean;
    readonly outputSlippage: bigint;
    combine(other: import("./Action").BaseAction): {
        new (universe: import("..").Universe<import("..").Config>): {
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
            readonly universe: import("..").Universe<import("..").Config>;
            readonly gen: typeof import("../tx-gen/Planner");
            readonly genUtils: {
                planForwardERC20(universe: import("..").Universe<import("..").Config>, planner: Planner, token: Token, amount: Value, destination: Address): void;
                erc20: {
                    transfer(universe: import("..").Universe<import("..").Config>, planner: Planner, amount: Value, token: Token, destination: Address): void;
                    balanceOf(universe: import("..").Universe<import("..").Config>, planner: Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): Value;
                };
            };
            outputBalanceOf(universe: import("..").Universe<import("..").Config>, planner: Planner): Value[];
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
            intoSwapPath(universe: import("..").Universe<import("..").Config>, qty: TokenQuantity): Promise<import("../searcher/Swap").SwapPath>;
            quoteWithSlippage(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
            exchange(amountsIn: TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
            planWithOutput(universe: import("..").Universe<import("..").Config>, planner: Planner, inputs: Value[], destination: Address, predictedInputs: TokenQuantity[]): Promise<Value[]>;
            readonly addToGraph: boolean;
            combine(other: import("./Action").BaseAction): {
                new (universe: import("..").Universe<import("..").Config>): any;
            };
        };
    };
};
declare abstract class BaseAaveV3 extends BaseAaveV3_base {
    get reserve(): AaveV3Reserve;
    abstract readonly wrapper: AaveV3Wrapper;
    abstract readonly actionName: string;
    plan(planner: Planner, inputs: Value[], _: Address, predicted: TokenQuantity[]): Promise<null>;
    protected abstract planAction(input: Value): FunctionCall;
    get outputSlippage(): bigint;
    get saToken(): Token;
    get underlyingToken(): Token;
    get returnsOutput(): boolean;
    get supportsDynamicInput(): boolean;
    gasEstimate(): bigint;
    get lib(): Contract;
    get universe(): import("..").Universe<import("..").Config>;
    getRate(): Promise<bigint>;
    toString(): string;
}
export declare class MintSAV3TokensAction extends BaseAaveV3 {
    readonly wrapper: AaveV3Wrapper;
    actionName: string;
    protected planAction(input: Value): FunctionCall;
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(wrapper: AaveV3Wrapper);
}
export declare class BurnSAV3TokensAction extends BaseAaveV3 {
    readonly wrapper: AaveV3Wrapper;
    actionName: string;
    protected planAction(input: Value): FunctionCall;
    get outputSlippage(): bigint;
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(wrapper: AaveV3Wrapper);
}
export declare class AaveV3Wrapper {
    readonly reserve: AaveV3Reserve;
    readonly saToken: Token;
    readonly wrapperInst: IStaticATokenV3LM;
    readonly mint: MintSAV3TokensAction;
    readonly burn: BurnSAV3TokensAction;
    readonly wrapperLib: Contract;
    get reserveToken(): Token;
    get universe(): import("..").Universe<import("..").Config>;
    private constructor();
    static create(aaveV3: AaveV3Deployment, saToken: Token): Promise<AaveV3Wrapper>;
    toString(): string;
}
export {};
