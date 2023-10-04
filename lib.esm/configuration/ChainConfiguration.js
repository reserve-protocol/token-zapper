import { Address } from '../base/Address';
const convertAddressObject = (obj) => Object.fromEntries(Object.entries(obj).map(([symbol, addr]) => ([symbol, typeof addr === "string" ? Address.from(addr) : null])));
export const makeConfig = (chainId, nativeToken, commonTokens, rTokenDeployments, addresses) => {
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
//# sourceMappingURL=ChainConfiguration.js.map