import { DefaultMap } from '../base/DefaultMap';
import { Token, TokenQuantity } from './Token';
/**
 * A class representing a set of token quantities.
 *
 * @example
 * const tokenAmounts = new TokenAmounts()
 * tokenAmounts.add(usdc.from("12.34"))
 * tokenAmounts.sub(usdc.from("1.0"))
 * tokenAmounts.add(usdt.from("56.78"))
 * tokenAmounts.sub(usdt.from("1.0"))
 * console.log(tokenAmounts) // TokenAmounts([USDC: 11.34, USDT: 55.78])
 */
export declare class TokenAmounts {
    tokenBalances: DefaultMap<Token, TokenQuantity>;
    static fromQuantities(qtys: TokenQuantity[]): TokenAmounts;
    toTokenQuantities(): TokenQuantity[];
    get(tok: Token): TokenQuantity;
    add(qty: TokenQuantity): void;
    sub(qty: TokenQuantity): void;
    hasBalance(inputs: TokenQuantity[]): boolean;
    exchange(tokensRemovedFromBasket: TokenQuantity[], tokensAddedToBasket: TokenQuantity[]): void;
    multiplyFractions(inputs: TokenQuantity[], convertZeroToOne?: boolean): TokenAmounts;
    recalculateAsFractionOf(parent: TokenAmounts): TokenAmounts;
    addAll(input: TokenAmounts): void;
    addQtys(inputs: TokenQuantity[]): void;
    toString(): string;
    clone(): TokenAmounts;
}
//# sourceMappingURL=TokenAmounts.d.ts.map