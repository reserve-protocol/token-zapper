import { Address } from '../base/Address';
import { type Token, type TokenQuantity } from '../entities/Token';
import { type Universe } from '../Universe';
import { DestinationOptions, InteractionConvention } from './Action';
import { type OneInchSwapResponse } from '../aggregators/oneInch/oneInchRegistry';
import { Approval } from '../base/Approval';
import { Planner, Value } from '../tx-gen/Planner';
declare const OneInchAction_base: abstract new (address: Address, inputToken: Token[], outputToken: Token[], interactionConvention: InteractionConvention, proceedsOptions: DestinationOptions, approvals: Approval[]) => {
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
    readonly approvals: Approval[];
    quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    quoteWithSlippage(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    gasEstimate(): bigint;
    exchange(amountsIn: TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
    plan(planner: Planner, inputs: Value[], destination: Address, predictedInputs: TokenQuantity[], outputNotUsed?: boolean | undefined): Promise<Value[]>;
    toString(): string;
    readonly addToGraph: boolean;
    readonly outputSlippage: bigint;
};
export declare class OneInchAction extends OneInchAction_base {
    readonly universe: Universe;
    private readonly actionQuote;
    plan(planner: Planner, _: Value[], destination: Address): Promise<Value[]>;
    gasEstimate(): bigint;
    toString(): string;
    private readonly outputQty;
    quote(_: TokenQuantity[]): Promise<TokenQuantity[]>;
    private constructor();
    static createAction(universe: Universe, input: Token, output: Token, quote: OneInchSwapResponse, slippagePercent: number): OneInchAction;
}
export {};
//# sourceMappingURL=OneInch.d.ts.map