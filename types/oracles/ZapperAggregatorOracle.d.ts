import { type Token, type TokenQuantity } from '../entities/Token';
import { type Universe } from '../Universe';
import { Cached } from '../base/Cached';
import { PriceOracle } from './PriceOracle';
export declare class ZapperOracleAggregator extends PriceOracle {
    readonly universe: Universe;
    constructor(universe: Universe);
    private priceAsset;
}
export declare class ZapperTokenQuantityPrice extends Cached<TokenQuantity, TokenQuantity> {
    readonly universe: Universe;
    private aggregatorOracle;
    constructor(universe: Universe);
    private quoteFn;
    private tokenPrice;
    quoteToken(token: Token): Promise<TokenQuantity>;
    quote(qty: TokenQuantity): Promise<TokenQuantity>;
    quoteIn(qty: TokenQuantity, tokenToQuoteWith: Token): Promise<TokenQuantity>;
}
//# sourceMappingURL=ZapperAggregatorOracle.d.ts.map