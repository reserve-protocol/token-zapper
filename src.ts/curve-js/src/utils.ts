import { Contract as MulticallContract } from "../../ethcall/src";
import BigNumber from 'bignumber.js';
import { IChainId, IDict, INetworkName, IRewardFromApi } from './interfaces';
import { curve, NETWORK_CONSTANTS } from "./curve";
import { _getFactoryAPYsAndVolumes, _getLegacyAPYsAndVolumes, _getPoolsFromApi, _getSubgraphData } from "./external-api";
import ERC20Abi from './constants/abis/ERC20.json';

import {MaxUint256} from "@ethersproject/constants"
import { BigNumber as ethersBigNumber } from "@ethersproject/bignumber";
import { parseUnits as ethersParseUnits, formatUnits as ethersFormatUnits } from "@ethersproject/units";
import {Contract} from "@ethersproject/contracts"
export const ETH_ADDRESS = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
export const MAX_ALLOWANCE = MaxUint256;

// Formatting numbers

export const _cutZeros = (strn: string): string => {
    return strn.replace(/0+$/gi, '').replace(/\.$/gi, '');
}

export const checkNumber = (n: number | string): number | string => {
    if (Number(n) !== Number(n)) throw Error(`${n} is not a number`); // NaN

    return n
}

export const formatNumber = (n: number | string, decimals = 18): string => {
    if (Number(n) !== Number(n)) throw Error(`${n} is not a number`); // NaN
    const [integer, fractional] = String(n).split(".");

    return !fractional ? integer : integer + "." + fractional.slice(0, decimals);
}

export const parseUnits = (n: number | string, decimals = 18): ethersBigNumber => {
    return ethersParseUnits(formatNumber(n, decimals), decimals);
}

// bignumber.js

export const BN = (val: number | string): BigNumber => new BigNumber(checkNumber(val));

export const toBN = (n: ethersBigNumber, decimals = 18): BigNumber => {
    return BN(ethersFormatUnits(n, decimals));
}


export const toBN2 = (n: bigint, decimals = 18): BigNumber => {
    return BN(ethersFormatUnits(n, decimals));
}

export const toStringFromBN = (bn: BigNumber, decimals = 18): string => {
    return bn.toFixed(decimals);
}

export const fromBN = (bn: BigNumber, decimals = 18): ethersBigNumber => {
    return ethersParseUnits(toStringFromBN(bn, decimals), decimals)
}
export const fromBN2 = (bn: BigNumber, decimals = 18): bigint => {
    return ethersParseUnits(toStringFromBN(bn, decimals), decimals).toBigInt()
}

// -------------------


export const isEth = (address: string): boolean => address.toLowerCase() === ETH_ADDRESS.toLowerCase();
export const getEthIndex = (addresses: string[]): number => addresses.map((address: string) => address.toLowerCase()).indexOf(ETH_ADDRESS.toLowerCase());

// coins can be either addresses or symbols
export const _getCoinAddressesNoCheck = (...coins: string[] | string[][]): string[] => {
    if (coins.length == 1 && Array.isArray(coins[0])) coins = coins[0];
    coins = coins as string[];
    return coins.map((c) => c.toLowerCase()).map((c) => curve.constants.COINS[c] || c);
}

export const _getCoinAddresses = (...coins: string[] | string[][]): string[] => {
    const coinAddresses = _getCoinAddressesNoCheck(...coins);
    const availableAddresses = [...Object.keys(curve.constants.DECIMALS), ...curve.constants.GAUGES];
    for (const coinAddr of coinAddresses) {
        if (!availableAddresses.includes(coinAddr)) throw Error(`Coin with address '${coinAddr}' is not available`);
    }

    return coinAddresses
}

export const _getCoinDecimals = (...coinAddresses: string[] | string[][]): number[] => {
    if (coinAddresses.length == 1 && Array.isArray(coinAddresses[0])) coinAddresses = coinAddresses[0];
    coinAddresses = coinAddresses as string[];

    return coinAddresses.map((coinAddr) => curve.constants.DECIMALS[coinAddr.toLowerCase()] ?? 18); // 18 for gauges
}

