import { type Universe } from '../Universe';
import { Address } from '../base/Address';
import { Approval } from '../base/Approval';
import { type Token, type TokenQuantity } from '../entities/Token';
import { Planner, Value } from '../tx-gen/Planner';
import { DestinationOptions, InteractionConvention } from './Action';
export declare class ERC4626TokenVault {
    readonly shareToken: Token;
    readonly underlying: Token;
    constructor(shareToken: Token, underlying: Token);
    get address(): Address;
}
export declare const ERC4626DepositAction: (proto: string) => {
    new (universe: Universe, underlying: Token, shareToken: Token, slippage: bigint): {
        readonly outputSlippage: bigint;
        plan(planner: Planner, inputs: Value[], destination: Address): Promise<Value[]>;
        gasEstimate(): bigint;
        quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
        readonly universe: Universe;
        readonly underlying: Token;
        readonly shareToken: Token;
        readonly slippage: bigint;
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
        readonly oneUsePrZap: boolean;
        readonly addressesInUse: Set<Address>;
        outputBalanceOf(universe: Universe<import("..").Config>, planner: Planner): Value[];
        readonly address: Address;
        readonly inputToken: Token[];
        readonly outputToken: Token[];
        readonly interactionConvention: InteractionConvention;
        readonly proceedsOptions: DestinationOptions;
        readonly approvals: Approval[];
        quoteWithSlippage(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
        exchange(amountsIn: TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
        readonly addToGraph: boolean;
    };
};
export declare const ERC4626WithdrawAction: (proto: string) => {
    new (universe: Universe, underlying: Token, shareToken: Token, slippage: bigint): {
        plan(planner: Planner, inputs: Value[], destination: Address, predicted: TokenQuantity[]): Promise<Value[]>;
        gasEstimate(): bigint;
        quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
        readonly universe: Universe;
        readonly underlying: Token;
        readonly shareToken: Token;
        readonly slippage: bigint;
        toString(): string;
        readonly outputSliptepage: bigint;
        readonly protocol: string;
        readonly gen: typeof import("../tx-gen/Planner");
        readonly genUtils: {
            planForwardERC20(universe: Universe<import("..").Config>, planner: Planner, token: Token, amount: Value, destination: Address): void;
            erc20: {
                transfer(universe: Universe<import("..").Config>, planner: Planner, amount: Value, token: Token, destination: Address): void;
                balanceOf(universe: Universe<import("..").Config>, planner: Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): Value;
            };
        };
        readonly oneUsePrZap: boolean;
        readonly addressesInUse: Set<Address>;
        outputBalanceOf(universe: Universe<import("..").Config>, planner: Planner): Value[];
        readonly address: Address;
        readonly inputToken: Token[];
        readonly outputToken: Token[];
        readonly interactionConvention: InteractionConvention;
        readonly proceedsOptions: DestinationOptions;
        readonly approvals: Approval[];
        quoteWithSlippage(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
        exchange(amountsIn: TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
        readonly addToGraph: boolean;
        readonly outputSlippage: bigint;
    };
};
//# sourceMappingURL=ERC4626.d.ts.map