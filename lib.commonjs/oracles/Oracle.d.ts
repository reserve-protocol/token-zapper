import { DefaultMap } from '../base/DefaultMap';
import { type Token, type TokenQuantity } from '../entities/Token';
export declare class Oracle {
    readonly name: string;
    readonly fairTokenPriceImplementation: (token: Token) => Promise<TokenQuantity | null>;
    constructor(name: string, fairTokenPriceImplementation: (token: Token) => Promise<TokenQuantity | null>);
    currentPrices: DefaultMap<Token, Promise<{
        result: TokenQuantity | null;
        block: number;
    }>>;
    fairTokenPrice(block: number, token: Token): Promise<TokenQuantity | null>;
}
