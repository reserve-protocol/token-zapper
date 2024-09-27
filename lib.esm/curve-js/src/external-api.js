import memoize from "memoizee";
export const _getPoolsFromApi = memoize(async (network, poolType) => {
    const url = `https://api.curve.fi/api/getPools/${network}/${poolType}`;
    const data = await (await fetch(url)).json();
    return data.data ?? { poolData: [], tvl: 0, tvlAll: 0 };
}, {
    promise: true,
    maxAge: 5 * 60 * 1000, // 5m
});
export const _getSubgraphData = memoize(async (network) => {
    const url = `https://api.curve.fi/api/getSubgraphData/${network}`;
    const data = await (await fetch(url)).json();
    return {
        poolsData: data.data.poolList ?? [],
        totalVolume: data.data.totalVolume ?? 0,
        cryptoVolume: data.data.cryptoVolume ?? 0,
        cryptoShare: data.data.cryptoShare ?? 0,
    };
}, {
    promise: true,
    maxAge: 5 * 60 * 1000, // 5m
});
// Moonbeam and Aurora only
export const _getLegacyAPYsAndVolumes = memoize(async (network) => {
    if (network === "kava" || network === "celo")
        return {}; // Exclude Kava and Celo
    const url = "https://api.curve.fi/api/getMainPoolsAPYs/" + network;
    const data = await (await fetch(url)).json();
    const result = {};
    Object.keys(data.apy.day).forEach((poolId) => {
        result[poolId] = { apy: { day: 0, week: 0 }, volume: 0 };
        result[poolId].apy.day = data.apy.day[poolId] * 100;
        result[poolId].apy.week = data.apy.week[poolId] * 100;
        result[poolId].volume = data.volume[poolId];
    });
    return result;
}, {
    promise: true,
    maxAge: 5 * 60 * 1000, // 5m
});
// Moonbeam, Kava and Celo only
export const _getFactoryAPYsAndVolumes = memoize(async (network) => {
    if (network === "aurora")
        return []; // Exclude Aurora
    const url = `https://api.curve.fi/api/getFactoryAPYs-${network}`;
    const data = await (await fetch(url)).json();
    return data.data.poolDetails ?? [];
}, {
    promise: true,
    maxAge: 5 * 60 * 1000, // 5m
});
export const _getAllGauges = memoize(async () => {
    const url = `https://api.curve.fi/api/getAllGauges`;
    const data = await (await fetch(url)).json();
    return data.data;
}, {
    promise: true,
    maxAge: 5 * 60 * 1000, // 5m
});
export const _getHiddenPools = memoize(async () => {
    const url = `https://api.curve.fi/api/getHiddenPools`;
    const data = await (await fetch(url)).json();
    return data.data;
}, {
    promise: true,
    maxAge: 5 * 60 * 1000, // 5m
});
//# sourceMappingURL=external-api.js.map