export const _getBalances = async (coins: string[], addresses: string[]): Promise<IDict<string[]>> => {
    const coinAddresses = _getCoinAddresses(coins);
    const decimals = _getCoinDecimals(coinAddresses);

    const ethIndex = getEthIndex(coinAddresses);
    if (ethIndex !== -1) {
        coinAddresses.splice(ethIndex, 1);
    }

    const contractCalls = [];
    for (const coinAddr of coinAddresses) {
        contractCalls.push(...addresses.map((address: string) => curve.contracts[coinAddr].multicallContract.balanceOf(address)));
    }
    const _response: ethersBigNumber[] = await curve.multicallProvider.all(contractCalls);

    if (ethIndex !== -1) {
        const ethBalances: ethersBigNumber[] = [];
        for (const address of addresses) {
            ethBalances.push(await curve.provider.getBalance(address));
        }
        _response.splice(ethIndex * addresses.length, 0, ...ethBalances);
    }

    const _balances: IDict<ethersBigNumber[]>  = {};
    addresses.forEach((address: string, i: number) => {
        _balances[address] = coins.map((_, j: number ) => _response[i + (j * addresses.length)]);
    });

    const balances: IDict<string[]>  = {};
    for (const address of addresses) {
        balances[address] = _balances[address].map((b, i: number ) => ethersFormatUnits(b, decimals[i]));
    }

    return balances;
}

export const _prepareAddresses = (addresses: string[] | string[][]): string[] => {
    if (addresses.length == 1 && Array.isArray(addresses[0])) addresses = addresses[0];
    if (addresses.length === 0 && curve.signerAddress !== '') addresses = [curve.signerAddress];
    addresses = addresses as string[];

    return addresses.filter((val, idx, arr) => arr.indexOf(val) === idx)
}

export const getBalances = async (coins: string[], ...addresses: string[] | string[][]): Promise<IDict<string[]> | string[]> => {
    addresses = _prepareAddresses(addresses);
    const balances: IDict<string[]> = await _getBalances(coins, addresses);

    return addresses.length === 1 ? balances[addresses[0]] : balances
}


export const _getAllowance = async (coins: string[], address: string, spender: string): Promise<ethersBigNumber[]> => {
    const _coins = [...coins]
    const ethIndex = getEthIndex(_coins);
    if (ethIndex !== -1) {
        _coins.splice(ethIndex, 1);

    }

    let allowance: ethersBigNumber[];
    if (_coins.length === 1) {
        allowance = [await curve.contracts[_coins[0]].contract.allowance(address, spender, curve.constantOptions)];
    } else {
        const contractCalls = _coins.map((coinAddr) => curve.contracts[coinAddr].multicallContract.allowance(address, spender));
        allowance = await curve.multicallProvider.all(contractCalls);
    }


    if (ethIndex !== -1) {
        allowance.splice(ethIndex, 0, MAX_ALLOWANCE);
    }

    return allowance;
}

// coins can be either addresses or symbols
export const getAllowance = async (coins: string[], address: string, spender: string): Promise<string[]> => {
    const coinAddresses = _getCoinAddresses(coins);
    const decimals = _getCoinDecimals(coinAddresses);
    const _allowance = await _getAllowance(coinAddresses, address, spender);

    return _allowance.map((a, i) => ethersFormatUnits(a, decimals[i]))
}

// coins can be either addresses or symbols
export const hasAllowance = async (coins: string[], amounts: (number | string)[], address: string, spender: string): Promise<boolean> => {
    const coinAddresses = _getCoinAddresses(coins);
    const decimals = _getCoinDecimals(coinAddresses);
    const _allowance = await _getAllowance(coinAddresses, address, spender);
    const _amounts = amounts.map((a, i) => parseUnits(a, decimals[i]));

    return _allowance.map((a, i) => a.gte(_amounts[i])).reduce((a, b) => a && b);
}

