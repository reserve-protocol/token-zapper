"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertWrapperTokenAddressesIntoWrapperTokenPairs = void 0;
const Address_1 = require("../base/Address");
const convertWrapperTokenAddressesIntoWrapperTokenPairs = async (universe, markets, underlyingTokens) => {
    return await Promise.all(markets
        .map(Address_1.Address.from)
        .map(async (address) => {
        const [underlying, wrappedToken] = await Promise.all([
            universe.getToken(Address_1.Address.from(underlyingTokens[address.address])),
            universe.getToken(address),
        ]);
        return { underlying, wrappedToken };
    }));
};
exports.convertWrapperTokenAddressesIntoWrapperTokenPairs = convertWrapperTokenAddressesIntoWrapperTokenPairs;
//# sourceMappingURL=convertWrapperTokenAddressesIntoWrapperTokenPairs.js.map