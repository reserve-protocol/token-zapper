import { Address } from '../base/Address';
import { type Token, type TokenQuantity } from '../entities/Token';
import { type Universe } from '../Universe';
export interface IBasket {
    basketNonce: number;
    unitBasket: TokenQuantity[];
    basketTokens: Token[];
    rToken: Token;
    version: string;
    redeem(amount: TokenQuantity): Promise<TokenQuantity[]>;
}
export declare class TokenBasket implements IBasket {
    readonly universe: Universe;
    readonly basketHandlerAddress: Address;
    readonly rToken: Token;
    readonly assetRegistry: Address;
    readonly version: string;
    private readonly basketHandler;
    private readonly lens;
    issueRate: bigint;
    basketNonce: number;
    unitBasket: TokenQuantity[];
    basketsNeeded: bigint;
    totalSupply: bigint;
    get basketTokens(): Token[];
    constructor(universe: Universe, basketHandlerAddress: Address, rToken: Token, assetRegistry: Address, version: string);
    update(): Promise<void>;
    redeem(quantity: TokenQuantity): Promise<TokenQuantity[]>;
}
//# sourceMappingURL=TokenBasket.d.ts.map