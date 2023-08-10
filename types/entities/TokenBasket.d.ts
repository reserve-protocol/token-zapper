import { Address } from '../base/Address';
import { type Token, type TokenQuantity } from '../entities/Token';
import { type Universe } from '../Universe';
export declare const rTokenIFace: import("../contracts/contracts/IRToken").IRTokenInterface;
export interface IBasket {
    basketNonce: number;
    unitBasket: TokenQuantity[];
    basketTokens: Token[];
    rToken: Token;
}
export declare class TokenBasket implements IBasket {
    readonly universe: Universe<any>;
    readonly address: Address;
    readonly rToken: Token;
    private readonly basketHandler;
    issueRate: bigint;
    basketNonce: number;
    unitBasket: TokenQuantity[];
    basketsNeeded: bigint;
    totalSupply: bigint;
    get basketTokens(): Token[];
    constructor(universe: Universe<any>, address: Address, rToken: Token);
    update(): Promise<void>;
}
//# sourceMappingURL=TokenBasket.d.ts.map