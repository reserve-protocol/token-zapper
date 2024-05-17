"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCoinsData = exports._get_price_impact = exports._get_small_x = exports._setContracts = exports.getVolume = exports.getTVL = exports.getUsdRate = exports._getUsdRate = exports._getRewardsFromApi = exports._getCrvApyFromApi = exports._getUsdPricesFromApi = exports.getPoolNameBySwapAddress = exports.hasAllowance = exports.getAllowance = exports._getAllowance = exports.getBalances = exports._prepareAddresses = exports._getBalances = exports._getCoinDecimals = exports._getCoinAddresses = exports._getCoinAddressesNoCheck = exports.getEthIndex = exports.isEth = exports.fromBN2 = exports.fromBN = exports.toStringFromBN = exports.toBN2 = exports.toBN = exports.BN = exports.parseUnits = exports.formatNumber = exports.checkNumber = exports._cutZeros = exports.MAX_ALLOWANCE = exports.ETH_ADDRESS = void 0;
const tslib_1 = require("tslib");
const src_1 = require("../../ethcall/src");
const bignumber_js_1 = tslib_1.__importDefault(require("bignumber.js"));
const curve_1 = require("./curve");
const external_api_1 = require("./external-api");
const ERC20_json_1 = tslib_1.__importDefault(require("./constants/abis/ERC20.json"));
const constants_1 = require("@ethersproject/constants");
const units_1 = require("@ethersproject/units");
const contracts_1 = require("@ethersproject/contracts");
exports.ETH_ADDRESS = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
exports.MAX_ALLOWANCE = constants_1.MaxUint256;
// Formatting numbers
const _cutZeros = (strn) => {
    return strn.replace(/0+$/gi, '').replace(/\.$/gi, '');
};
exports._cutZeros = _cutZeros;
const checkNumber = (n) => {
    if (Number(n) !== Number(n))
        throw Error(`${n} is not a number`); // NaN
    return n;
};
exports.checkNumber = checkNumber;
const formatNumber = (n, decimals = 18) => {
    if (Number(n) !== Number(n))
        throw Error(`${n} is not a number`); // NaN
    const [integer, fractional] = String(n).split(".");
    return !fractional ? integer : integer + "." + fractional.slice(0, decimals);
};
exports.formatNumber = formatNumber;
const parseUnits = (n, decimals = 18) => {
    return (0, units_1.parseUnits)((0, exports.formatNumber)(n, decimals), decimals);
};
exports.parseUnits = parseUnits;
// bignumber.js
const BN = (val) => new bignumber_js_1.default((0, exports.checkNumber)(val));
exports.BN = BN;
const toBN = (n, decimals = 18) => {
    return (0, exports.BN)((0, units_1.formatUnits)(n, decimals));
};
exports.toBN = toBN;
const toBN2 = (n, decimals = 18) => {
    return (0, exports.BN)((0, units_1.formatUnits)(n, decimals));
};
exports.toBN2 = toBN2;
const toStringFromBN = (bn, decimals = 18) => {
    return bn.toFixed(decimals);
};
exports.toStringFromBN = toStringFromBN;
const fromBN = (bn, decimals = 18) => {
    return (0, units_1.parseUnits)((0, exports.toStringFromBN)(bn, decimals), decimals);
};
exports.fromBN = fromBN;
const fromBN2 = (bn, decimals = 18) => {
    return (0, units_1.parseUnits)((0, exports.toStringFromBN)(bn, decimals), decimals).toBigInt();
};
exports.fromBN2 = fromBN2;
// -------------------
const isEth = (address) => address.toLowerCase() === exports.ETH_ADDRESS.toLowerCase();
exports.isEth = isEth;
const getEthIndex = (addresses) => addresses.map((address) => address.toLowerCase()).indexOf(exports.ETH_ADDRESS.toLowerCase());
exports.getEthIndex = getEthIndex;
// coins can be either addresses or symbols
const _getCoinAddressesNoCheck = (...coins) => {
    if (coins.length == 1 && Array.isArray(coins[0]))
        coins = coins[0];
    coins = coins;
    return coins.map((c) => c.toLowerCase()).map((c) => curve_1.curve.constants.COINS[c] || c);
};
exports._getCoinAddressesNoCheck = _getCoinAddressesNoCheck;
const _getCoinAddresses = (...coins) => {
    const coinAddresses = (0, exports._getCoinAddressesNoCheck)(...coins);
    const availableAddresses = [...Object.keys(curve_1.curve.constants.DECIMALS), ...curve_1.curve.constants.GAUGES];
    for (const coinAddr of coinAddresses) {
        if (!availableAddresses.includes(coinAddr))
            throw Error(`Coin with address '${coinAddr}' is not available`);
    }
    return coinAddresses;
};
exports._getCoinAddresses = _getCoinAddresses;
const _getCoinDecimals = (...coinAddresses) => {
    if (coinAddresses.length == 1 && Array.isArray(coinAddresses[0]))
        coinAddresses = coinAddresses[0];
    coinAddresses = coinAddresses;
    return coinAddresses.map((coinAddr) => curve_1.curve.constants.DECIMALS[coinAddr.toLowerCase()] ?? 18); // 18 for gauges
};
exports._getCoinDecimals = _getCoinDecimals;
const _getBalances = async (coins, addresses) => {
    const coinAddresses = (0, exports._getCoinAddresses)(coins);
    const decimals = (0, exports._getCoinDecimals)(coinAddresses);
    const ethIndex = (0, exports.getEthIndex)(coinAddresses);
    if (ethIndex !== -1) {
        coinAddresses.splice(ethIndex, 1);
    }
    const contractCalls = [];
    for (const coinAddr of coinAddresses) {
        contractCalls.push(...addresses.map((address) => curve_1.curve.contracts[coinAddr].multicallContract.balanceOf(address)));
    }
    const _response = await curve_1.curve.multicallProvider.all(contractCalls);
    if (ethIndex !== -1) {
        const ethBalances = [];
        for (const address of addresses) {
            ethBalances.push(await curve_1.curve.provider.getBalance(address));
        }
        _response.splice(ethIndex * addresses.length, 0, ...ethBalances);
    }
    const _balances = {};
    addresses.forEach((address, i) => {
        _balances[address] = coins.map((_, j) => _response[i + (j * addresses.length)]);
    });
    const balances = {};
    for (const address of addresses) {
        balances[address] = _balances[address].map((b, i) => (0, units_1.formatUnits)(b, decimals[i]));
    }
    return balances;
};
exports._getBalances = _getBalances;
const _prepareAddresses = (addresses) => {
    if (addresses.length == 1 && Array.isArray(addresses[0]))
        addresses = addresses[0];
    if (addresses.length === 0 && curve_1.curve.signerAddress !== '')
        addresses = [curve_1.curve.signerAddress];
    addresses = addresses;
    return addresses.filter((val, idx, arr) => arr.indexOf(val) === idx);
};
exports._prepareAddresses = _prepareAddresses;
const getBalances = async (coins, ...addresses) => {
    addresses = (0, exports._prepareAddresses)(addresses);
    const balances = await (0, exports._getBalances)(coins, addresses);
    return addresses.length === 1 ? balances[addresses[0]] : balances;
};
exports.getBalances = getBalances;
const _getAllowance = async (coins, address, spender) => {
    const _coins = [...coins];
    const ethIndex = (0, exports.getEthIndex)(_coins);
    if (ethIndex !== -1) {
        _coins.splice(ethIndex, 1);
    }
    let allowance;
    if (_coins.length === 1) {
        allowance = [await curve_1.curve.contracts[_coins[0]].contract.allowance(address, spender, curve_1.curve.constantOptions)];
    }
    else {
        const contractCalls = _coins.map((coinAddr) => curve_1.curve.contracts[coinAddr].multicallContract.allowance(address, spender));
        allowance = await curve_1.curve.multicallProvider.all(contractCalls);
    }
    if (ethIndex !== -1) {
        allowance.splice(ethIndex, 0, exports.MAX_ALLOWANCE);
    }
    return allowance;
};
exports._getAllowance = _getAllowance;
// coins can be either addresses or symbols
const getAllowance = async (coins, address, spender) => {
    const coinAddresses = (0, exports._getCoinAddresses)(coins);
    const decimals = (0, exports._getCoinDecimals)(coinAddresses);
    const _allowance = await (0, exports._getAllowance)(coinAddresses, address, spender);
    return _allowance.map((a, i) => (0, units_1.formatUnits)(a, decimals[i]));
};
exports.getAllowance = getAllowance;
// coins can be either addresses or symbols
const hasAllowance = async (coins, amounts, address, spender) => {
    const coinAddresses = (0, exports._getCoinAddresses)(coins);
    const decimals = (0, exports._getCoinDecimals)(coinAddresses);
    const _allowance = await (0, exports._getAllowance)(coinAddresses, address, spender);
    const _amounts = amounts.map((a, i) => (0, exports.parseUnits)(a, decimals[i]));
    return _allowance.map((a, i) => a.gte(_amounts[i])).reduce((a, b) => a && b);
};
exports.hasAllowance = hasAllowance;
const getPoolNameBySwapAddress = (swapAddress) => {
    const poolsData = { ...curve_1.curve.constants.POOLS_DATA, ...curve_1.curve.constants.FACTORY_POOLS_DATA, ...curve_1.curve.constants.CRYPTO_FACTORY_POOLS_DATA };
    return Object.entries(poolsData).filter(([_, poolData]) => poolData.swap_address.toLowerCase() === swapAddress.toLowerCase())[0][0];
};
exports.getPoolNameBySwapAddress = getPoolNameBySwapAddress;
const _getTokenAddressBySwapAddress = (swapAddress) => {
    const poolsData = { ...curve_1.curve.constants.POOLS_DATA, ...curve_1.curve.constants.FACTORY_POOLS_DATA, ...curve_1.curve.constants.CRYPTO_FACTORY_POOLS_DATA };
    const res = Object.entries(poolsData).filter(([_, poolData]) => poolData.swap_address.toLowerCase() === swapAddress.toLowerCase());
    if (res.length === 0)
        return "";
    return res[0][1].token_address;
};
const _getUsdPricesFromApi = async () => {
    const network = curve_1.curve.constants.NETWORK_NAME;
    const promises = [
        (0, external_api_1._getPoolsFromApi)(network, "main"),
        (0, external_api_1._getPoolsFromApi)(network, "crypto"),
        (0, external_api_1._getPoolsFromApi)(network, "factory"),
        (0, external_api_1._getPoolsFromApi)(network, "factory-crypto"),
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
exports._getUsdPricesFromApi = _getUsdPricesFromApi;
const _getCrvApyFromApi = async () => {
    const network = curve_1.curve.constants.NETWORK_NAME;
    const promises = [
        (0, external_api_1._getPoolsFromApi)(network, "main"),
        (0, external_api_1._getPoolsFromApi)(network, "crypto"),
        (0, external_api_1._getPoolsFromApi)(network, "factory"),
        (0, external_api_1._getPoolsFromApi)(network, "factory-crypto"),
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
exports._getCrvApyFromApi = _getCrvApyFromApi;
const _getRewardsFromApi = async () => {
    const network = curve_1.curve.constants.NETWORK_NAME;
    const promises = [
        (0, external_api_1._getPoolsFromApi)(network, "main"),
        (0, external_api_1._getPoolsFromApi)(network, "crypto"),
        (0, external_api_1._getPoolsFromApi)(network, "factory"),
        (0, external_api_1._getPoolsFromApi)(network, "factory-crypto"),
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
exports._getRewardsFromApi = _getRewardsFromApi;
const _usdRatesCache = {};
const _getUsdRate = async (assetId) => {
    if (curve_1.curve.chainId === 1 && assetId.toLowerCase() === '0x8762db106b2c2a0bccb3a80d1ed41273552616e8')
        return 0; // RSR
    const pricesFromApi = await (0, exports._getUsdPricesFromApi)();
    if (assetId.toLowerCase() in pricesFromApi)
        return pricesFromApi[assetId.toLowerCase()];
    if (assetId === 'USD')
        return 1;
    let chainName = {
        1: 'ethereum',
    }[curve_1.curve.chainId];
    const nativeTokenName = {
        1: 'ethereum',
    }[curve_1.curve.chainId];
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
    assetId = (0, exports.isEth)(assetId) ? nativeTokenName : assetId.toLowerCase();
    // CRV
    if (assetId.toLowerCase() === curve_1.curve.constants.ALIASES.crv) {
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
exports._getUsdRate = _getUsdRate;
const getUsdRate = async (coin) => {
    const [coinAddress] = (0, exports._getCoinAddressesNoCheck)(coin);
    return await (0, exports._getUsdRate)(coinAddress);
};
exports.getUsdRate = getUsdRate;
const _getNetworkName = (network = curve_1.curve.chainId) => {
    if (typeof network === "number" && curve_1.NETWORK_CONSTANTS[network]) {
        return curve_1.NETWORK_CONSTANTS[network].NAME;
    }
    else if (typeof network === "string" && Object.values(curve_1.NETWORK_CONSTANTS).map((n) => n.NAME).includes(network)) {
        return network;
    }
    else {
        throw Error(`Wrong network name or id: ${network}`);
    }
};
const _getChainId = (network = curve_1.curve.chainId) => {
    if (typeof network === "number" && curve_1.NETWORK_CONSTANTS[network]) {
        return network;
    }
    else if (typeof network === "string" && Object.values(curve_1.NETWORK_CONSTANTS).map((n) => n.NAME).includes(network)) {
        const idx = Object.values(curve_1.NETWORK_CONSTANTS).map((n) => n.NAME).indexOf(network);
        return Number(Object.keys(curve_1.NETWORK_CONSTANTS)[idx]);
    }
    else {
        throw Error(`Wrong network name or id: ${network}`);
    }
};
const getTVL = async (network = curve_1.curve.chainId) => {
    network = _getNetworkName(network);
    const promises = [
        (0, external_api_1._getPoolsFromApi)(network, "main"),
        (0, external_api_1._getPoolsFromApi)(network, "crypto"),
        (0, external_api_1._getPoolsFromApi)(network, "factory"),
        (0, external_api_1._getPoolsFromApi)(network, "factory-crypto"),
    ];
    const allTypesExtendedPoolData = await Promise.all(promises);
    return allTypesExtendedPoolData.reduce((sum, data) => sum + (data.tvl ?? data.tvlAll ?? 0), 0);
};
exports.getTVL = getTVL;
const getVolume = async (network = curve_1.curve.chainId) => {
    network = _getNetworkName(network);
    if (["moonbeam", "kava", "celo", "aurora"].includes(network)) {
        const chainId = _getChainId(network);
        if (curve_1.curve.chainId !== chainId)
            throw Error("To get volume for Moonbeam, Kava, Celo or Aurora connect to the network first");
        const [mainPoolsData, factoryPoolsData] = await Promise.all([
            (0, external_api_1._getLegacyAPYsAndVolumes)(network),
            (0, external_api_1._getFactoryAPYsAndVolumes)(network),
        ]);
        let volume = 0;
        for (const id in mainPoolsData) {
            volume += mainPoolsData[id].volume ?? 0;
        }
        for (const pool of factoryPoolsData) {
            const lpToken = _getTokenAddressBySwapAddress(pool.poolAddress);
            const lpPrice = lpToken ? await (0, exports._getUsdRate)(lpToken) : 0;
            volume += pool.volume * lpPrice;
        }
        return { totalVolume: volume, cryptoVolume: 0, cryptoShare: 0 };
    }
    const { totalVolume, cryptoVolume, cryptoShare } = await (0, external_api_1._getSubgraphData)(network);
    return { totalVolume, cryptoVolume, cryptoShare };
};
exports.getVolume = getVolume;
const _setContracts = (address, abi) => {
    curve_1.curve.contracts[address] = {
        contract: new contracts_1.Contract(address, abi, curve_1.curve.provider),
        multicallContract: new src_1.Contract(address, abi),
    };
};
exports._setContracts = _setContracts;
// Find k for which x * k = target_x or y * k = target_y
// k = max(target_x / x, target_y / y)
// small_x = x * k
const _get_small_x = (_x, _y, x_decimals, y_decimals) => {
    const target_x = (0, exports.BN)(10 ** (x_decimals > 5 ? x_decimals - 3 : x_decimals));
    const target_y = (0, exports.BN)(10 ** (y_decimals > 5 ? y_decimals - 3 : y_decimals));
    const x_int_BN = (0, exports.toBN)(_x, 0);
    const y_int_BN = (0, exports.toBN)(_y, 0);
    const k = bignumber_js_1.default.max(target_x.div(x_int_BN), target_y.div(y_int_BN));
    return bignumber_js_1.default.min(x_int_BN.times(k), (0, exports.BN)(10 ** x_decimals));
};
exports._get_small_x = _get_small_x;
const _get_price_impact = (_x, _y, _small_x, _small_y, x_decimals, y_decimals) => {
    const x_BN = (0, exports.toBN)(_x, x_decimals);
    const y_BN = (0, exports.toBN)(_y, y_decimals);
    const small_x_BN = (0, exports.toBN)(_small_x, x_decimals);
    const small_y_BN = (0, exports.toBN)(_small_y, y_decimals);
    const rateBN = y_BN.div(x_BN);
    const smallRateBN = small_y_BN.div(small_x_BN);
    if (rateBN.gt(smallRateBN))
        return (0, exports.BN)(0);
    return (0, exports.BN)(1).minus(rateBN.div(smallRateBN)).times(100);
};
exports._get_price_impact = _get_price_impact;
const getCoinsData = async (...coins) => {
    if (coins.length == 1 && Array.isArray(coins[0]))
        coins = coins[0];
    coins = coins;
    const coinAddresses = (0, exports._getCoinAddressesNoCheck)(coins);
    const ethIndex = (0, exports.getEthIndex)(coinAddresses);
    if (ethIndex !== -1) {
        coinAddresses.splice(ethIndex, 1);
    }
    const contractCalls = [];
    for (const coinAddr of coinAddresses) {
        const coinContract = new src_1.Contract(coinAddr, ERC20_json_1.default);
        contractCalls.push(coinContract.name(), coinContract.symbol(), coinContract.decimals());
    }
    const _response = await curve_1.curve.multicallProvider.all(contractCalls);
    if (ethIndex !== -1) {
        _response.splice(ethIndex * 2, 0, ...['Ethereum', 'ETH', 18]);
    }
    const res = [];
    coins.forEach((address, i) => {
        res.push({
            name: _response.shift(),
            symbol: _response.shift(),
            decimals: Number((0, units_1.formatUnits)(_response.shift(), 0)),
        });
    });
    return res;
};
exports.getCoinsData = getCoinsData;
//# sourceMappingURL=utils.js.map