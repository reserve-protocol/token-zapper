import { Config } from '../configuration/ChainConfiguration';
import { type Token, type TokenQuantity } from '../entities/Token';
import { type Universe } from '../Universe';
import { PriceOracle } from './PriceOracle';
export declare class LPTokenPriceOracle extends PriceOracle {
    readonly universe: Universe<Config>;
    supports(token: Token): boolean;
    toString(): string;
    quoteTok(token: Token): Promise<TokenQuantity | null>;
    constructor(universe: Universe<Config>);
}
//# sourceMappingURL=LPTokenPriceOracle.d.ts.map