/// <reference types="node" />
import { type Address } from '../base/Address';
import { type ContractCall } from '../base/ContractCall';
import { type Token, type TokenQuantity } from '../entities/Token';
import { Action } from './Action';
export declare class LPToken {
    readonly token: Token;
    readonly poolTokens: Token[];
    readonly burn: (amount: TokenQuantity) => Promise<TokenQuantity[]>;
    readonly mint: (amountsIn: TokenQuantity[]) => Promise<TokenQuantity>;
    readonly mintAction: Action;
    readonly burnAction: Action;
    constructor(token: Token, poolTokens: Token[], burn: (amount: TokenQuantity) => Promise<TokenQuantity[]>, mint: (amountsIn: TokenQuantity[]) => Promise<TokenQuantity>);
    toString(): string;
}
export declare class LPTokenMint extends Action {
    readonly lpToken: LPToken;
    toString(): string;
    quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    gasEstimate(): bigint;
    encode(amountsIn: TokenQuantity[], destination: Address, bytes?: Buffer | undefined): Promise<ContractCall>;
    constructor(lpToken: LPToken);
}
export declare class LPTokenBurn extends Action {
    readonly lpToken: LPToken;
    toString(): string;
    quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    gasEstimate(): bigint;
    encode(amountsIn: TokenQuantity[], destination: Address, bytes?: Buffer | undefined): Promise<ContractCall>;
    constructor(lpToken: LPToken);
}
//# sourceMappingURL=LPToken.d.ts.map