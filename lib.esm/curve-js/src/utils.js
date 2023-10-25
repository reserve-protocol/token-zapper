import { Contract as MulticallContract } from "../../ethcall/src";
import BigNumber from 'bignumber.js';
import { curve, NETWORK_CONSTANTS } from "./curve";
import { _getFactoryAPYsAndVolumes, _getLegacyAPYsAndVolumes, _getPoolsFromApi, _getSubgraphData } from "./external-api";
import ERC20Abi from './constants/abis/ERC20.json';
import { MaxUint256 } from "@ethersproject/constants";
import { parseUnits as ethersParseUnits, formatUnits as ethersFormatUnits } from "@ethersproject/units";
import { Contract } from "@ethersproject/contracts";
export const ETH_ADDRESS = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
export const MAX_ALLOWANCE = MaxUint256;
// Formatting numbers
export const _cutZeros = (strn) => {
    return strn.replace(/0+$/gi, '').replace(/\.$/gi, '');
};
export const checkNumber = (n) => {
    if (Number(n) !== Number(n))
        throw Error(`${n} is not a number`); // NaN
    return n;
};
export const formatNumber = (n, decimals = 18) => {
    if (Number(n) !== Number(n))
        throw Error(`${n} is not a number`); // NaN
    const [integer, fractional] = String(n).split(".");
    return !fractional ? integer : integer + "." + fractional.slice(0, decimals);
};
export const parseUnits = (n, decimals = 18) => {
    return ethersParseUnits(formatNumber(n, decimals), decimals);
};
// bignumber.js
export const BN = (val) => new BigNumber(checkNumber(val));
export const toBN = (n, decimals = 18) => {
    return BN(ethersFormatUnits(n, decimals));
};
export const toBN2 = (n, decimals = 18) => {
    return BN(ethersFormatUnits(n, decimals));
};
export const toStringFromBN = (bn, decimals = 18) => {
    return bn.toFixed(decimals);
};
export const fromBN = (bn, decimals = 18) => {
    return ethersParseUnits(toStringFromBN(bn, decimals), decimals);
};
export const fromBN2 = (bn, decimals = 18) => {
    return ethersParseUnits(toStringFromBN(bn, decimals), decimals).toBigInt();
};
// -------------------
export const isEth = (address) => address.toLowerCase() === ETH_ADDRESS.toLowerCase();
export const getEthIndex = (addresses) => addresses.map((address) => address.toLowerCase()).indexOf(ETH_ADDRESS.toLowerCase());
// coins can be either addresses or symbols
export const _getCoinAddressesNoCheck = (...coins) => {
    if (coins.length == 1 && Array.isArray(coins[0]))
        coins = coins[0];
    coins = coins;
    return coins.map((c) => c.toLowerCase()).map((c) => curve.constants.COINS[c] || c);
};
export const _getCoinAddresses = (...coins) => {
    const coinAddresses = _getCoinAddressesNoCheck(...coins);
    const availableAddresses = [...Object.keys(curve.constants.DECIMALS), ...curve.constants.GAUGES];
    for (const coinAddr of coinAddresses) {
        if (!availableAddresses.includes(coinAddr))
            throw Error(`Coin with address '${coinAddr}' is not available`);
    }
    return coinAddresses;
};
export const _getCoinDecimals = (...coinAddresses) => {
    if (coinAddresses.length == 1 && Array.isArray(coinAddresses[0]))
        coinAddresses = coinAddresses[0];
    coinAddresses = coinAddresses;
    return coinAddresses.map((coinAddr) => curve.constants.DECIMALS[coinAddr.toLowerCase()] ?? 18); // 18 for gauges
};
export const _getBalances = async (coins, addresses) => {
    const coinAddresses = _getCoinAddresses(coins);
    const decimals = _getCoinDecimals(coinAddresses);
    const ethIndex = getEthIndex(coinAddresses);
    if (ethIndex !== -1) {
        coinAddresses.splice(ethIndex, 1);
    }
    const contractCalls = [];
    for (const coinAddr of coinAddresses) {
        contractCalls.push(...addresses.map((address) => curve.contracts[coinAddr].multicallContract.balanceOf(address)));
    }
    const _response = await curve.multicallProvider.all(contractCalls);
    if (ethIndex !== -1) {
        const ethBalances = [];
        for (const address of addresses) {
            ethBalances.push(await curve.provider.getBalance(address));
        }
        _response.splice(ethIndex * addresses.length, 0, ...ethBalances);
    }
    const _balances = {};
    addresses.forEach((address, i) => {
        _balances[address] = coins.map((_, j) => _response[i + (j * addresses.length)]);
    });
    const balances = {};
    for (const address of addresses) {
        balances[address] = _balances[address].map((b, i) => ethersFormatUnits(b, decimals[i]));
    }
    return balances;
};
export const _prepareAddresses = (addresses) => {
    if (addresses.length == 1 && Array.isArray(addresses[0]))
        addresses = addresses[0];
    if (addresses.length === 0 && curve.signerAddress !== '')
        addresses = [curve.signerAddress];
    addresses = addresses;
    return addresses.filter((val, idx, arr) => arr.indexOf(val) === idx);
};
export const getBalances = async (coins, ...addresses) => {
    addresses = _prepareAddresses(addresses);
    const balances = await _getBalances(coins, addresses);
    return addresses.length === 1 ? balances[addresses[0]] : balances;
};
export const _getAllowance = async (coins, address, spender) => {
    const _coins = [...coins];
    const ethIndex = getEthIndex(_coins);
    if (ethIndex !== -1) {
        _coins.splice(ethIndex, 1);
    }
    let allowance;
    if (_coins.length === 1) {
        allowance = [await curve.contracts[_coins[0]].contract.allowance(address, spender, curve.constantOptions)];
    }
    else {
        const contractCalls = _coins.map((coinAddr) => curve.contracts[coinAddr].multicallContract.allowance(address, spender));
        allowance = await curve.multicallProvider.all(contractCalls);
    }
    if (ethIndex !== -1) {
        allowance.splice(ethIndex, 0, MAX_ALLOWANCE);
    }
    return allowance;
};
// coins can be either addresses or symbols
export const getAllowance = async (coins, address, spender) => {
    const coinAddresses = _getCoinAddresses(coins);
    const decimals = _getCoinDecimals(coinAddresses);
    const _allowance = await _getAllowance(coinAddresses, address, spender);
    return _allowance.map((a, i) => ethersFormatUnits(a, decimals[i]));
};
// coins can be either addresses or symbols
export const hasAllowance = async (coins, amounts, address, spender) => {
    const coinAddresses = _getCoinAddresses(coins);
    const decimals = _getCoinDecimals(coinAddresses);
    const _allowance = await _getAllowance(coinAddresses, address, spender);
    const _amounts = amounts.map((a, i) => parseUnits(a, decimals[i]));
    return _allowance.map((a, i) => a.gte(_amounts[i])).reduce((a, b) => a && b);
};
export const getPoolNameBySwapAddress = (swapAddress) => {
    const poolsData = { ...curve.constants.POOLS_DATA, ...curve.constants.FACTORY_POOLS_DATA, ...curve.constants.CRYPTO_FACTORY_POOLS_DATA };
    return Object.entries(poolsData).filter(([_, poolData]) => poolData.swap_address.toLowerCase() === swapAddress.toLowerCase())[0][0];
};
const _getTokenAddressBySwapAddress = (swapAddress) => {
    const poolsData = { ...curve.constants.POOLS_DATA, ...curve.constants.FACTORY_POOLS_DATA, ...curve.constants.CRYPTO_FACTORY_POOLS_DATA };
    const res = Object.entries(poolsData).filter(([_, poolData]) => poolData.swap_address.toLowerCase() === swapAddress.toLowerCase());
    if (res.length === 0)
        return "";
    return res[0][1].token_address;
};
export const _getUsdPricesFromApi = async () => {
    const network = curve.constants.NETWORK_NAME;
    const promises = [
        _getPoolsFromApi(network, "main"),
        _getPoolsFromApi(network, "crypto"),
        _getPoolsFromApi(network, "factory"),
        _getPoolsFromApi(network, "factory-crypto"),
    ];
    const allTypesExtendedPoolData = await Promise.all(promises);
    const priceDict = {};
    for (const extendedPoolData of allTypesExtendedPoolData) {
        for (const pool of extendedPoolData.poolData) {
            const lpTokenAddress = pool.lpTokenAddress ?? pool.address;
            const totalSupply = pool.totalSupply / (10 ** 18);
            priceDict[lpTokenAddress.toLowerCase()] = pool.usdTotal && totalSupply ? pool.usdTotal / totalSupply : 0;
            for (const coin of pool.coins) {
                if (typeof coin.usdPrice === "number")
                    priceDict[coin.address.toLowerCase()] = coin.usdPrice;
            }
            for (const coin of pool.gaugeRewards ?? []) {
                if (typeof coin.tokenPrice === "number")
                    priceDict[coin.tokenAddress.toLowerCase()] = coin.tokenPrice;
            }
        }
    }
    return priceDict;
};
export const _getCrvApyFromApi = async () => {
    const network = curve.constants.NETWORK_NAME;
    const promises = [
        _getPoolsFromApi(network, "main"),
        _getPoolsFromApi(network, "crypto"),
        _getPoolsFromApi(network, "factory"),
        _getPoolsFromApi(network, "factory-crypto"),
    ];
    const allTypesExtendedPoolData = await Promise.all(promises);
    const apyDict = {};
    for (const extendedPoolData of allTypesExtendedPoolData) {
        for (const pool of extendedPoolData.poolData) {
            if (pool.gaugeAddress) {
                if (!pool.gaugeCrvApy) {
                    apyDict[pool.gaugeAddress.toLowerCase()] = [0, 0];
                }
                else {
                    apyDict[pool.gaugeAddress.toLowerCase()] = [pool.gaugeCrvApy[0] ?? 0, pool.gaugeCrvApy[1] ?? 0];
                }
            }
        }
    }
    return apyDict;
};
export const _getRewardsFromApi = async () => {
    const network = curve.constants.NETWORK_NAME;
    const promises = [
        _getPoolsFromApi(network, "main"),
        _getPoolsFromApi(network, "crypto"),
        _getPoolsFromApi(network, "factory"),
        _getPoolsFromApi(network, "factory-crypto"),
    ];
    const allTypesExtendedPoolData = await Promise.all(promises);
    const rewardsDict = {};
    for (const extendedPoolData of allTypesExtendedPoolData) {
        for (const pool of extendedPoolData.poolData) {
            if (pool.gaugeAddress) {
                rewardsDict[pool.gaugeAddress.toLowerCase()] = pool.gaugeRewards;
            }
        }
    }
    return rewardsDict;
};
const _usdRatesCache = {};
export const _getUsdRate = async (assetId) => {
    if (curve.chainId === 1 && assetId.toLowerCase() === '0x8762db106b2c2a0bccb3a80d1ed41273552616e8')
        return 0; // RSR
    const pricesFromApi = await _getUsdPricesFromApi();
    if (assetId.toLowerCase() in pricesFromApi)
        return pricesFromApi[assetId.toLowerCase()];
    if (assetId === 'USD')
        return 1;
    let chainName = {
        1: 'ethereum',
    }[curve.chainId];
    const nativeTokenName = {
        1: 'ethereum',
    }[curve.chainId];
    if (chainName === undefined) {
        throw Error('curve object is not initialized');
    }
    assetId = {
        'CRV': 'curve-dao-token',
        'EUR': 'stasis-eurs',
        'BTC': 'bitcoin',
        'ETH': 'ethereum',
        'LINK': 'link',
    }[assetId.toUpperCase()] || assetId;
    assetId = isEth(assetId) ? nativeTokenName : assetId.toLowerCase();
    // CRV
    if (assetId.toLowerCase() === curve.constants.ALIASES.crv) {
        assetId = 'curve-dao-token';
    }
    if ((_usdRatesCache[assetId]?.time || 0) + 600000 < Date.now()) {
        const url = [nativeTokenName, 'ethereum', 'bitcoin', 'link', 'curve-dao-token', 'stasis-eurs'].includes(assetId.toLowerCase()) ?
            `https://api.coingecko.com/api/v3/simple/price?ids=${assetId}&vs_currencies=usd` :
            `https://api.coingecko.com/api/v3/simple/token_price/${chainName}?contract_addresses=${assetId}&vs_currencies=usd`;
        const data = (await (await fetch(url)).json());
        try {
            _usdRatesCache[assetId] = { 'rate': data[assetId]['usd'] ?? 0, 'time': Date.now() };
        }
        catch (err) { // TODO pay attention!
            _usdRatesCache[assetId] = { 'rate': 0, 'time': Date.now() };
        }
    }
    return _usdRatesCache[assetId]['rate'];
};
export const getUsdRate = async (coin) => {
    const [coinAddress] = _getCoinAddressesNoCheck(coin);
    return await _getUsdRate(coinAddress);
};
const _getNetworkName = (network = curve.chainId) => {
    if (typeof network === "number" && NETWORK_CONSTANTS[network]) {
        return NETWORK_CONSTANTS[network].NAME;
    }
    else if (typeof network === "string" && Object.values(NETWORK_CONSTANTS).map((n) => n.NAME).includes(network)) {
        return network;
    }
    else {
        throw Error(`Wrong network name or id: ${network}`);
    }
};
const _getChainId = (network = curve.chainId) => {
    if (typeof network === "number" && NETWORK_CONSTANTS[network]) {
        return network;
    }
    else if (typeof network === "string" && Object.values(NETWORK_CONSTANTS).map((n) => n.NAME).includes(network)) {
        const idx = Object.values(NETWORK_CONSTANTS).map((n) => n.NAME).indexOf(network);
        return Number(Object.keys(NETWORK_CONSTANTS)[idx]);
    }
    else {
        throw Error(`Wrong network name or id: ${network}`);
    }
};
export const getTVL = async (network = curve.chainId) => {
    network = _getNetworkName(network);
    const promises = [
        _getPoolsFromApi(network, "main"),
        _getPoolsFromApi(network, "crypto"),
        _getPoolsFromApi(network, "factory"),
        _getPoolsFromApi(network, "factory-crypto"),
    ];
    const allTypesExtendedPoolData = await Promise.all(promises);
    return allTypesExtendedPoolData.reduce((sum, data) => sum + (data.tvl ?? data.tvlAll ?? 0), 0);
};
export const getVolume = async (network = curve.chainId) => {
    network = _getNetworkName(network);
    if (["moonbeam", "kava", "celo", "aurora"].includes(network)) {
        const chainId = _getChainId(network);
        if (curve.chainId !== chainId)
            throw Error("To get volume for Moonbeam, Kava, Celo or Aurora connect to the network first");
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
        return { totalVolume: volume, cryptoVolume: 0, cryptoShare: 0 };
    }
    const { totalVolume, cryptoVolume, cryptoShare } = await _getSubgraphData(network);
    return { totalVolume, cryptoVolume, cryptoShare };
};
export const _setContracts = (address, abi) => {
    curve.contracts[address] = {
        contract: new Contract(address, abi, curve.provider),
        multicallContract: new MulticallContract(address, abi),
    };
};
// Find k for which x * k = target_x or y * k = target_y
// k = max(target_x / x, target_y / y)
// small_x = x * k
export const _get_small_x = (_x, _y, x_decimals, y_decimals) => {
    const target_x = BN(10 ** (x_decimals > 5 ? x_decimals - 3 : x_decimals));
    const target_y = BN(10 ** (y_decimals > 5 ? y_decimals - 3 : y_decimals));
    const x_int_BN = toBN(_x, 0);
    const y_int_BN = toBN(_y, 0);
    const k = BigNumber.max(target_x.div(x_int_BN), target_y.div(y_int_BN));
    return BigNumber.min(x_int_BN.times(k), BN(10 ** x_decimals));
};
export const _get_price_impact = (_x, _y, _small_x, _small_y, x_decimals, y_decimals) => {
    const x_BN = toBN(_x, x_decimals);
    const y_BN = toBN(_y, y_decimals);
    const small_x_BN = toBN(_small_x, x_decimals);
    const small_y_BN = toBN(_small_y, y_decimals);
    const rateBN = y_BN.div(x_BN);
    const smallRateBN = small_y_BN.div(small_x_BN);
    if (rateBN.gt(smallRateBN))
        return BN(0);
    return BN(1).minus(rateBN.div(smallRateBN)).times(100);
};
export const getCoinsData = async (...coins) => {
    if (coins.length == 1 && Array.isArray(coins[0]))
        coins = coins[0];
    coins = coins;
    const coinAddresses = _getCoinAddressesNoCheck(coins);
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
    const res = [];
    coins.forEach((address, i) => {
        res.push({
            name: _response.shift(),
            symbol: _response.shift(),
            decimals: Number(ethersFormatUnits(_response.shift(), 0)),
        });
    });
    return res;
};
//# sourceMappingURL=utils.js.map