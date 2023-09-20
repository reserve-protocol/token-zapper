"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._getHiddenPools = exports._getAllGauges = exports._getFactoryAPYsAndVolumes = exports._getLegacyAPYsAndVolumes = exports._getSubgraphData = exports._getPoolsFromApi = void 0;
const memoizee_1 = __importDefault(require("memoizee"));
exports._getPoolsFromApi = (0, memoizee_1.default)(async (network, poolType) => {
    const url = `https://api.curve.fi/api/getPools/${network}/${poolType}`;
    const data = await (await fetch(url)).json();
    return data.data ?? { poolData: [], tvl: 0, tvlAll: 0 };
}, {
    promise: true,
    maxAge: 5 * 60 * 1000, // 5m
});
exports._getSubgraphData = (0, memoizee_1.default)(async (network) => {
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
exports._getLegacyAPYsAndVolumes = (0, memoizee_1.default)(async (network) => {
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
exports._getFactoryAPYsAndVolumes = (0, memoizee_1.default)(async (network) => {
    if (network === "aurora")
        return []; // Exclude Aurora
    const url = `https://api.curve.fi/api/getFactoryAPYs-${network}`;
    const data = await (await fetch(url)).json();
    return data.data.poolDetails ?? [];
}, {
    promise: true,
    maxAge: 5 * 60 * 1000, // 5m
});
exports._getAllGauges = (0, memoizee_1.default)(async () => {
    const url = `https://api.curve.fi/api/getAllGauges`;
    const data = await (await fetch(url)).json();
    return data.data;
}, {
    promise: true,
    maxAge: 5 * 60 * 1000, // 5m
});
exports._getHiddenPools = (0, memoizee_1.default)(async () => {
    const url = `https://api.curve.fi/api/getHiddenPools`;
    const data = await (await fetch(url)).json();
    return data.data;
}, {
    promise: true,
    maxAge: 5 * 60 * 1000, // 5m
});
//# sourceMappingURL=external-api.js.map