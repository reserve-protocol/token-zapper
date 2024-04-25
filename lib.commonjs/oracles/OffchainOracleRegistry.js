"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OffchainOracleRegistry = void 0;
const DefaultMap_1 = require("../base/DefaultMap");
const contracts_1 = require("../contracts");
const PriceOracle_1 = require("./PriceOracle");
class OffchainOracleRegistry extends PriceOracle_1.PriceOracle {
    name;
    provider;
    registry = new DefaultMap_1.DefaultMap(() => new Map());
    constructor(name, fetchPrice, getCurrentBlock, provider) {
        super(name, fetchPrice, getCurrentBlock);
        this.name = name;
        this.provider = provider;
    }
    register(address, base, oracle) {
        this.registry.get(address).set(base, contracts_1.IEACAggregatorProxy__factory.connect(oracle.address, this.provider));
    }
    getOracle(address, base) {
        return this.registry.get(address).get(base) ?? null;
    }
}
exports.OffchainOracleRegistry = OffchainOracleRegistry;
//# sourceMappingURL=OffchainOracleRegistry.js.map