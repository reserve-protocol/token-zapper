import { type Address } from '../../base/Address';
import { type Token } from '../Token';
import { type DestinationOptions, type InteractionConvention } from '../../action/Action';
import { type SwapDirection } from './TwoTokenPoolTypes';
declare const UniBase_base: abstract new (address: Address, inputToken: Token[], outputToken: Token[], interactionConvention: InteractionConvention, proceedsOptions: DestinationOptions, approvals: import("../../base/Approval").Approval[]) => {
    readonly protocol: string;
    readonly gen: typeof import("../../tx-gen/Planner");
    readonly genUtils: {
        planForwardERC20(universe: import("../..").Universe<import("../..").Config>, planner: import("../../tx-gen/Planner").Planner, token: Token, amount: import("../../tx-gen/Planner").Value, destination: Address): void;
        erc20: {
            transfer(universe: import("../..").Universe<import("../..").Config>, planner: import("../../tx-gen/Planner").Planner, amount: import("../../tx-gen/Planner").Value, token: Token, destination: Address): void;
            balanceOf(universe: import("../..").Universe<import("../..").Config>, planner: import("../../tx-gen/Planner").Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../../tx-gen/Planner").Value;
        };
    };
    readonly oneUsePrZap: boolean;
    readonly addressesInUse: Set<Address>;
    outputBalanceOf(universe: import("../..").Universe<import("../..").Config>, planner: import("../../tx-gen/Planner").Planner): import("../../tx-gen/Planner").Value[];
    readonly address: Address;
    readonly inputToken: Token[];
    readonly outputToken: Token[];
    readonly interactionConvention: InteractionConvention;
    readonly proceedsOptions: DestinationOptions;
    readonly approvals: import("../../base/Approval").Approval[];
    quote(amountsIn: import("../Token").TokenQuantity[]): Promise<import("../Token").TokenQuantity[]>;
    quoteWithSlippage(amountsIn: import("../Token").TokenQuantity[]): Promise<import("../Token").TokenQuantity[]>;
    gasEstimate(): bigint;
    exchange(amountsIn: import("../Token").TokenQuantity[], balances: import("../TokenAmounts").TokenAmounts): Promise<void>;
    plan(planner: import("../../tx-gen/Planner").Planner, inputs: import("../../tx-gen/Planner").Value[], destination: Address, predictedInputs: import("../Token").TokenQuantity[], outputNotUsed?: boolean | undefined): Promise<import("../../tx-gen/Planner").Value[]>;
    toString(): string;
    readonly addToGraph: boolean;
    readonly outputSlippage: bigint;
};
export declare abstract class UniBase extends UniBase_base {
    readonly direction: SwapDirection;
    readonly destination: DestinationOptions;
    readonly interactionConvention: InteractionConvention;
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
//# sourceMappingURL=UniBase.d.ts.map