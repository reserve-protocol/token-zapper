import { Universe } from '../Universe';
import { Address } from '../base/Address';
import { Cached } from '../base/Cached';
import { type Token, type TokenQuantity } from '../entities/Token';
export declare class PriceOracle extends Cached<Token, TokenQuantity | null> {
    readonly name: string;
    private readonly supportedTokens;
    constructor(ltvBlocks: number, name: string, fetchPrice: (token: Token) => Promise<TokenQuantity | null>, getCurrentBlock: () => number, supportedTokens?: Set<Token>);
    toString(): string;
    static createSingleTokenOracle(universe: Universe, token: Token, fetchPrice: () => Promise<TokenQuantity>): PriceOracle;
    static createSingleTokenOracleChainLinkLike(universe: Universe, token: Token, oracleAddress: Address, priceToken: Token): Promise<PriceOracle>;
    supports(token: Token): boolean;
    quote(token: Token): Promise<TokenQuantity | null>;
}
