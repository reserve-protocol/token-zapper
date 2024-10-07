import { type Address } from '../../base/Address';
import { type Token } from '../Token';
import { type DestinationOptions, type InteractionConvention } from '../../action/Action';
import { type SwapDirection } from './TwoTokenPoolTypes';
declare const UniBase_base: abstract new (_address: Address, inputToken: Token[], outputToken: Token[], _interactionConvention: InteractionConvention, _proceedsOptions: DestinationOptions, _approvals: import("../../base/Approval").Approval[]) => {
    readonly protocol: string;
    readonly gen: typeof import("../../tx-gen/Planner");
    readonly genUtils: {
        planForwardERC20(universe: import("../..").Universe<import("../..").Config>, planner: import("../../tx-gen/Planner").Planner, token: Token, amount: import("../../tx-gen/Planner").Value, destination: Address): void;
        fraction: (uni: import("../..").Universe<import("../..").Config>, planner: import("../../tx-gen/Planner").Planner, input: import("../../tx-gen/Planner").Value, fraction: bigint, comment: string, name?: string | undefined) => import("../../tx-gen/Planner").Value | import("../../tx-gen/Planner").ReturnValue;
        sub: (uni: import("../..").Universe<import("../..").Config>, planner: import("../../tx-gen/Planner").Planner, a: bigint | import("../../tx-gen/Planner").Value, b: bigint | import("../../tx-gen/Planner").Value, comment: string, name?: string | undefined) => import("../../tx-gen/Planner").ReturnValue;
        erc20: {
            transfer(universe: import("../..").Universe<import("../..").Config>, planner: import("../../tx-gen/Planner").Planner, amount: import("../../tx-gen/Planner").Value, token: Token, destination: Address): void;
            balanceOf(universe: import("../..").Universe<import("../..").Config>, planner: import("../../tx-gen/Planner").Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../../tx-gen/Planner").Value;
        };
    };
    readonly supportsDynamicInput: boolean;
    readonly oneUsePrZap: boolean;
    readonly returnsOutput: boolean;
    readonly addressesInUse: Set<Address>;
    outputBalanceOf(universe: import("../..").Universe<import("../..").Config>, planner: import("../../tx-gen/Planner").Planner): import("../../tx-gen/Planner").Value[];
    readonly interactionConvention: InteractionConvention;
    readonly proceedsOptions: DestinationOptions;
    readonly approvals: import("../../base/Approval").Approval[];
    readonly address: Address;
    _address: Address;
    readonly inputToken: Token[];
    readonly outputToken: Token[];
    _interactionConvention: InteractionConvention;
    _proceedsOptions: DestinationOptions;
    _approvals: import("../../base/Approval").Approval[];
    intoSwapPath(universe: import("../..").Universe<import("../..").Config>, qty: import("../Token").TokenQuantity): Promise<import("../../searcher/Swap").SwapPath>;
    quote(amountsIn: import("../Token").TokenQuantity[]): Promise<import("../Token").TokenQuantity[]>;
    quoteWithSlippage(amountsIn: import("../Token").TokenQuantity[]): Promise<import("../Token").TokenQuantity[]>;
    gasEstimate(): bigint;
    exchange(amountsIn: import("../Token").TokenQuantity[], balances: import("../TokenAmounts").TokenAmounts): Promise<void>;
    plan(planner: import("../../tx-gen/Planner").Planner, inputs: import("../../tx-gen/Planner").Value[], destination: Address, predictedInputs: import("../Token").TokenQuantity[]): Promise<import("../../tx-gen/Planner").Value[] | null>;
    planWithOutput(universe: import("../..").Universe<import("../..").Config>, planner: import("../../tx-gen/Planner").Planner, inputs: import("../../tx-gen/Planner").Value[], destination: Address, predictedInputs: import("../Token").TokenQuantity[]): Promise<import("../../tx-gen/Planner").Value[]>;
    toString(): string;
    readonly addToGraph: boolean;
    readonly outputSlippage: bigint;
    combine(other: import("../../action/Action").BaseAction): {
        new (universe: import("../..").Universe<import("../..").Config>): {
            readonly protocol: string;
            toString(): string;
            quote(amountsIn: import("../Token").TokenQuantity[]): Promise<import("../Token").TokenQuantity[]>;
            readonly supportsDynamicInput: boolean;
            readonly oneUsePrZap: boolean;
            readonly addressesInUse: Set<Address>;
            readonly returnsOutput: boolean;
            readonly outputSlippage: bigint;
            gasEstimate(): bigint;
            plan(planner: import("../../tx-gen/Planner").Planner, inputs: import("../../tx-gen/Planner").Value[], destination: Address, predicted: import("../Token").TokenQuantity[]): Promise<import("../../tx-gen/Planner").Value[] | null>;
            readonly universe: import("../..").Universe<import("../..").Config>;
            readonly gen: typeof import("../../tx-gen/Planner");
            readonly genUtils: {
                planForwardERC20(universe: import("../..").Universe<import("../..").Config>, planner: import("../../tx-gen/Planner").Planner, token: Token, amount: import("../../tx-gen/Planner").Value, destination: Address): void;
                fraction: (uni: import("../..").Universe<import("../..").Config>, planner: import("../../tx-gen/Planner").Planner, input: import("../../tx-gen/Planner").Value, fraction: bigint, comment: string, name?: string | undefined) => import("../../tx-gen/Planner").Value | import("../../tx-gen/Planner").ReturnValue;
                sub: (uni: import("../..").Universe<import("../..").Config>, planner: import("../../tx-gen/Planner").Planner, a: bigint | import("../../tx-gen/Planner").Value, b: bigint | import("../../tx-gen/Planner").Value, comment: string, name?: string | undefined) => import("../../tx-gen/Planner").ReturnValue;
                erc20: {
                    transfer(universe: import("../..").Universe<import("../..").Config>, planner: import("../../tx-gen/Planner").Planner, amount: import("../../tx-gen/Planner").Value, token: Token, destination: Address): void;
                    balanceOf(universe: import("../..").Universe<import("../..").Config>, planner: import("../../tx-gen/Planner").Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../../tx-gen/Planner").Value;
                };
            };
            outputBalanceOf(universe: import("../..").Universe<import("../..").Config>, planner: import("../../tx-gen/Planner").Planner): import("../../tx-gen/Planner").Value[];
            readonly interactionConvention: InteractionConvention;
            readonly proceedsOptions: DestinationOptions;
            readonly approvals: import("../../base/Approval").Approval[];
            readonly address: Address;
            _address: Address;
            readonly inputToken: Token[];
            readonly outputToken: Token[];
            _interactionConvention: InteractionConvention;
            _proceedsOptions: DestinationOptions;
            _approvals: import("../../base/Approval").Approval[];
            intoSwapPath(universe: import("../..").Universe<import("../..").Config>, qty: import("../Token").TokenQuantity): Promise<import("../../searcher/Swap").SwapPath>;
            quoteWithSlippage(amountsIn: import("../Token").TokenQuantity[]): Promise<import("../Token").TokenQuantity[]>;
            exchange(amountsIn: import("../Token").TokenQuantity[], balances: import("../TokenAmounts").TokenAmounts): Promise<void>;
            planWithOutput(universe: import("../..").Universe<import("../..").Config>, planner: import("../../tx-gen/Planner").Planner, inputs: import("../../tx-gen/Planner").Value[], destination: Address, predictedInputs: import("../Token").TokenQuantity[]): Promise<import("../../tx-gen/Planner").Value[]>;
            readonly addToGraph: boolean;
            combine(other: import("../../action/Action").BaseAction): {
                new (universe: import("../..").Universe<import("../..").Config>): any;
            };
        };
    };
};
export declare abstract class UniBase extends UniBase_base {
    readonly direction: SwapDirection;
    readonly destination: DestinationOptions;
    readonly zeroForOne: boolean;
    readonly output: Token;
    readonly input: Token;
    constructor(basePool: {
        address: Address;
        token0: Token;
        token1: Token;
    }, direction: SwapDirection, destination: DestinationOptions, interactionConvention: InteractionConvention);
}
export {};
