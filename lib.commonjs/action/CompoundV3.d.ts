import { Address } from "../base/Address";
import { Approval } from "../base/Approval";
import { Comet, CometWrapper } from "../configuration/setupCompV3";
import { TokenQuantity, type Token } from "../entities/Token";
import { Planner, Value } from "../tx-gen/Planner";
import { InteractionConvention, DestinationOptions } from "./Action";
declare const BaseCometAction_base: abstract new (_address: Address, inputToken: Token[], outputToken: Token[], _interactionConvention: InteractionConvention, _proceedsOptions: DestinationOptions, _approvals: Approval[]) => {
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
export declare abstract class BaseCometAction extends BaseCometAction_base {
    readonly mainAddress: Address;
    readonly comet: Comet;
    readonly actionName: string;
    get outputSlippage(): bigint;
    get returnsOutput(): boolean;
    toString(): string;
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    get receiptToken(): Token;
    get universe(): import("..").Universe<import("..").Config>;
    gasEstimate(): bigint;
    constructor(mainAddress: Address, comet: Comet, actionName: string, opts: {
        inputToken: Token[];
        outputToken: Token[];
        interaction: InteractionConvention;
        destination: DestinationOptions;
        approvals: Approval[];
    });
    plan(planner: Planner, [input]: Value[], destination: Address, [predicted]: TokenQuantity[]): Promise<null>;
    abstract planAction(planner: Planner, destination: Address, input: Value, predicted: TokenQuantity): void;
}
export declare class MintCometAction extends BaseCometAction {
    constructor(comet: Comet);
    planAction(planner: Planner, destination: Address, input: Value | null, predicted: TokenQuantity): void;
}
export declare class MintCometWrapperAction extends BaseCometAction {
    readonly cometWrapper: CometWrapper;
    constructor(cometWrapper: CometWrapper);
    toString(): string;
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    planAction(planner: Planner, _: Address, input: Value | null, predicted: TokenQuantity): void;
}
export declare class BurnCometAction extends BaseCometAction {
    constructor(comet: Comet);
    planAction(planner: Planner, destination: Address, input: Value | null, predicted: TokenQuantity): void;
}
export declare class BurnCometWrapperAction extends BaseCometAction {
    readonly cometWrapper: CometWrapper;
    constructor(cometWrapper: CometWrapper);
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    planAction(planner: Planner, _: Address, input: Value | null, predicted: TokenQuantity): void;
}
export {};