export const getPoolNameBySwapAddress = (swapAddress: string): string => {
    const poolsData = { ...curve.constants.POOLS_DATA, ...curve.constants.FACTORY_POOLS_DATA, ...curve.constants.CRYPTO_FACTORY_POOLS_DATA };
    return Object.entries(poolsData).filter(([_, poolData]) => poolData.swap_address.toLowerCase() === swapAddress.toLowerCase())[0][0];
}

const _getTokenAddressBySwapAddress = (swapAddress: string): string => {
    const poolsData = { ...curve.constants.POOLS_DATA, ...curve.constants.FACTORY_POOLS_DATA, ...curve.constants.CRYPTO_FACTORY_POOLS_DATA };
    const res = Object.entries(poolsData).filter(([_, poolData]) => poolData.swap_address.toLowerCase() === swapAddress.toLowerCase());
    if (res.length === 0) return "";
    return res[0][1].token_address;
}

export const _getUsdPricesFromApi = async (): Promise<IDict<number>> => {
    const network = curve.constants.NETWORK_NAME;
    const promises = [
        _getPoolsFromApi(network, "main"),
        _getPoolsFromApi(network, "crypto"),
        _getPoolsFromApi(network, "factory"),
        _getPoolsFromApi(network, "factory-crypto"),
    ];
    const allTypesExtendedPoolData = await Promise.all(promises);
    const priceDict: IDict<number> = {};

    for (const extendedPoolData of allTypesExtendedPoolData) {
        for (const pool of extendedPoolData.poolData) {
            const lpTokenAddress = pool.lpTokenAddress ?? pool.address;
            const totalSupply = pool.totalSupply / (10 ** 18);
            priceDict[lpTokenAddress.toLowerCase()] = pool.usdTotal && totalSupply ? pool.usdTotal / totalSupply : 0;

            for (const coin of pool.coins) {
                if (typeof coin.usdPrice === "number") priceDict[coin.address.toLowerCase()] = coin.usdPrice;
            }

            for (const coin of pool.gaugeRewards ?? []) {
                if (typeof coin.tokenPrice === "number") priceDict[coin.tokenAddress.toLowerCase()] = coin.tokenPrice;
            }
        }
    }

    return priceDict
}

export const _getCrvApyFromApi = async (): Promise<IDict<[number, number]>> => {
    const network = curve.constants.NETWORK_NAME;
    const promises = [
        _getPoolsFromApi(network, "main"),
        _getPoolsFromApi(network, "crypto"),
        _getPoolsFromApi(network, "factory"),
        _getPoolsFromApi(network, "factory-crypto"),
    ];
    const allTypesExtendedPoolData = await Promise.all(promises);
    const apyDict: IDict<[number, number]> = {};

    for (const extendedPoolData of allTypesExtendedPoolData) {
        for (const pool of extendedPoolData.poolData) {
            if (pool.gaugeAddress) {
                if (!pool.gaugeCrvApy) {
                    apyDict[pool.gaugeAddress.toLowerCase()] = [0, 0];
                } else {
                    apyDict[pool.gaugeAddress.toLowerCase()] = [pool.gaugeCrvApy[0] ?? 0, pool.gaugeCrvApy[1] ?? 0];
                }
            }
        }
    }

    return apyDict
}

export const _getRewardsFromApi = async (): Promise<IDict<IRewardFromApi[]>> => {
    const network = curve.constants.NETWORK_NAME;
    const promises = [
        _getPoolsFromApi(network, "main"),
        _getPoolsFromApi(network, "crypto"),
        _getPoolsFromApi(network, "factory"),
        _getPoolsFromApi(network, "factory-crypto"),
    ];
    const allTypesExtendedPoolData = await Promise.all(promises);
    const rewardsDict: IDict<IRewardFromApi[]> = {};

    for (const extendedPoolData of allTypesExtendedPoolData) {
        for (const pool of extendedPoolData.poolData) {
            if (pool.gaugeAddress) {
                rewardsDict[pool.gaugeAddress.toLowerCase()] = pool.gaugeRewards;
            }
        }
    }

    return rewardsDict
}

