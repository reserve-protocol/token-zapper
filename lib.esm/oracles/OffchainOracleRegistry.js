import { DefaultMap } from '../base/DefaultMap';
import { IEACAggregatorProxy__factory } from '../contracts';
import { PriceOracle } from './PriceOracle';
export class OffchainOracleRegistry extends PriceOracle {
    name;
    provider;
    registry = new DefaultMap(() => new Map());
    constructor(name, fetchPrice, getCurrentBlock, provider) {
        super(name, fetchPrice, getCurrentBlock);
        this.name = name;
        this.provider = provider;
    }
    register(address, base, oracle) {
        this.registry.get(address).set(base, IEACAggregatorProxy__factory.connect(oracle.address, this.provider));
    }
    getOracle(address, base) {
        return this.registry.get(address).get(base) ?? null;
    }
}
//# sourceMappingURL=OffchainOracleRegistry.js.map