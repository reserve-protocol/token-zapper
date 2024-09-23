import { type Universe } from '../Universe';
import { Address } from '../base/Address';
import { Approval } from '../base/Approval';
import { BlockCache } from '../base/BlockBasedCache';
import { IERC4626 } from '../contracts';
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
        readonly returnsOutput: boolean;
        plan(planner: Planner, inputs: Value[], destination: Address, predicted: TokenQuantity[]): Promise<import("../tx-gen/Planner").ReturnValue[]>;
        gasEstimate(): bigint;
        _quote(amountIn: bigint): Promise<TokenQuantity[]>;
        readonly inst: IERC4626;
        readonly quoteCache: BlockCache<bigint, TokenQuantity[]>;
        quote([amountIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
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
        readonly supportsDynamicInput: boolean;
        readonly oneUsePrZap: boolean;
        readonly addressesInUse: Set<Address>;
        outputBalanceOf(universe: Universe<import("..").Config>, planner: Planner): Value[];
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
        planWithOutput(universe: Universe<import("..").Config>, planner: Planner, inputs: Value[], destination: Address, predictedInputs: TokenQuantity[]): Promise<Value[]>;
        readonly addToGraph: boolean;
        combine(other: import("./Action").BaseAction): {
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
                plan(planner: Planner, inputs: Value[], destination: Address, predicted: TokenQuantity[]): Promise<Value[] | null>;
                readonly universe: Universe<import("..").Config>;
                readonly gen: typeof import("../tx-gen/Planner");
                readonly genUtils: {
                    planForwardERC20(universe: Universe<import("..").Config>, planner: Planner, token: Token, amount: Value, destination: Address): void;
                    erc20: {
                        transfer(universe: Universe<import("..").Config>, planner: Planner, amount: Value, token: Token, destination: Address): void;
                        balanceOf(universe: Universe<import("..").Config>, planner: Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): Value;
                    };
                };
                outputBalanceOf(universe: Universe<import("..").Config>, planner: Planner): Value[];
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
                planWithOutput(universe: Universe<import("..").Config>, planner: Planner, inputs: Value[], destination: Address, predictedInputs: TokenQuantity[]): Promise<Value[]>;
                readonly addToGraph: boolean;
                combine(other: import("./Action").BaseAction): {
                    new (universe: Universe<import("..").Config>): any;
                };
            };
        };
    };
};
export declare const ERC4626WithdrawAction: (proto: string) => {
    new (universe: Universe, underlying: Token, shareToken: Token, slippage: bigint): {
        readonly returnsOutput: boolean;
        plan(planner: Planner, inputs: Value[], destination: Address, predicted: TokenQuantity[]): Promise<Value[]>;
        gasEstimate(): bigint;
        _quote(amountIn: bigint): Promise<TokenQuantity[]>;
        readonly inst: IERC4626;
        readonly quoteCache: BlockCache<bigint, TokenQuantity[]>;
        quote([amountIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
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
        readonly supportsDynamicInput: boolean;
        readonly oneUsePrZap: boolean;
        readonly addressesInUse: Set<Address>;
        outputBalanceOf(universe: Universe<import("..").Config>, planner: Planner): Value[];
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
        planWithOutput(universe: Universe<import("..").Config>, planner: Planner, inputs: Value[], destination: Address, predictedInputs: TokenQuantity[]): Promise<Value[]>;
        readonly addToGraph: boolean;
        readonly outputSlippage: bigint;
        combine(other: import("./Action").BaseAction): {
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
                plan(planner: Planner, inputs: Value[], destination: Address, predicted: TokenQuantity[]): Promise<Value[] | null>;
                readonly universe: Universe<import("..").Config>;
                readonly gen: typeof import("../tx-gen/Planner");
                readonly genUtils: {
                    planForwardERC20(universe: Universe<import("..").Config>, planner: Planner, token: Token, amount: Value, destination: Address): void;
                    erc20: {
                        transfer(universe: Universe<import("..").Config>, planner: Planner, amount: Value, token: Token, destination: Address): void;
                        balanceOf(universe: Universe<import("..").Config>, planner: Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): Value;
                    };
                };
                outputBalanceOf(universe: Universe<import("..").Config>, planner: Planner): Value[];
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
                planWithOutput(universe: Universe<import("..").Config>, planner: Planner, inputs: Value[], destination: Address, predictedInputs: TokenQuantity[]): Promise<Value[]>;
                readonly addToGraph: boolean;
                combine(other: import("./Action").BaseAction): {
                    new (universe: Universe<import("..").Config>): any;
                };
            };
        };
    };
};
//# sourceMappingURL=ERC4626.d.ts.map