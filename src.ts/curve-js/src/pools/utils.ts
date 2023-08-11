import { getPool } from "./poolConstructor";
import { IDict } from "../interfaces";
import { curve } from "../curve";
import { _getRewardsFromApi, _getUsdRate, _setContracts, toBN } from "../utils";
import { _getPoolsFromApi } from "../external-api";

import { BigNumber } from "@ethersproject/bignumber";
import { AddressZero } from "@ethersproject/constants";

// _userLpBalance: { address: { poolId: { _lpBalance: 0, time: 0 } } }
const _userLpBalanceCache: IDict<IDict<{ _lpBalance: BigNumber, time: number }>> = {};
const _isUserLpBalanceCacheExpired = (address: string, poolId: string) => (_userLpBalanceCache[address]?.[poolId]?.time || 0) + 600000 < Date.now();

const _getUserLpBalances = async (pools: string[], address: string, useCache: boolean): Promise<BigNumber[]> => {
    const poolsToFetch: string[] = useCache ? pools.filter((poolId) => _isUserLpBalanceCacheExpired(address as string, poolId)) : pools;
    if (poolsToFetch.length > 0) {
        const calls = [];
        for (const poolId of poolsToFetch) {
            const pool = getPool(poolId);
            calls.push(curve.contracts[pool.lpToken].multicallContract.balanceOf(address));
            if (pool.gauge !== AddressZero) calls.push(curve.contracts[pool.gauge].multicallContract.balanceOf(address));
        }
        const _rawBalances: BigNumber[] = await curve.multicallProvider.all(calls);
        for (const poolId of poolsToFetch) {
            const pool = getPool(poolId);
            let _balance = _rawBalances.shift() as BigNumber;
            if (pool.gauge !== AddressZero) _balance = _balance.add(_rawBalances.shift() as BigNumber);

            if (!_userLpBalanceCache[address]) _userLpBalanceCache[address] = {};
            _userLpBalanceCache[address][poolId] = { '_lpBalance': _balance, 'time': Date.now() }
        }
    }

    const _lpBalances: BigNumber[] = []
    for (const poolId of pools) {
        _lpBalances.push(_userLpBalanceCache[address]?.[poolId]._lpBalance as BigNumber)
    }

    return _lpBalances
}

export const getUserPoolListByLiquidity = async (address = curve.signerAddress): Promise<string[]> => {
    const pools = [...curve.getFactoryPoolList(), ...curve.getCryptoFactoryPoolList()];
    const _lpBalances = await _getUserLpBalances(pools, address, false);

    const userPoolList: string[] = []
    for (let i = 0; i < pools.length; i++) {
        if (_lpBalances[i].gt(0)) {
            userPoolList.push(pools[i]);
        }
    }

    return userPoolList
}

export const getUserLiquidityUSD = async (pools: string[], address = curve.signerAddress): Promise<string[]> => {
    const _lpBalances = await _getUserLpBalances(pools, address, true);

    const userLiquidityUSD: string[] = []
    for (let i = 0; i < pools.length; i++) {
        const pool = getPool(pools[i]);
        const price = await _getUsdRate(pool.lpToken);
        userLiquidityUSD.push(toBN(_lpBalances[i]).times(price).toFixed(8));
    }

    return userLiquidityUSD
}

export const _getAmplificationCoefficientsFromApi = async (): Promise<IDict<number>> => {
    const network = curve.constants.NETWORK_NAME;
    const promises = [
        _getPoolsFromApi(network, "main"),
        _getPoolsFromApi(network, "crypto"),
        _getPoolsFromApi(network, "factory"),
        _getPoolsFromApi(network, "factory-crypto"),
    ];
    const allTypesExtendedPoolData = await Promise.all(promises);
    const amplificationCoefficientDict: IDict<number> = {};

    for (const extendedPoolData of allTypesExtendedPoolData) {
        for (const pool of extendedPoolData.poolData) {
            amplificationCoefficientDict[pool.address] = Number(pool.amplificationCoefficient);
        }
    }

    return amplificationCoefficientDict
}
