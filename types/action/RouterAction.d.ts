import { type Universe } from '../Universe';
import { DexRouter } from '../aggregators/DexAggregator';
import { type Address } from '../base/Address';
import { Approval } from '../base/Approval';
import { type TokenQuantity, Token } from '../entities/Token';
import { Planner, Value } from '../tx-gen/Planner';
import { DestinationOptions, InteractionConvention } from './Action';
export declare const RouterAction: (protocol: string) => {
    new (dex: DexRouter, universe: Universe, router: Address, inputToken: Token, outputToken: Token): {
        plan(planner: Planner, inputs: Value[], destination: Address, predicted: TokenQuantity[]): Promise<Value[]>;
        gasEstimate(): bigint;
        innerQuote(input: TokenQuantity[]): Promise<import("../searcher/Swap").SwapPath>;
        quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
        readonly dex: DexRouter;
        readonly universe: Universe;
        readonly router: Address;
        toString(): string;
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
        quoteWithSlippage(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
        exchange(amountsIn: TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
        generateOutputTokenBalance(universe: Universe<import("..").Config>, planner: Planner, comment?: string | undefined): Value;
        readonly addToGraph: boolean;
        readonly outputSlippage: bigint;
    };
};
//# sourceMappingURL=RouterAction.d.ts.map