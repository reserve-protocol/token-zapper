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
    private latestPrices;
    constructor(universe: Universe);
    dumpPrices(): {
        readonly token: Token;
        readonly price: TokenQuantity;
    }[];
    private quoteFn;
    private tokenPrice;
    quote(qty: TokenQuantity): Promise<TokenQuantity>;
    quoteIn(tokenQty: TokenQuantity, quoteToken: Token): Promise<TokenQuantity>;
}
//# sourceMappingURL=ZapperAggregatorOracle.d.ts.map