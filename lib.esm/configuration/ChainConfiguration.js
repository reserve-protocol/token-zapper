import { Address } from '../base/Address';
const defaultSearcherOptions = {
    requoteTolerance: 2,
    routerDeadline: 4500,
    searcherMinRoutesToProduce: 1,
    searcherMaxRoutesToProduce: 8,
    searchConcurrency: 4,
    defaultInternalTradeSlippage: 250n,
    maxSearchTimeMs: 10000,
};
const convertAddressObject = (obj) => Object.fromEntries(Object.entries(obj).map(([symbol, addr]) => [
    symbol,
    typeof addr === 'string' ? Address.from(addr) : null,
]));
export const makeConfig = (chainId, nativeToken, commonTokens, rTokens, addresses, options) => {
    return {
        chainId,
        nativeToken,
        addresses: {
            ...convertAddressObject(addresses),
            commonTokens: convertAddressObject(commonTokens),
            rTokens: convertAddressObject(Object.fromEntries(Object.entries(rTokens).map((i) => [i[0], i[1]]))),
        },
        ...Object.assign({}, defaultSearcherOptions, options)
    };
};
//# sourceMappingURL=ChainConfiguration.js.map