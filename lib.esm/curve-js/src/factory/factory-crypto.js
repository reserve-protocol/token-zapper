import ERC20ABI from "../constants/abis/ERC20.json";
import { setFactoryZapContracts } from "./common";
import { CRYPTO_FACTORY_CONSTANTS } from "./constants-crypto";
import { formatUnits } from "@ethersproject/units";
import { AddressZero } from "@ethersproject/constants";
const factoryGaugeABI = () => import("../constants/abis/gauge_factory.json", { assert: { type: "json" } }).then(i => i.default);
// const gaugeChildABI = () => import("./constants/abis/gauge_child.json").then(i => i.default)
const cryptoFactorySwapABI = () => import("../constants/abis/factory-crypto/factory-crypto-pool-2.json", { assert: { type: "json" } }).then(i => i.default);
const deepFlatten = (arr) => [].concat(...arr.map((v) => (Array.isArray(v) ? deepFlatten(v) : v)));
async function getRecentlyCreatedCryptoPoolId(swapAddress) {
    const factoryContract = this.contracts[this.constants.ALIASES.crypto_factory].contract;
    const poolCount = Number(formatUnits(await factoryContract.pool_count(this.constantOptions), 0));
    for (let i = 1; i <= poolCount; i++) {
        const address = await factoryContract.pool_list(poolCount - i);
        if (address.toLowerCase() === swapAddress.toLowerCase())
            return `factory-crypto-${poolCount - i}`;
    }
    throw Error("Unknown pool");
}
async function getCryptoFactoryIdsAndSwapAddresses(fromIdx = 0) {
    const factoryContract = this.contracts[this.constants.ALIASES.crypto_factory].contract;
    const factoryMulticallContract = this.contracts[this.constants.ALIASES.crypto_factory].multicallContract;
    const poolCount = Number(formatUnits(await factoryContract.pool_count(this.constantOptions), 0));
    const calls = [];
    for (let i = fromIdx; i < poolCount; i++) {
        calls.push(factoryMulticallContract.pool_list(i));
    }
    if (calls.length === 0)
        return [[], []];
    let factories = (await this.multicallProvider.all(calls)).map((addr, i) => ({ id: `factory-crypto-${fromIdx + i}`, address: addr.toLowerCase() }));
    const swapAddresses = Object.values(this.constants.POOLS_DATA).map((pool) => pool.swap_address.toLowerCase());
    factories = factories.filter((f) => !swapAddresses.includes(f.address));
    return [factories.map((f) => f.id), factories.map((f) => f.address)];
}
function _handleCoinAddresses(coinAddresses) {
    return coinAddresses.map((addresses) => addresses.map((addr) => addr.toLowerCase()));
}
async function getPoolsData(factorySwapAddresses) {
    const factoryMulticallContract = this.contracts[this.constants.ALIASES.crypto_factory].multicallContract;
    const calls = [];
    for (const addr of factorySwapAddresses) {
        calls.push(factoryMulticallContract.get_token(addr));
        calls.push(factoryMulticallContract.get_gauge(addr));
        calls.push(factoryMulticallContract.get_coins(addr));
    }
    const res = await this.multicallProvider.all(calls);
    const tokenAddresses = res.filter((a, i) => i % 3 == 0).map((a) => a.toLowerCase());
    const gaugeAddresses = res.filter((a, i) => i % 3 == 1).map((a) => a.toLowerCase());
    const coinAddresses = _handleCoinAddresses.call(this, res.filter((a, i) => i % 3 == 2));
    return [tokenAddresses, gaugeAddresses, coinAddresses];
}
function setCryptoFactorySwapContracts(factorySwapAddresses) {
    factorySwapAddresses.forEach((addr) => {
        this.setContract(addr, cryptoFactorySwapABI());
    });
}
function setCryptoFactoryTokenContracts(factoryTokenAddresses) {
    factoryTokenAddresses.forEach((addr) => {
        this.setContract(addr, ERC20ABI);
    });
}
function setCryptoFactoryGaugeContracts(factoryGaugeAddresses) {
    factoryGaugeAddresses.filter((addr) => addr !== AddressZero).forEach((addr, i) => {
        this.setContract(addr, factoryGaugeABI());
    });
}
function setCryptoFactoryCoinsContracts(coinAddresses) {
    const flattenedCoinAddresses = Array.from(new Set(deepFlatten(coinAddresses)));
    for (const addr of flattenedCoinAddresses) {
        if (addr in this.contracts)
            continue;
        this.setContract(addr, ERC20ABI);
    }
}
function getCryptoFactoryUnderlyingCoinAddresses(coinAddresses) {
    return coinAddresses.map((coins) => coins.map((c) => c === this.constants.NATIVE_TOKEN.wrappedAddress ? this.constants.NATIVE_TOKEN.address : c));
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
async function getCoinsData(tokenAddresses, coinAddresses, existingCoinAddrNameDict, existingCoinAddrDecimalsDict) {
    const flattenedCoinAddresses = Array.from(new Set(deepFlatten(coinAddresses)));
    const newCoinAddresses = [];
    const coinAddrNamesDict = {};
    const coinAddrDecimalsDict = {};
    for (const addr of flattenedCoinAddresses) {
        if (addr in existingCoinAddrNameDict) {
            coinAddrNamesDict[addr] = existingCoinAddrNameDict[addr];
            coinAddrDecimalsDict[addr] = existingCoinAddrDecimalsDict[addr];
        }
        else if (addr === "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2") {
            coinAddrNamesDict[addr] = "MKR";
        }
        else {
            newCoinAddresses.push(addr);
        }
    }
    const calls = [];
    for (const addr of tokenAddresses) {
        calls.push(this.contracts[addr].multicallContract.symbol());
        calls.push(this.contracts[addr].multicallContract.name());
    }
    for (const addr of newCoinAddresses) {
        calls.push(this.contracts[addr].multicallContract.symbol());
        calls.push(this.contracts[addr].multicallContract.decimals());
    }
    const res = await this.multicallProvider.all(calls);
    const res1 = res.slice(0, tokenAddresses.length * 2);
    const tokenSymbols = res1.filter((a, i) => i % 2 == 0);
    const tokenNames = res1.filter((a, i) => i % 2 == 1);
    const res2 = res.slice(tokenAddresses.length * 2);
    const symbols = res2.filter((a, i) => i % 2 == 0);
    const decimals = res2.filter((a, i) => i % 2 == 1).map((_d) => Number(formatUnits(_d, 0)));
    newCoinAddresses.forEach((addr, i) => {
        coinAddrNamesDict[addr] = symbols[i];
        coinAddrDecimalsDict[addr] = decimals[i];
    });
    coinAddrNamesDict[this.constants.NATIVE_TOKEN.address] = this.constants.NATIVE_TOKEN.symbol;
    return [tokenSymbols, tokenNames, coinAddrNamesDict, coinAddrDecimalsDict];
}
export async function getCryptoFactoryPoolData(fromIdx = 0, swapAddress) {
    const [poolIds, swapAddresses] = swapAddress ?
        [[await getRecentlyCreatedCryptoPoolId.call(this, swapAddress)], [swapAddress.toLowerCase()]]
        : await getCryptoFactoryIdsAndSwapAddresses.call(this, fromIdx);
    if (poolIds.length === 0)
        return {};
    const [tokenAddresses, gaugeAddresses, coinAddresses] = await getPoolsData.call(this, swapAddresses);
    setCryptoFactorySwapContracts.call(this, swapAddresses);
    setCryptoFactoryTokenContracts.call(this, tokenAddresses);
    setCryptoFactoryGaugeContracts.call(this, gaugeAddresses);
    setCryptoFactoryCoinsContracts.call(this, coinAddresses);
    setFactoryZapContracts.call(this, true);
    const underlyingCoinAddresses = getCryptoFactoryUnderlyingCoinAddresses.call(this, coinAddresses);
    const existingCoinAddressNameDict = getExistingCoinAddressNameDict.call(this);
    const [poolSymbols, poolNames, coinAddressNameDict, coinAddressDecimalsDict] = await getCoinsData.call(this, tokenAddresses, coinAddresses, existingCoinAddressNameDict, this.constants.DECIMALS);
    const CRYPTO_FACTORY_POOLS_DATA = {};
    for (let i = 0; i < poolIds.length; i++) {
        const lpTokenBasePoolIdDict = CRYPTO_FACTORY_CONSTANTS[this.chainId].lpTokenBasePoolIdDict;
        const basePoolIdZapDict = CRYPTO_FACTORY_CONSTANTS[this.chainId].basePoolIdZapDict;
        const basePoolId = lpTokenBasePoolIdDict[coinAddresses[i][1].toLowerCase()];
        if (basePoolId) { // isMeta
            const allPoolsData = { ...this.constants.POOLS_DATA, ...CRYPTO_FACTORY_POOLS_DATA };
            const basePoolCoinNames = [...allPoolsData[basePoolId].underlying_coins];
            const basePoolCoinAddresses = [...allPoolsData[basePoolId].underlying_coin_addresses];
            const basePoolDecimals = [...allPoolsData[basePoolId].underlying_decimals];
            const basePoolZap = basePoolIdZapDict[basePoolId];
            CRYPTO_FACTORY_POOLS_DATA[poolIds[i]] = {
                name: poolNames[i].split(": ")[1].trim(),
                full_name: poolNames[i],
                symbol: poolSymbols[i],
                reference_asset: "CRYPTO",
                swap_address: swapAddresses[i],
                token_address: tokenAddresses[i],
                gauge_address: gaugeAddresses[i],
                deposit_address: basePoolZap.address,
                is_meta: true,
                is_crypto: true,
                is_factory: true,
                base_pool: basePoolId,
                underlying_coins: [coinAddressNameDict[underlyingCoinAddresses[i][0]], ...basePoolCoinNames],
                wrapped_coins: coinAddresses[i].map((addr) => coinAddressNameDict[addr]),
                underlying_coin_addresses: [underlyingCoinAddresses[i][0], ...basePoolCoinAddresses],
                wrapped_coin_addresses: coinAddresses[i],
                underlying_decimals: [coinAddressDecimalsDict[underlyingCoinAddresses[i][0]], ...basePoolDecimals],
                wrapped_decimals: coinAddresses[i].map((addr) => coinAddressDecimalsDict[addr]),
                swap_abi: cryptoFactorySwapABI,
                gauge_abi: factoryGaugeABI,
                deposit_abi: basePoolZap.ABI,
            };
        }
        else {
            CRYPTO_FACTORY_POOLS_DATA[poolIds[i]] = {
                name: poolNames[i].split(": ")[1].trim(),
                full_name: poolNames[i],
                symbol: poolSymbols[i],
                reference_asset: "CRYPTO",
                swap_address: swapAddresses[i],
                token_address: tokenAddresses[i],
                gauge_address: gaugeAddresses[i],
                is_crypto: true,
                is_plain: underlyingCoinAddresses[i].toString() === coinAddresses[i].toString(), // WETH/ETH - NOT Plain
                is_factory: true,
                underlying_coins: underlyingCoinAddresses[i].map((addr) => coinAddressNameDict[addr]),
                wrapped_coins: coinAddresses[i].map((addr) => coinAddressNameDict[addr]),
                underlying_coin_addresses: underlyingCoinAddresses[i],
                wrapped_coin_addresses: coinAddresses[i],
                underlying_decimals: underlyingCoinAddresses[i].map((addr) => coinAddressDecimalsDict[addr]),
                wrapped_decimals: coinAddresses[i].map((addr) => coinAddressDecimalsDict[addr]),
                swap_abi: cryptoFactorySwapABI,
                gauge_abi: factoryGaugeABI,
            };
        }
    }
    return CRYPTO_FACTORY_POOLS_DATA;
}
//# sourceMappingURL=factory-crypto.js.map