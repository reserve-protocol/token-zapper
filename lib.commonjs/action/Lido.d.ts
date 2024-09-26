import { type Universe } from '../Universe';
import { Address } from '../base/Address';
import { Approval } from '../base/Approval';
import { IStETH } from '../contracts';
import { type IWStETH } from '../contracts/contracts/IWStETH';
import { type Token, type TokenQuantity } from '../entities/Token';
import * as gen from '../tx-gen/Planner';
import { BaseAction, DestinationOptions, InteractionConvention } from './Action';
export declare class LidoDeployment {
    readonly universe: Universe;
    readonly steth: Token;
    readonly wsteth: Token;
    readonly contracts: {
        wstethInstance: IWStETH;
        stethInstance: IStETH;
    };
    readonly weiroll: {
        wstethInstance: gen.Contract;
        stethInstance: gen.Contract;
        weth: gen.Contract;
    };
    private rateCache;
    readonly actions: {
        stake: {
            eth: BaseStETHAction;
            weth: BaseAction;
        };
        wrap: {
            steth: BaseWSTETHAction;
        };
        unwrap: {
            stEth: BaseWSTETHAction;
        };
    };
    constructor(universe: Universe, steth: Token, wsteth: Token);
    quoteWrap(amountsIn: TokenQuantity): Promise<TokenQuantity>;
    quoteUnwrap(amountsIn: TokenQuantity): Promise<TokenQuantity>;
    private quoteMint_;
    private quoteBurn_;
    static load(universe: Universe, config: {
        steth: string;
        wsteth: string;
    }): Promise<LidoDeployment>;
}
declare const BaseLidoAction_base: abstract new (_address: Address, inputToken: Token[], outputToken: Token[], _interactionConvention: InteractionConvention, _proceedsOptions: DestinationOptions, _approvals: Approval[]) => {
    readonly protocol: string;
    readonly gen: typeof gen;
    readonly genUtils: {
        planForwardERC20(universe: Universe<import("..").Config>, planner: gen.Planner, token: Token, amount: gen.Value, destination: Address): void;
        fraction: (uni: Universe<import("..").Config>, planner: gen.Planner, input: gen.Value, fraction: bigint, comment: string, name?: string | undefined) => gen.ReturnValue;
        sub: (uni: Universe<import("..").Config>, planner: gen.Planner, a: bigint | gen.Value, b: bigint | gen.Value, comment: string, name?: string | undefined) => gen.ReturnValue;
        erc20: {
            transfer(universe: Universe<import("..").Config>, planner: gen.Planner, amount: gen.Value, token: Token, destination: Address): void;
            balanceOf(universe: Universe<import("..").Config>, planner: gen.Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): gen.Value;
        };
    };
    readonly supportsDynamicInput: boolean;
    readonly oneUsePrZap: boolean;
    readonly returnsOutput: boolean;
    readonly addressesInUse: Set<Address>;
    outputBalanceOf(universe: Universe<import("..").Config>, planner: gen.Planner): gen.Value[];
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
    plan(planner: gen.Planner, inputs: gen.Value[], destination: Address, predictedInputs: TokenQuantity[]): Promise<gen.Value[] | null>;
    planWithOutput(universe: Universe<import("..").Config>, planner: gen.Planner, inputs: gen.Value[], destination: Address, predictedInputs: TokenQuantity[]): Promise<gen.Value[]>;
    toString(): string;
    readonly addToGraph: boolean;
    readonly outputSlippage: bigint;
    combine(other: BaseAction): {
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
            plan(planner: gen.Planner, inputs: gen.Value[], destination: Address, predicted: TokenQuantity[]): Promise<gen.Value[] | null>;
            readonly universe: Universe<import("..").Config>;
            readonly gen: typeof gen;
            readonly genUtils: {
                planForwardERC20(universe: Universe<import("..").Config>, planner: gen.Planner, token: Token, amount: gen.Value, destination: Address): void;
                fraction: (uni: Universe<import("..").Config>, planner: gen.Planner, input: gen.Value, fraction: bigint, comment: string, name?: string | undefined) => gen.ReturnValue;
                sub: (uni: Universe<import("..").Config>, planner: gen.Planner, a: bigint | gen.Value, b: bigint | gen.Value, comment: string, name?: string | undefined) => gen.ReturnValue;
                erc20: {
                    transfer(universe: Universe<import("..").Config>, planner: gen.Planner, amount: gen.Value, token: Token, destination: Address): void;
                    balanceOf(universe: Universe<import("..").Config>, planner: gen.Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): gen.Value;
                };
            };
            outputBalanceOf(universe: Universe<import("..").Config>, planner: gen.Planner): gen.Value[];
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
            planWithOutput(universe: Universe<import("..").Config>, planner: gen.Planner, inputs: gen.Value[], destination: Address, predictedInputs: TokenQuantity[]): Promise<gen.Value[]>;
            readonly addToGraph: boolean;
            combine(other: BaseAction): {
                new (universe: Universe<import("..").Config>): any;
            };
        };
    };
};
declare abstract class BaseLidoAction extends BaseLidoAction_base {
    abstract get actionName(): string;
    get oneUsePrZap(): boolean;
    get supportsDynamicInput(): boolean;
    get returnsOutput(): boolean;
    plan(planner: gen.Planner, inputs: gen.Value[], _: Address, predicted: TokenQuantity[]): Promise<gen.ReturnValue[]>;
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    abstract planAction(inputs: gen.Value): gen.FunctionCall;
    abstract quoteAction(inputs: TokenQuantity): Promise<TokenQuantity>;
    toString(): string;
}
declare abstract class BaseStETHAction extends BaseLidoAction {
    readonly lido: LidoDeployment;
    readonly input: Token;
    readonly output: Token;
    get outputSlippage(): bigint;
    quoteAction(amountsIn: TokenQuantity): Promise<TokenQuantity>;
    gasEstimate(): bigint;
    constructor(lido: LidoDeployment, input: Token, output: Token);
}
declare abstract class BaseWSTETHAction extends BaseLidoAction {
    readonly lido: LidoDeployment;
    readonly input: Token;
    readonly output: Token;
    get outputSlippage(): bigint;
    get returnsOutput(): boolean;
    get supportsDynamicInput(): boolean;
    get oneUsePrZap(): boolean;
    gasEstimate(): bigint;
    abstract planAction(inputs: gen.Value): gen.FunctionCall;
    abstract quoteAction(inputs: TokenQuantity): Promise<TokenQuantity>;
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(lido: LidoDeployment, input: Token, output: Token);
}
export {};
