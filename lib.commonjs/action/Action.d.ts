/// <reference types="node" />
import { type Address } from '../base/Address';
import { type Token, type TokenQuantity } from '../entities/Token';
import { TokenAmounts } from '../entities/TokenAmounts';
import { type Approval } from '../base/Approval';
import { type ContractCall } from '../base/ContractCall';
export declare enum InteractionConvention {
    PayBeforeCall = 0,
    CallbackBased = 1,
    ApprovalRequired = 2,
    None = 3
}
export declare enum DestinationOptions {
    Recipient = 0,
    Callee = 1
}
export declare abstract class Action {
    readonly address: Address;
    readonly input: readonly Token[];
    readonly output: readonly Token[];
    readonly interactionConvention: InteractionConvention;
    readonly proceedsOptions: DestinationOptions;
    readonly approvals: readonly Approval[];
    constructor(address: Address, input: readonly Token[], output: readonly Token[], interactionConvention: InteractionConvention, proceedsOptions: DestinationOptions, approvals: readonly Approval[]);
    abstract quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    quoteWithSlippage(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    abstract gasEstimate(): bigint;
    exchange(amountsIn: TokenQuantity[], balances: TokenAmounts): Promise<void>;
    abstract encode(amountsIn: TokenQuantity[], destination: Address, bytes?: Buffer): Promise<ContractCall>;
    toString(): string;
    get addToGraph(): boolean;
    get outputSlippage(): bigint;
}
