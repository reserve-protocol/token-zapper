import { Universe } from '../Universe';
import { Cached } from '../base/Cached';
import { type Token, type TokenQuantity } from '../entities/Token';
export declare class PriceOracle extends Cached<Token, TokenQuantity> {
    readonly name: string;
    private readonly supportedTokens;
    constructor(ltvBlocks: number, name: string, fetchPrice: (token: Token) => Promise<TokenQuantity | null>, getCurrentBlock: () => number, supportedTokens?: Set<Token>);
    static createSingleTokenOracle(universe: Universe, token: Token, fetchPrice: () => Promise<TokenQuantity>): PriceOracle;
    supports(token: Token): boolean;
    quote(token: Token): Promise<TokenQuantity>;
}
