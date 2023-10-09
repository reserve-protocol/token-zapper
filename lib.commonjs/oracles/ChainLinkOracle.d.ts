import { Address } from '../base/Address';
import { type Token, type TokenQuantity } from '../entities/Token';
import { type Universe } from '../Universe';
import { PriceOracle } from './PriceOracle';
export declare class ChainLinkOracle extends PriceOracle {
    readonly universe: Universe<any>;
    readonly chainlinkRegistry: Address;
    private tokenToChainLinkInternalAddress;
    private derived;
    mapTokenTo(token: Token, address: Address): void;
    addDerived(derived: Token, uoaToken: Token, derivedTokenUnit: Address): void;
    quote_(token: Token, quoteSymbol?: string): Promise<TokenQuantity | null>;
    quoteTok(token: Token): Promise<TokenQuantity | null>;
    constructor(universe: Universe<any>, chainlinkRegistry: Address);
}