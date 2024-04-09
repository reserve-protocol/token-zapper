import { Address } from '../base/Address';
import { type TokenQuantity } from '../entities/Token';
import { TokenAmounts } from '../entities/TokenAmounts';
import { type Universe } from '../Universe';
import { Action, DestinationOptions, InteractionConvention } from './Action';
import { ContractCall } from '../base/ContractCall';
import { IBasket } from '../entities/TokenBasket';
import { Planner, Value } from '../tx-gen/Planner';
export declare class MintRTokenAction extends Action {
    readonly universe: Universe;
    readonly basket: IBasket;
    plan(planner: Planner, inputs: Value[], destination: Address): Promise<import("../tx-gen/Planner").ReturnValue[]>;
    gasEstimate(): bigint;
    get outputSlippage(): bigint;
    quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    exchange(input: TokenQuantity[], balances: TokenAmounts): Promise<void>;
    encode(amountsIn: TokenQuantity[], destination: Address): Promise<ContractCall>;
    encodeIssueTo(amountsIn: TokenQuantity[], units: TokenQuantity, destination: Address): Promise<ContractCall>;
    constructor(universe: Universe, basket: IBasket);
    readonly interactionConvention = InteractionConvention.ApprovalRequired;
    readonly proceedsOptions = DestinationOptions.Recipient;
    toString(): string;
}
export declare class BurnRTokenAction extends Action {
    readonly universe: Universe;
    readonly basketHandler: IBasket;
    get outputSlippage(): bigint;
    plan(planner: Planner, inputs: Value[], destination: Address): Promise<Value[]>;
    gasEstimate(): bigint;
    encode([quantity]: TokenQuantity[], destination: Address): Promise<ContractCall>;
    quote([quantity]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, basketHandler: IBasket);
    toString(): string;
}