const _usdRatesCache: IDict<{ rate: number, time: number }> = {}
export const _getUsdRate = async (assetId: string): Promise<number> => {
    if (curve.chainId === 1 && assetId.toLowerCase() === '0x8762db106b2c2a0bccb3a80d1ed41273552616e8') return 0; // RSR
    const pricesFromApi = await _getUsdPricesFromApi();
    if (assetId.toLowerCase() in pricesFromApi) return pricesFromApi[assetId.toLowerCase()];

    if (assetId === 'USD') return 1

    let chainName = {
        1: 'ethereum',
    }[curve.chainId];

    const nativeTokenName = {
        1: 'ethereum',
    }[curve.chainId] as string;

    if (chainName === undefined) {
        throw Error('curve object is not initialized')
    }

    assetId = {
        'CRV': 'curve-dao-token',
        'EUR': 'stasis-eurs',
        'BTC': 'bitcoin',
        'ETH': 'ethereum',
        'LINK': 'link',
    }[assetId.toUpperCase()] || assetId
    assetId = isEth(assetId) ? nativeTokenName : assetId.toLowerCase();


    // CRV
    if (assetId.toLowerCase() === curve.constants.ALIASES.crv) {
        assetId = 'curve-dao-token';
    }

    if ((_usdRatesCache[assetId]?.time || 0) + 600000 < Date.now()) {
        const url = [nativeTokenName, 'ethereum', 'bitcoin', 'link', 'curve-dao-token', 'stasis-eurs'].includes(assetId.toLowerCase()) ?
            `https://api.coingecko.com/api/v3/simple/price?ids=${assetId}&vs_currencies=usd` :
            `https://api.coingecko.com/api/v3/simple/token_price/${chainName}?contract_addresses=${assetId}&vs_currencies=usd`
        const data = (await (await fetch(url)).json());
        try {
            _usdRatesCache[assetId] = {'rate': data[assetId]['usd'] ?? 0, 'time': Date.now()};
        } catch (err) { // TODO pay attention!
            _usdRatesCache[assetId] = {'rate': 0, 'time': Date.now()};
        }
    }

    return _usdRatesCache[assetId]['rate']
}

export const getUsdRate = async (coin: string): Promise<number> => {
    const [coinAddress] = _getCoinAddressesNoCheck(coin);
    return await _getUsdRate(coinAddress);
}

const _getNetworkName = (network: INetworkName | IChainId = curve.chainId): INetworkName => {
    if (typeof network === "number" && NETWORK_CONSTANTS[network]) {
        return NETWORK_CONSTANTS[network].NAME;
    } else if (typeof network === "string" && Object.values(NETWORK_CONSTANTS).map((n) => n.NAME).includes(network)) {
        return network;
    } else {
        throw Error(`Wrong network name or id: ${network}`);
    }
}

const _getChainId = (network: INetworkName | IChainId = curve.chainId): IChainId => {
    if (typeof network === "number" && NETWORK_CONSTANTS[network]) {
        return network;
    } else if (typeof network === "string" && Object.values(NETWORK_CONSTANTS).map((n) => n.NAME).includes(network)) {
        const idx = Object.values(NETWORK_CONSTANTS).map((n) => n.NAME).indexOf(network);
        return Number(Object.keys(NETWORK_CONSTANTS)[idx]) as IChainId;
    } else {
        throw Error(`Wrong network name or id: ${network}`);
    }
}

export const getTVL = async (network: INetworkName | IChainId = curve.chainId): Promise<number> => {
    network = _getNetworkName(network);
    const promises = [
        _getPoolsFromApi(network, "main"),
        _getPoolsFromApi(network, "crypto"),
        _getPoolsFromApi(network, "factory"),
        _getPoolsFromApi(network, "factory-crypto"),
    ];
    const allTypesExtendedPoolData = await Promise.all(promises);

    return allTypesExtendedPoolData.reduce((sum, data) => sum + (data.tvl ?? data.tvlAll ?? 0), 0)
}

