import { Provider } from '@ethersproject/providers';
import { Address } from '../base/Address';
import { IEACAggregatorProxy } from '../contracts';
import { type Token, type TokenQuantity } from '../entities/Token';
import { PriceOracle } from './PriceOracle';
export declare class OffchainOracleRegistry extends PriceOracle {
    readonly name: string;
    readonly provider: Provider;
    private registry;
    constructor(name: string, fetchPrice: (token: Token) => Promise<TokenQuantity | null>, getCurrentBlock: () => number, provider: Provider);
    register(address: Address, base: Address, oracle: Address): void;
    getOracle(address: Address, base: Address): IEACAggregatorProxy | null;
}
