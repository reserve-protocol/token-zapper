import { Address } from '../base/Address';
import { type TokenQuantity } from '../entities/Token';
import { TokenAmounts } from '../entities/TokenAmounts';
import { type Universe } from '../Universe';
import { Action, DestinationOptions, InteractionConvention } from './Action';
import { ContractCall } from '../base/ContractCall';
import { IBasket } from '../entities/TokenBasket';
export declare class MintRTokenAction extends Action {
    readonly universe: Universe;
    readonly basket: IBasket;
    gasEstimate(): bigint;
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
    gasEstimate(): bigint;
    encode([quantity]: TokenQuantity[]): Promise<ContractCall>;
    quote([quantity]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, basketHandler: IBasket);
    toString(): string;
}
//# sourceMappingURL=RTokens.d.ts.map