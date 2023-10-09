import { Provider } from '@ethersproject/providers';
import { Address } from '../base/Address';
import { DefaultMap } from '../base/DefaultMap';
import { IEACAggregatorProxy, IEACAggregatorProxy__factory } from '../contracts';
import { type Token, type TokenQuantity } from '../entities/Token';
import { PriceOracle } from './PriceOracle';

export class OffchainOracleRegistry extends PriceOracle {
  private registry: DefaultMap<Address, Map<Address, IEACAggregatorProxy>> = new DefaultMap(() => new Map());
  constructor(
    public readonly name: string,
    fetchPrice: (
      token: Token
    ) => Promise<TokenQuantity | null>,
    getCurrentBlock: () => number,
    public readonly provider: Provider
  ) {
    super(name, fetchPrice, getCurrentBlock);
  }

  register(address: Address, base: Address, oracle: Address) {
    this.registry.get(address).set(base, IEACAggregatorProxy__factory.connect(oracle.address, this.provider));
  }
  getOracle(address: Address, base: Address): IEACAggregatorProxy | null {
    return this.registry.get(address).get(base) ?? null;
  }
}
