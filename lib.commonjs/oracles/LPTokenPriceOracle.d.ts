import { type Token, type TokenQuantity } from '../entities/Token';
import { type Universe } from '../Universe';
import { PriceOracle } from './PriceOracle';
export declare class LPTokenPriceOracle extends PriceOracle {
    readonly universe: Universe<any>;
    quoteTok(token: Token): Promise<TokenQuantity | null>;
    constructor(universe: Universe<any>);
}
