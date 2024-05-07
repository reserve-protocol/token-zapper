import { Cached } from '../base/Cached';
import { type Token, type TokenQuantity } from '../entities/Token';
export declare class PriceOracle extends Cached<Token, TokenQuantity> {
    readonly name: string;
    constructor(ltvBlocks: number, name: string, fetchPrice: (token: Token) => Promise<TokenQuantity | null>, getCurrentBlock: () => number);
    quote(token: Token): Promise<TokenQuantity>;
}
//# sourceMappingURL=PriceOracle.d.ts.map