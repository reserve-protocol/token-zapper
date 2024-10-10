import { Address } from '../base/Address';
import { type Token, type TokenQuantity } from '../entities/Token';
import { DestinationOptions, InteractionConvention } from './Action';
import { Approval } from '../base/Approval';
import { AaveV2Deployment, AaveV2Reserve } from '../configuration/setupAaveV2';
import type { IStaticATokenLM } from '../contracts/contracts/ISAtoken.sol';
import { Contract, FunctionCall, Planner, Value } from '../tx-gen/Planner';
declare const BaseAaveV2_base: abstract new (_address: Address, inputToken: Token[], outputToken: Token[], _interactionConvention: InteractionConvention, _proceedsOptions: DestinationOptions, _approvals: Approval[]) => {
    readonly protocol: string;
    readonly gen: typeof import("../tx-gen/Planner");
    readonly genUtils: {
        planForwardERC20(universe: import("..").Universe<import("..").Config>, planner: Planner, token: Token, amount: Value, destination: Address): void;
        fraction: (uni: import("..").Universe<import("..").Config>, planner: Planner, input: Value, fraction: bigint, comment: string, name?: string | undefined) => Value | import("../tx-gen/Planner").ReturnValue;
        sub: (uni: import("..").Universe<import("..").Config>, planner: Planner, a: bigint | Value, b: bigint | Value, comment: string, name?: string | undefined) => import("../tx-gen/Planner").ReturnValue;
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
                fraction: (uni: import("..").Universe<import("..").Config>, planner: Planner, input: Value, fraction: bigint, comment: string, name?: string | undefined) => Value | import("../tx-gen/Planner").ReturnValue;
                sub: (uni: import("..").Universe<import("..").Config>, planner: Planner, a: bigint | Value, b: bigint | Value, comment: string, name?: string | undefined) => import("../tx-gen/Planner").ReturnValue;
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
declare abstract class BaseAaveV2 extends BaseAaveV2_base {
    get reserve(): AaveV2Reserve;
    abstract readonly wrapper: AaveV2Wrapper;
    abstract readonly actionName: string;
    plan(planner: Planner, inputs: Value[], _: Address, predicted: TokenQuantity[]): Promise<null>;
    protected abstract planAction(input: Value): FunctionCall;
    get saToken(): Token;
    get underlyingToken(): Token;
    get returnsOutput(): boolean;
    get supportsDynamicInput(): boolean;
    gasEstimate(): bigint;
    get lib(): Contract;
    get universe(): import("..").Universe<import("..").Config>;
    getRate(): Promise<bigint>;
    get outputSlippage(): bigint;
    toString(): string;
}
export declare class MintSAV2TokensAction extends BaseAaveV2 {
    readonly wrapper: AaveV2Wrapper;
    actionName: string;
    protected planAction(input: Value): FunctionCall;
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(wrapper: AaveV2Wrapper);
}
export declare class BurnSAV2TokensAction extends BaseAaveV2 {
    readonly wrapper: AaveV2Wrapper;
    actionName: string;
    protected planAction(input: Value): FunctionCall;
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(wrapper: AaveV2Wrapper);
}
export declare class AaveV2Wrapper {
    readonly reserve: AaveV2Reserve;
    readonly saToken: Token;
    readonly wrapperInst: IStaticATokenLM;
    readonly mint: MintSAV2TokensAction;
    readonly burn: BurnSAV2TokensAction;
    readonly wrapperLib: Contract;
    get reserveToken(): Token;
    get universe(): import("..").Universe<import("..").Config>;
    private constructor();
    static create(aave: AaveV2Deployment, saToken: Token): Promise<AaveV2Wrapper>;
    toString(): string;
}
export {};
