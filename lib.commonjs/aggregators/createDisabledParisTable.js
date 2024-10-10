"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDisabledParisTable = void 0;
const Address_1 = require("../base/Address");
const DefaultMap_1 = require("../base/DefaultMap");
const createDisabledParisTable = () => {
    const disabled = new DefaultMap_1.DefaultMap((_) => new DefaultMap_1.DefaultMap((_) => new Set()));
    const defineDisablePair = (chainId, token0, token1) => {
        disabled.get(chainId).get(Address_1.Address.from(token0)).add(Address_1.Address.from(token1));
        disabled.get(chainId).get(Address_1.Address.from(token1)).add(Address_1.Address.from(token0));
    };
    const isDisabled = (chainId, inp, out) => {
        return disabled.get(chainId).get(inp.token.address).has(out.address);
    };
    return {
        define: defineDisablePair,
        isDisabled,
    };
};
exports.createDisabledParisTable = createDisabledParisTable;
//# sourceMappingURL=createDisabledParisTable.js.map