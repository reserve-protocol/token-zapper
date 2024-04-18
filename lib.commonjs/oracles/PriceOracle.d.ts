import { Cached } from '../base/Cached';
import { type Token, type TokenQuantity } from '../entities/Token';
export declare class PriceOracle extends Cached<Token, TokenQuantity> {
    readonly name: string;
    constructor(name: string, fetchPrice: (token: Token) => Promise<TokenQuantity | null>, getCurrentBlock: () => number);
    quote(token: Token): Promise<TokenQuantity>;
}
