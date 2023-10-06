"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._getAmplificationCoefficientsFromApi = exports.getUserLiquidityUSD = exports.getUserPoolListByLiquidity = void 0;
const poolConstructor_1 = require("./poolConstructor");
const curve_1 = require("../curve");
const utils_1 = require("../utils");
const external_api_1 = require("../external-api");
const constants_1 = require("@ethersproject/constants");
// _userLpBalance: { address: { poolId: { _lpBalance: 0, time: 0 } } }
const _userLpBalanceCache = {};
const _isUserLpBalanceCacheExpired = (address, poolId) => (_userLpBalanceCache[address]?.[poolId]?.time || 0) + 600000 < Date.now();
const _getUserLpBalances = async (pools, address, useCache) => {
    const poolsToFetch = useCache ? pools.filter((poolId) => _isUserLpBalanceCacheExpired(address, poolId)) : pools;
    if (poolsToFetch.length > 0) {
        const calls = [];
        for (const poolId of poolsToFetch) {
            const pool = (0, poolConstructor_1.getPool)(poolId);
            calls.push(curve_1.curve.contracts[pool.lpToken].multicallContract.balanceOf(address));
            if (pool.gauge !== constants_1.AddressZero)
                calls.push(curve_1.curve.contracts[pool.gauge].multicallContract.balanceOf(address));
        }
        const _rawBalances = await curve_1.curve.multicallProvider.all(calls);
        for (const poolId of poolsToFetch) {
            const pool = (0, poolConstructor_1.getPool)(poolId);
            let _balance = _rawBalances.shift();
            if (pool.gauge !== constants_1.AddressZero)
                _balance = _balance.add(_rawBalances.shift());
            if (!_userLpBalanceCache[address])
                _userLpBalanceCache[address] = {};
            _userLpBalanceCache[address][poolId] = { '_lpBalance': _balance, 'time': Date.now() };
        }
    }
    const _lpBalances = [];
    for (const poolId of pools) {
        _lpBalances.push(_userLpBalanceCache[address]?.[poolId]._lpBalance);
    }
    return _lpBalances;
};
const getUserPoolListByLiquidity = async (address = curve_1.curve.signerAddress) => {
    const pools = [...curve_1.curve.getFactoryPoolList(), ...curve_1.curve.getCryptoFactoryPoolList()];
    const _lpBalances = await _getUserLpBalances(pools, address, false);
    const userPoolList = [];
    for (let i = 0; i < pools.length; i++) {
        if (_lpBalances[i].gt(0)) {
            userPoolList.push(pools[i]);
        }
    }
    return userPoolList;
};
exports.getUserPoolListByLiquidity = getUserPoolListByLiquidity;
const getUserLiquidityUSD = async (pools, address = curve_1.curve.signerAddress) => {
    const _lpBalances = await _getUserLpBalances(pools, address, true);
    const userLiquidityUSD = [];
    for (let i = 0; i < pools.length; i++) {
        const pool = (0, poolConstructor_1.getPool)(pools[i]);
        const price = await (0, utils_1._getUsdRate)(pool.lpToken);
        userLiquidityUSD.push((0, utils_1.toBN)(_lpBalances[i]).times(price).toFixed(8));
    }
    return userLiquidityUSD;
};
exports.getUserLiquidityUSD = getUserLiquidityUSD;
const _getAmplificationCoefficientsFromApi = async () => {
    const network = curve_1.curve.constants.NETWORK_NAME;
    const promises = [
        (0, external_api_1._getPoolsFromApi)(network, "main"),
        (0, external_api_1._getPoolsFromApi)(network, "crypto"),
        (0, external_api_1._getPoolsFromApi)(network, "factory"),
        (0, external_api_1._getPoolsFromApi)(network, "factory-crypto"),
    ];
    const allTypesExtendedPoolData = await Promise.all(promises);
    const amplificationCoefficientDict = {};
    for (const extendedPoolData of allTypesExtendedPoolData) {
        for (const pool of extendedPoolData.poolData) {
            amplificationCoefficientDict[pool.address] = Number(pool.amplificationCoefficient);
        }
    }
    return amplificationCoefficientDict;
};
exports._getAmplificationCoefficientsFromApi = _getAmplificationCoefficientsFromApi;
//# sourceMappingURL=utils.js.map