export const getVolume = async (network: INetworkName | IChainId = curve.chainId): Promise<{ totalVolume: number, cryptoVolume: number, cryptoShare: number }> => {
    network = _getNetworkName(network);
    if (["moonbeam", "kava", "celo", "aurora"].includes(network)) {
        const chainId = _getChainId(network);
        if (curve.chainId !== chainId) throw Error("To get volume for Moonbeam, Kava, Celo or Aurora connect to the network first");
        const [mainPoolsData, factoryPoolsData] = await Promise.all([
            _getLegacyAPYsAndVolumes(network),
            _getFactoryAPYsAndVolumes(network),
        ]);
        let volume = 0;
        for (const id in mainPoolsData) {
            volume += mainPoolsData[id].volume ?? 0;
        }
        for (const pool of factoryPoolsData) {
            const lpToken = _getTokenAddressBySwapAddress(pool.poolAddress);
            const lpPrice = lpToken ? await _getUsdRate(lpToken) : 0;
            volume += pool.volume * lpPrice;
        }

        return { totalVolume: volume, cryptoVolume: 0, cryptoShare: 0 }
    }

    const { totalVolume, cryptoVolume, cryptoShare } = await _getSubgraphData(network);
    return { totalVolume, cryptoVolume, cryptoShare }
}

export const _setContracts = (address: string, abi: any): void => {
    curve.contracts[address] = {
        contract: new Contract(address, abi, curve.provider),
        multicallContract: new MulticallContract(address, abi),
    }
}

// Find k for which x * k = target_x or y * k = target_y
// k = max(target_x / x, target_y / y)
// small_x = x * k
export const _get_small_x = (_x: ethersBigNumber, _y: ethersBigNumber, x_decimals: number, y_decimals: number): BigNumber => {
    const target_x = BN(10 ** (x_decimals > 5 ? x_decimals - 3 : x_decimals));
    const target_y = BN(10 ** (y_decimals > 5 ? y_decimals - 3 : y_decimals));
    const x_int_BN = toBN(_x, 0);
    const y_int_BN = toBN(_y, 0);
    const k = BigNumber.max(target_x.div(x_int_BN), target_y.div(y_int_BN));

    return BigNumber.min(x_int_BN.times(k), BN(10 ** x_decimals));
}

export const _get_price_impact = (
    _x: ethersBigNumber,
    _y: ethersBigNumber,
    _small_x: ethersBigNumber,
    _small_y: ethersBigNumber,
    x_decimals: number,
    y_decimals: number
): BigNumber => {
    const x_BN = toBN(_x, x_decimals);
    const y_BN = toBN(_y, y_decimals);
    const small_x_BN = toBN(_small_x, x_decimals);
    const small_y_BN = toBN(_small_y, y_decimals);
    const rateBN = y_BN.div(x_BN);
    const smallRateBN = small_y_BN.div(small_x_BN);
    if (rateBN.gt(smallRateBN)) return BN(0);

    return BN(1).minus(rateBN.div(smallRateBN)).times(100);
}

export const getCoinsData = async (...coins: string[] | string[][]): Promise<{name: string, symbol: string, decimals: number}[]> => {
    if (coins.length == 1 && Array.isArray(coins[0])) coins = coins[0];
    coins = coins as string[];
    const coinAddresses = _getCoinAddressesNoCheck(coins);
    console.log(coinAddresses);

    const ethIndex = getEthIndex(coinAddresses);
    if (ethIndex !== -1) {
        coinAddresses.splice(ethIndex, 1);
    }

    const contractCalls = [];
    for (const coinAddr of coinAddresses) {
        const coinContract = new MulticallContract(coinAddr, ERC20Abi);
        contractCalls.push(coinContract.name(), coinContract.symbol(), coinContract.decimals());
    }
    const _response = await curve.multicallProvider.all(contractCalls);

    if (ethIndex !== -1) {
        _response.splice(ethIndex * 2, 0, ...['Ethereum', 'ETH', 18]);
    }

    const res: {name: string, symbol: string, decimals: number}[]  = [];
    coins.forEach((address: string, i: number) => {
        res.push({
            name: _response.shift() as string,
            symbol: _response.shift() as string,
            decimals: Number(ethersFormatUnits(_response.shift() as string, 0)),
        })
    });

    return res;
}
