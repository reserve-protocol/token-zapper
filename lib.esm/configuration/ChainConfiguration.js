import { Address } from '../base/Address';
export * from './ZapSimulation';
const defaultSearcherOptions = {
    requoteTolerance: 1,
    routerDeadline: 5000,
    searcherMinRoutesToProduce: 4,
    searcherMaxRoutesToProduce: 8,
    searchConcurrency: 8,
    defaultInternalTradeSlippage: 50n,
    maxSearchTimeMs: 10000,
    // These parameters will reject zaps that have successfully simulated
    // but even if it produced a valid result, the result should be within some bounds
    zapMaxValueLoss: 4, // 0.04 or 3%
    // total output value = output token value + dust value
    zapMaxDustProduced: 2, // 0.02 or 2% of total output value
    largeZapThreshold: 300000,
    largeZapSearchTime: 5000,
};
export const convertAddressObject = (obj) => Object.fromEntries(Object.entries(obj).map(([symbol, addr]) => [
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
        ...Object.assign({}, defaultSearcherOptions, options),
    };
};
//# sourceMappingURL=ChainConfiguration.js.map