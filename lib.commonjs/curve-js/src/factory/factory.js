"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFactoryPoolData = void 0;
const tslib_1 = require("tslib");
const ERC20_json_1 = tslib_1.__importDefault(require("../constants/abis/ERC20.json"));
const common_1 = require("./common");
const constants_1 = require("./constants");
const units_1 = require("@ethersproject/units");
const constants_2 = require("@ethersproject/constants");
const src_1 = require("../../../ethcall/src");
const factoryGaugeABI = () => import("../constants/abis/gauge_factory.json", { assert: { type: "json" } }).then(i => i.default);
const BLACK_LIST = {
    1: [
        "0x066b6e1e93fa7dcd3f0eb7f8bac7d5a747ce0bf9",
    ]
};
const deepFlatten = (arr) => [].concat(...arr.map((v) => (Array.isArray(v) ? deepFlatten(v) : v)));
async function getRecentlyCreatedPoolId(swapAddress) {
    const factoryContract = this.contracts[this.constants.ALIASES.factory].contract;
    const poolCount = Number((0, units_1.formatUnits)(await factoryContract.pool_count(this.constantOptions), 0));
    for (let i = 1; i <= poolCount; i++) {
        const address = await factoryContract.pool_list(poolCount - i);
        if (address.toLowerCase() === swapAddress.toLowerCase())
            return `factory-v2-${poolCount - i}`;
    }
    throw Error("Unknown pool");
}
async function getFactoryIdsAndSwapAddresses(fromIdx = 0) {
    const factoryContract = this.contracts[this.constants.ALIASES.factory].contract;
    const factoryMulticallContract = this.contracts[this.constants.ALIASES.factory].multicallContract;
    const poolCount = Number((0, units_1.formatUnits)(await factoryContract.pool_count(this.constantOptions), 0));
    const calls = [];
    for (let i = fromIdx; i < poolCount; i++) {
        calls.push(factoryMulticallContract.pool_list(i));
    }
    if (calls.length === 0)
        return [[], []];
    let factories = (await this.multicallProvider.all(calls)).map((addr, i) => ({ id: `factory-v2-${fromIdx + i}`, address: addr.toLowerCase() }));
    const swapAddresses = Object.values(this.constants.POOLS_DATA).map((pool) => pool.swap_address.toLowerCase());
    const blacklist = BLACK_LIST[this.chainId] ?? [];
    factories = factories.filter((f) => !swapAddresses.includes(f.address) && !blacklist.includes(f.address));
    return [factories.map((f) => f.id), factories.map((f) => f.address)];
}
function _handleReferenceAssets(referenceAssets) {
    return referenceAssets.map((t) => {
        return {
            0: "USD",
            1: "ETH",
            2: "BTC",
        }[(0, units_1.formatUnits)(t, 0)] || "OTHER";
    });
}
function _handleCoinAddresses(coinAddresses) {
    return coinAddresses.map((addresses) => addresses
        .filter((addr) => addr !== constants_2.AddressZero)
        .map((addr) => addr.toLowerCase()));
}
async function getPoolsData(factorySwapAddresses) {
    const factoryMulticallContract = this.contracts[this.constants.ALIASES.factory].multicallContract;
    const calls = [];
    for (const addr of factorySwapAddresses) {
        const tempSwapContract = new src_1.Contract(addr, ERC20_json_1.default);
        calls.push(factoryMulticallContract.get_implementation_address(addr));
        calls.push(factoryMulticallContract.get_gauge(addr));
        calls.push(factoryMulticallContract.get_pool_asset_type(addr));
        calls.push(tempSwapContract.symbol());
        calls.push(tempSwapContract.name());
        calls.push(factoryMulticallContract.is_meta(addr));
        calls.push(factoryMulticallContract.get_coins(addr));
    }
    const res = await this.multicallProvider.all(calls);
    const implememntationAddresses = res.filter((a, i) => i % 7 == 0).map((a) => a.toLowerCase());
    const gaugeAddresses = res.filter((a, i) => i % 7 == 1).map((a) => a.toLowerCase());
    const referenceAssets = _handleReferenceAssets(res.filter((a, i) => i % 7 == 2));
    const symbols = res.filter((a, i) => i % 7 == 3);
    const names = res.filter((a, i) => i % 7 == 4);
    const isMeta = res.filter((a, i) => i % 7 == 5);
    const coinAddresses = _handleCoinAddresses.call(this, res.filter((a, i) => i % 7 == 6));
    return [implememntationAddresses, gaugeAddresses, referenceAssets, symbols, names, isMeta, coinAddresses];
}
function setFactorySwapContracts(factorySwapAddresses, factorySwapABIs) {
    factorySwapAddresses.forEach((addr, i) => {
        this.setContract(addr, factorySwapABIs[i]);
    });
}
function setFactoryGaugeContracts(factoryGaugeAddresses) {
    factoryGaugeAddresses.filter((addr) => addr !== constants_2.AddressZero).forEach((addr, i) => {
        this.setContract(addr, factoryGaugeABI());
    });
}
function setFactoryCoinsContracts(coinAddresses) {
    const flattenedCoinAddresses = Array.from(new Set(deepFlatten(coinAddresses)));
    for (const addr of flattenedCoinAddresses) {
        if (addr in this.contracts)
            continue;
        this.setContract(addr, ERC20_json_1.default);
    }
}
function getExistingCoinAddressNameDict() {
    const dict = {};
    for (const poolData of Object.values(this.constants.POOLS_DATA)) {
        poolData.wrapped_coin_addresses.forEach((addr, i) => {
            if (!(addr.toLowerCase() in dict)) {
                dict[addr.toLowerCase()] = poolData.wrapped_coins[i];
            }
        });
        poolData.underlying_coin_addresses.forEach((addr, i) => {
            if (!(addr.toLowerCase() in dict)) {
                dict[addr.toLowerCase()] = poolData.underlying_coins[i];
            }
        });
    }
    dict[this.constants.NATIVE_TOKEN.address] = this.constants.NATIVE_TOKEN.symbol;
    return dict;
}
async function getCoinsData(coinAddresses, existingCoinAddrNameDict, existingCoinAddrDecimalsDict) {
    const flattenedCoinAddresses = Array.from(new Set(deepFlatten(coinAddresses)));
    const newCoinAddresses = [];
    const coinAddrNamesDict = {};
    const coinAddrDecimalsDict = {};
    for (const addr of flattenedCoinAddresses) {
        if (addr in existingCoinAddrNameDict) {
            coinAddrNamesDict[addr] = existingCoinAddrNameDict[addr];
            coinAddrDecimalsDict[addr] = existingCoinAddrDecimalsDict[addr];
        }
        else {
            newCoinAddresses.push(addr);
        }
    }
    const calls = [];
    for (const addr of newCoinAddresses) {
        calls.push(this.contracts[addr].multicallContract.symbol());
        calls.push(this.contracts[addr].multicallContract.decimals());
    }
    const res = await this.multicallProvider.all(calls);
    const symbols = res.filter((a, i) => i % 2 == 0);
    const decimals = res.filter((a, i) => i % 2 == 1).map((_d) => Number((0, units_1.formatUnits)(_d, 0)));
    newCoinAddresses.forEach((addr, i) => {
        coinAddrNamesDict[addr] = symbols[i];
        coinAddrDecimalsDict[addr] = decimals[i];
    });
    return [coinAddrNamesDict, coinAddrDecimalsDict];
}
async function getFactoryPoolData(fromIdx = 0, swapAddress) {
    const [rawPoolIds, rawSwapAddresses] = swapAddress ?
        [[await getRecentlyCreatedPoolId.call(this, swapAddress)], [swapAddress.toLowerCase()]]
        : await getFactoryIdsAndSwapAddresses.call(this, fromIdx);
    if (rawPoolIds.length === 0)
        return {};
    const [rawImplementations, rawGauges, rawReferenceAssets, rawPoolSymbols, rawPoolNames, rawIsMeta, rawCoinAddresses] = await getPoolsData.call(this, rawSwapAddresses);
    const poolIds = [];
    const swapAddresses = [];
    const implementations = [];
    const gaugeAddresses = [];
    const referenceAssets = [];
    const poolSymbols = [];
    const poolNames = [];
    const isMeta = [];
    const coinAddresses = [];
    const implementationABIDict = constants_1.FACTORY_CONSTANTS[this.chainId].implementationABIDict;
    for (let i = 0; i < rawPoolIds.length; i++) {
        if (rawImplementations[i] in implementationABIDict) {
            poolIds.push(rawPoolIds[i]);
            swapAddresses.push(rawSwapAddresses[i]);
            implementations.push(rawImplementations[i]);
            gaugeAddresses.push(rawGauges[i]);
            referenceAssets.push(rawReferenceAssets[i]);
            poolSymbols.push(rawPoolSymbols[i]);
            poolNames.push(rawPoolNames[i]);
            isMeta.push(rawIsMeta[i]);
            coinAddresses.push(rawCoinAddresses[i]);
        }
    }
    const swapABIs = implementations.map((addr) => implementationABIDict[addr]);
    setFactorySwapContracts.call(this, swapAddresses, swapABIs);
    setFactoryGaugeContracts.call(this, gaugeAddresses);
    setFactoryCoinsContracts.call(this, coinAddresses);
    common_1.setFactoryZapContracts.call(this, false);
    const [coinAddressNameDict, coinAddressDecimalsDict] = await getCoinsData.call(this, coinAddresses, getExistingCoinAddressNameDict.call(this), this.constants.DECIMALS);
    const implementationBasePoolIdDict = constants_1.FACTORY_CONSTANTS[this.chainId].implementationBasePoolIdDict;
    const basePoolIds = implementations.map((addr) => implementationBasePoolIdDict[addr]);
    const FACTORY_POOLS_DATA = {};
    for (let i = 0; i < poolIds.length; i++) {
        if (!isMeta[i]) {
            FACTORY_POOLS_DATA[poolIds[i]] = {
                name: poolNames[i].split(": ")[1].trim(),
                full_name: poolNames[i],
                symbol: poolSymbols[i],
                reference_asset: referenceAssets[i],
                swap_address: swapAddresses[i],
                token_address: swapAddresses[i],
                gauge_address: gaugeAddresses[i],
                implementation_address: implementations[i], // Only for testing
                is_plain: true,
                is_factory: true,
                underlying_coins: coinAddresses[i].map((addr) => coinAddressNameDict[addr]),
                wrapped_coins: coinAddresses[i].map((addr) => coinAddressNameDict[addr]),
                underlying_coin_addresses: coinAddresses[i],
                wrapped_coin_addresses: coinAddresses[i],
                underlying_decimals: coinAddresses[i].map((addr) => coinAddressDecimalsDict[addr]),
                wrapped_decimals: coinAddresses[i].map((addr) => coinAddressDecimalsDict[addr]),
                swap_abi: swapABIs[i],
                gauge_abi: factoryGaugeABI,
            };
        }
        else {
            const allPoolsData = { ...this.constants.POOLS_DATA, ...FACTORY_POOLS_DATA };
            // @ts-ignore
            const basePoolIdCoinsDict = Object.fromEntries(basePoolIds.map((poolId) => [poolId, allPoolsData[poolId]?.underlying_coins]));
            // @ts-ignore
            const basePoolIdCoinAddressesDict = Object.fromEntries(basePoolIds.map((poolId) => [poolId, allPoolsData[poolId]?.underlying_coin_addresses]));
            // @ts-ignore
            const basePoolIdDecimalsDict = Object.fromEntries(basePoolIds.map((poolId) => [poolId, allPoolsData[poolId]?.underlying_decimals]));
            const basePoolIdZapDict = constants_1.FACTORY_CONSTANTS[this.chainId].basePoolIdZapDict;
            const basePoolZap = basePoolIdZapDict[basePoolIds[i]];
            FACTORY_POOLS_DATA[poolIds[i]] = {
                name: poolNames[i].split(": ")[1].trim(),
                full_name: poolNames[i],
                symbol: poolSymbols[i],
                reference_asset: referenceAssets[i],
                swap_address: swapAddresses[i],
                token_address: swapAddresses[i],
                gauge_address: gaugeAddresses[i],
                deposit_address: basePoolIdZapDict[basePoolIds[i]].address,
                implementation_address: implementations[i], // Only for testing
                is_meta: true,
                is_factory: true,
                base_pool: basePoolIds[i],
                underlying_coins: [coinAddressNameDict[coinAddresses[i][0]], ...basePoolIdCoinsDict[basePoolIds[i]]],
                wrapped_coins: coinAddresses[i].map((addr) => coinAddressNameDict[addr]),
                underlying_coin_addresses: [coinAddresses[i][0], ...basePoolIdCoinAddressesDict[basePoolIds[i]]],
                wrapped_coin_addresses: coinAddresses[i],
                underlying_decimals: [coinAddressDecimalsDict[coinAddresses[i][0]], ...basePoolIdDecimalsDict[basePoolIds[i]]],
                wrapped_decimals: coinAddresses[i].map((addr) => coinAddressDecimalsDict[addr]),
                swap_abi: swapABIs[i],
                gauge_abi: factoryGaugeABI,
                deposit_abi: basePoolZap.ABI,
            };
        }
    }
    return FACTORY_POOLS_DATA;
}
exports.getFactoryPoolData = getFactoryPoolData;
//# sourceMappingURL=factory.js.map