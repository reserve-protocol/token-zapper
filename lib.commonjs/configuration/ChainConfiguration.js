"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeConfig = void 0;
const Address_1 = require("../base/Address");
const convertAddressObject = (obj) => Object.fromEntries(Object.entries(obj).map(([symbol, addr]) => ([symbol, typeof addr === "string" ? Address_1.Address.from(addr) : null])));
const makeConfig = (chainId, nativeToken, commonTokens, rTokenDeployments, addresses) => {
    return {
        chainId,
        nativeToken,
        addresses: {
            ...convertAddressObject(addresses),
            commonTokens: convertAddressObject(commonTokens),
            rTokenDeployments: convertAddressObject(Object.fromEntries(Object.entries(rTokenDeployments).map(i => [i[0], i[1].main]))),
            rTokens: convertAddressObject(Object.fromEntries(Object.entries(rTokenDeployments).map(i => [i[0], i[1].erc20])))
        }
    };
};
exports.makeConfig = makeConfig;
//# sourceMappingURL=ChainConfiguration.js.map