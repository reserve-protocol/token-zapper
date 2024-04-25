import { type Universe } from '../Universe';
import { Address } from '../base/Address';
import { type TokenQuantity } from '../entities/Token';
import { TokenAmounts } from '../entities/TokenAmounts';
import { DestinationOptions, InteractionConvention } from './Action';
import { Approval } from '../base/Approval';
import { IBasket } from '../entities/TokenBasket';
import { Planner, Value } from '../tx-gen/Planner';
declare const MintRTokenAction_base: abstract new (address: Address, inputToken: import("../entities/Token").Token[], outputToken: import("../entities/Token").Token[], interactionConvention: InteractionConvention, proceedsOptions: DestinationOptions, approvals: Approval[]) => {
    readonly protocol: string;
    readonly gen: typeof import("../tx-gen/Planner");
    readonly genUtils: {
        planForwardERC20(universe: Universe<import("..").Config>, planner: Planner, token: import("../entities/Token").Token, amount: Value, destination: Address): void;
        erc20: {
            transfer(universe: Universe<import("..").Config>, planner: Planner, amount: Value, token: import("../entities/Token").Token, destination: Address): void;
            balanceOf(universe: Universe<import("..").Config>, planner: Planner, token: import("../entities/Token").Token, owner: Address, comment?: string | undefined, varName?: string | undefined): Value;
        };
    };
    readonly address: Address;
    readonly inputToken: import("../entities/Token").Token[];
    readonly outputToken: import("../entities/Token").Token[];
    readonly interactionConvention: InteractionConvention;
    readonly proceedsOptions: DestinationOptions;
    readonly approvals: Approval[];
    quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    quoteWithSlippage(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    gasEstimate(): bigint;
    exchange(amountsIn: TokenQuantity[], balances: TokenAmounts): Promise<void>;
    plan(planner: Planner, inputs: Value[], destination: Address, predictedInputs: TokenQuantity[], outputNotUsed?: boolean | undefined): Promise<Value[]>;
    toString(): string;
    readonly addToGraph: boolean;
    readonly outputSlippage: bigint;
};
export declare class MintRTokenAction extends MintRTokenAction_base {
    readonly universe: Universe;
    readonly basket: IBasket;
    plan(planner: Planner, inputs: Value[], destination: Address): Promise<import("../tx-gen/Planner").ReturnValue[]>;
    gasEstimate(): bigint;
    get outputSlippage(): bigint;
    quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    exchange(input: TokenQuantity[], balances: TokenAmounts): Promise<void>;
    constructor(universe: Universe, basket: IBasket);
    readonly interactionConvention = InteractionConvention.ApprovalRequired;
    readonly proceedsOptions = DestinationOptions.Recipient;
    toString(): string;
}
declare const BurnRTokenAction_base: abstract new (address: Address, inputToken: import("../entities/Token").Token[], outputToken: import("../entities/Token").Token[], interactionConvention: InteractionConvention, proceedsOptions: DestinationOptions, approvals: Approval[]) => {
    readonly protocol: string;
    readonly gen: typeof import("../tx-gen/Planner");
    readonly genUtils: {
        planForwardERC20(universe: Universe<import("..").Config>, planner: Planner, token: import("../entities/Token").Token, amount: Value, destination: Address): void;
        erc20: {
            transfer(universe: Universe<import("..").Config>, planner: Planner, amount: Value, token: import("../entities/Token").Token, destination: Address): void;
            balanceOf(universe: Universe<import("..").Config>, planner: Planner, token: import("../entities/Token").Token, owner: Address, comment?: string | undefined, varName?: string | undefined): Value;
        };
    };
    readonly address: Address;
    readonly inputToken: import("../entities/Token").Token[];
    readonly outputToken: import("../entities/Token").Token[];
    readonly interactionConvention: InteractionConvention;
    readonly proceedsOptions: DestinationOptions;
    readonly approvals: Approval[];
    quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    quoteWithSlippage(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    gasEstimate(): bigint;
    exchange(amountsIn: TokenQuantity[], balances: TokenAmounts): Promise<void>;
    plan(planner: Planner, inputs: Value[], destination: Address, predictedInputs: TokenQuantity[], outputNotUsed?: boolean | undefined): Promise<Value[]>;
    toString(): string;
    readonly addToGraph: boolean;
    readonly outputSlippage: bigint;
};
export declare class BurnRTokenAction extends BurnRTokenAction_base {
    readonly universe: Universe;
    readonly basketHandler: IBasket;
    get outputSlippage(): bigint;
    plan(planner: Planner, inputs: Value[], destination: Address, predicted: TokenQuantity[]): Promise<Value[]>;
    gasEstimate(): bigint;
    quote([quantity]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, basketHandler: IBasket);
    toString(): string;
}
export {};
//# sourceMappingURL=RTokens.d.ts.map