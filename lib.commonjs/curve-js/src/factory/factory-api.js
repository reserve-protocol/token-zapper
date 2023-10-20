"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFactoryPoolsDataFromApi = exports.lowerCasePoolDataAddresses = void 0;
const constants_1 = require("@ethersproject/constants");
const contracts_1 = require("@ethersproject/contracts");
const src_1 = require("../../../ethcall/src");
const ERC20_json_1 = __importDefault(require("../constants/abis/ERC20.json"));
const external_api_1 = require("../external-api");
const common_1 = require("./common");
const constants_2 = require("./constants");
const constants_crypto_1 = require("./constants-crypto");
const factoryGaugeABI = () => Promise.resolve().then(() => __importStar(require("../constants/abis/gauge_factory.json"))).then(i => i.default);
// const gaugeChildABI = () => import("./constants/abis/gauge_child.json").then(i => i.default)
const cryptoFactorySwapABI = () => Promise.resolve().then(() => __importStar(require("../constants/abis/factory-crypto/factory-crypto-pool-2.json"))).then(i => i.default);
const lowerCasePoolDataAddresses = (poolsData) => {
    for (const poolData of poolsData) {
        poolData.address = poolData.address.toLowerCase();
        if (poolData.lpTokenAddress)
            poolData.lpTokenAddress = poolData.lpTokenAddress.toLowerCase();
        if (poolData.gaugeAddress)
            poolData.gaugeAddress = poolData.gaugeAddress.toLowerCase();
        poolData.implementationAddress = poolData.implementationAddress.toLowerCase();
        for (const coin of poolData.coins) {
            coin.address = coin.address.toLowerCase();
        }
        for (const reward of poolData.gaugeRewards ?? []) {
            reward.gaugeAddress = reward.gaugeAddress.toLowerCase();
            reward.tokenAddress = reward.tokenAddress.toLowerCase();
        }
    }
    return poolsData;
};
exports.lowerCasePoolDataAddresses = lowerCasePoolDataAddresses;
async function getFactoryPoolsDataFromApi(isCrypto) {
    const network = this.constants.NETWORK_NAME;
    const factoryType = isCrypto ? "factory-crypto" : "factory";
    let rawPoolList = (0, exports.lowerCasePoolDataAddresses)((await (0, external_api_1._getPoolsFromApi)(network, factoryType)).poolData);
    if (!isCrypto) {
        rawPoolList = rawPoolList.filter((p) => p.implementationAddress in constants_2.FACTORY_CONSTANTS[this.chainId].implementationABIDict);
    }
    rawPoolList = rawPoolList.filter(pool => this.whitelist.has(pool.address.toLowerCase()));
    // Filter duplications
    const mainAddresses = Object.values(this.constants.POOLS_DATA).map((pool) => pool.swap_address);
    rawPoolList = rawPoolList.filter((p) => !mainAddresses.includes(p.address));
    await setFactorySwapContracts.call(this, rawPoolList, isCrypto);
    if (isCrypto)
        setCryptoFactoryTokenContracts.call(this, rawPoolList);
    await setFactoryGaugeContracts.call(this, rawPoolList);
    setFactoryCoinsContracts.call(this, rawPoolList);
    await common_1.setFactoryZapContracts.call(this, isCrypto);
    const FACTORY_POOLS_DATA = {};
    rawPoolList.forEach((pool) => {
        const nativeToken = this.constants.NATIVE_TOKEN;
        let coinAddresses = pool.coins.map((c) => c.address);
        const coinNames = pool.coins.map((c) => c.symbol);
        const coinDecimals = pool.coins.map((c) => Number(c.decimals));
        if (isCrypto) {
            const wrappedCoinNames = pool.coins.map((c) => c.symbol === nativeToken.symbol ? nativeToken.wrappedSymbol : c.symbol);
            const underlyingCoinNames = pool.coins.map((c) => c.symbol === nativeToken.wrappedSymbol ? nativeToken.symbol : c.symbol);
            const underlyingCoinAddresses = coinAddresses.map((addr) => addr === nativeToken.wrappedAddress ? nativeToken.address : addr);
            const isPlain = !coinAddresses.includes(nativeToken.wrappedAddress);
            const lpTokenBasePoolIdDict = constants_crypto_1.CRYPTO_FACTORY_CONSTANTS[this.chainId].lpTokenBasePoolIdDict;
            const basePoolIdZapDict = constants_crypto_1.CRYPTO_FACTORY_CONSTANTS[this.chainId].basePoolIdZapDict;
            const basePoolId = lpTokenBasePoolIdDict[coinAddresses[1]];
            if (basePoolId) { // isMeta
                const allPoolsData = { ...this.constants.POOLS_DATA, ...FACTORY_POOLS_DATA };
                const basePoolCoinNames = [...allPoolsData[basePoolId].underlying_coins];
                const basePoolCoinAddresses = [...allPoolsData[basePoolId].underlying_coin_addresses];
                const basePoolDecimals = [...allPoolsData[basePoolId].underlying_decimals];
                const basePoolZap = basePoolIdZapDict[basePoolId];
                FACTORY_POOLS_DATA[pool.id] = {
                    name: pool.name.split(": ")[1].trim(),
                    full_name: pool.name,
                    symbol: pool.symbol,
                    reference_asset: "CRYPTO",
                    swap_address: pool.address,
                    token_address: pool.lpTokenAddress,
                    gauge_address: pool.gaugeAddress ? pool.gaugeAddress : constants_1.AddressZero,
                    deposit_address: basePoolZap.address,
                    is_meta: true,
                    is_crypto: true,
                    is_factory: true,
                    base_pool: basePoolId,
                    underlying_coins: [underlyingCoinNames[0], ...basePoolCoinNames],
                    wrapped_coins: wrappedCoinNames,
                    underlying_coin_addresses: [underlyingCoinAddresses[0], ...basePoolCoinAddresses],
                    wrapped_coin_addresses: coinAddresses,
                    underlying_decimals: [coinDecimals[0], ...basePoolDecimals],
                    wrapped_decimals: coinDecimals,
                    swap_abi: cryptoFactorySwapABI,
                    gauge_abi: factoryGaugeABI,
                    deposit_abi: basePoolZap.ABI,
                    in_api: true,
                };
            }
            else {
                FACTORY_POOLS_DATA[pool.id] = {
                    name: pool.name.split(": ")[1].trim(),
                    full_name: pool.name,
                    symbol: pool.symbol,
                    reference_asset: "CRYPTO",
                    swap_address: pool.address,
                    token_address: pool.lpTokenAddress,
                    gauge_address: pool.gaugeAddress ? pool.gaugeAddress : constants_1.AddressZero,
                    is_crypto: true,
                    is_plain: isPlain,
                    is_factory: true,
                    underlying_coins: underlyingCoinNames,
                    wrapped_coins: wrappedCoinNames,
                    underlying_coin_addresses: underlyingCoinAddresses,
                    wrapped_coin_addresses: coinAddresses,
                    underlying_decimals: coinDecimals,
                    wrapped_decimals: coinDecimals,
                    swap_abi: cryptoFactorySwapABI,
                    gauge_abi: factoryGaugeABI,
                    in_api: true,
                };
            }
        }
        else if (pool.implementation.includes("meta")) {
            const implementationABIDict = constants_2.FACTORY_CONSTANTS[this.chainId].implementationABIDict;
            const implementationBasePoolIdDict = constants_2.FACTORY_CONSTANTS[this.chainId].implementationBasePoolIdDict;
            const basePoolIds = Object.values(implementationBasePoolIdDict).filter((poolId, i, arr) => arr.indexOf(poolId) === i);
            const allPoolsData = { ...this.constants.POOLS_DATA, ...FACTORY_POOLS_DATA };
            // @ts-ignore
            const basePoolIdCoinsDict = Object.fromEntries(basePoolIds.map((poolId) => [poolId, allPoolsData[poolId]?.underlying_coins]));
            // @ts-ignore
            const basePoolIdCoinAddressesDict = Object.fromEntries(basePoolIds.map((poolId) => [poolId, allPoolsData[poolId]?.underlying_coin_addresses]));
            // @ts-ignore
            const basePoolIdDecimalsDict = Object.fromEntries(basePoolIds.map((poolId) => [poolId, allPoolsData[poolId]?.underlying_decimals]));
            const basePoolIdZapDict = constants_2.FACTORY_CONSTANTS[this.chainId].basePoolIdZapDict;
            const basePoolId = implementationBasePoolIdDict[pool.implementationAddress];
            const basePoolCoinNames = basePoolIdCoinsDict[basePoolId];
            const basePoolCoinAddresses = basePoolIdCoinAddressesDict[basePoolId];
            const basePoolDecimals = basePoolIdDecimalsDict[basePoolId];
            const basePoolZap = basePoolIdZapDict[basePoolId];
            FACTORY_POOLS_DATA[pool.id] = {
                name: pool.name.split(": ")[1].trim(),
                full_name: pool.name,
                symbol: pool.symbol,
                reference_asset: pool.assetTypeName.toUpperCase(),
                swap_address: pool.address,
                token_address: pool.address,
                gauge_address: pool.gaugeAddress ? pool.gaugeAddress : constants_1.AddressZero,
                deposit_address: basePoolZap.address,
                implementation_address: pool.implementationAddress,
                is_meta: true,
                is_factory: true,
                base_pool: basePoolId,
                underlying_coins: [coinNames[0], ...basePoolCoinNames],
                wrapped_coins: coinNames,
                underlying_coin_addresses: [coinAddresses[0], ...basePoolCoinAddresses],
                wrapped_coin_addresses: coinAddresses,
                underlying_decimals: [coinDecimals[0], ...basePoolDecimals],
                wrapped_decimals: coinDecimals,
                swap_abi: implementationABIDict[pool.implementationAddress],
                gauge_abi: factoryGaugeABI,
                deposit_abi: basePoolZap.ABI,
                in_api: true,
            };
        }
        else {
            const implementationABIDict = constants_2.FACTORY_CONSTANTS[this.chainId].implementationABIDict;
            FACTORY_POOLS_DATA[pool.id] = {
                name: pool.name.split(": ")[1].trim(),
                full_name: pool.name,
                symbol: pool.symbol,
                reference_asset: pool.assetTypeName.toUpperCase(),
                swap_address: pool.address,
                token_address: pool.address,
                gauge_address: pool.gaugeAddress ? pool.gaugeAddress : constants_1.AddressZero,
                implementation_address: pool.implementationAddress,
                is_plain: true,
                is_factory: true,
                underlying_coins: coinNames,
                wrapped_coins: coinNames,
                underlying_coin_addresses: coinAddresses,
                wrapped_coin_addresses: coinAddresses,
                underlying_decimals: coinDecimals,
                wrapped_decimals: coinDecimals,
                swap_abi: implementationABIDict[pool.implementationAddress],
                gauge_abi: factoryGaugeABI,
                in_api: true,
            };
        }
    });
    return FACTORY_POOLS_DATA;
}
exports.getFactoryPoolsDataFromApi = getFactoryPoolsDataFromApi;
async function setFactorySwapContracts(rawPoolList, isCrypto) {
    if (isCrypto) {
        await Promise.all(rawPoolList.map(async (pool) => {
            const addr = pool.address;
            this.contracts[addr] = {
                contract: new contracts_1.Contract(addr, await cryptoFactorySwapABI(), this.provider),
                multicallContract: new src_1.Contract(addr, await cryptoFactorySwapABI()),
            };
        }));
    }
    else {
        const implementationABIDict = constants_2.FACTORY_CONSTANTS[this.chainId].implementationABIDict;
        await Promise.all(rawPoolList.map(async (pool) => {
            const addr = pool.address;
            this.contracts[addr] = {
                contract: new contracts_1.Contract(addr, await implementationABIDict[pool.implementationAddress](), this.provider),
                multicallContract: new src_1.Contract(addr, await implementationABIDict[pool.implementationAddress]()),
            };
        }));
    }
}
function setCryptoFactoryTokenContracts(rawPoolList) {
    rawPoolList.forEach((pool) => {
        const addr = pool.lpTokenAddress;
        this.contracts[addr] = {
            contract: new contracts_1.Contract(addr, ERC20_json_1.default, this.provider),
            multicallContract: new src_1.Contract(addr, ERC20_json_1.default),
        };
    });
}
async function setFactoryGaugeContracts(rawPoolList) {
    await Promise.all(rawPoolList.map(async (pool) => {
        if (pool.gaugeAddress) {
            const addr = pool.gaugeAddress;
            this.contracts[addr] = {
                contract: new contracts_1.Contract(addr, await factoryGaugeABI(), this.provider),
                multicallContract: new src_1.Contract(addr, await factoryGaugeABI()),
            };
        }
    }));
}
function setFactoryCoinsContracts(rawPoolList) {
    for (const pool of rawPoolList) {
        for (const coin of pool.coins) {
            const addr = coin.address;
            if (addr in this.contracts)
                continue;
            this.contracts[addr] = {
                contract: new contracts_1.Contract(addr, ERC20_json_1.default, this.provider),
                multicallContract: new src_1.Contract(addr, ERC20_json_1.default),
            };
        }
    }
}
//# sourceMappingURL=factory-api.js.map