import { Contract as MulticallContract } from "../../../ethcall/src";
import { ICurve, IDict, IPoolData, IPoolDataFromApi, REFERENCE_ASSET } from "../interfaces";
import ERC20ABI from "../constants/abis/ERC20.json";
import { FACTORY_CONSTANTS } from "./constants";
import { _getPoolsFromApi } from "../external-api";
import { Contract } from "@ethersproject/contracts";
import { setFactoryZapContracts } from "./common";
import { CRYPTO_FACTORY_CONSTANTS } from "./constants-crypto";
import { AddressZero } from "@ethersproject/constants";
import { type JsonFragment } from "@ethersproject/abi";
const called = new Set<string>();
export const importAbi = <const Path extends string>(name: Path): () => Promise<JsonFragment[]> => () => {
    if (!called.has(name)) {
        called.add(name);
    }
    return import(name, { assert: { type: "json" } }).then(i => i.default as JsonFragment[]);
};

const factoryGaugeABI = importAbi("../constants/abis/gauge_factory.json")
const gaugeChildABI = importAbi("../constants/abis/gauge_child.json")
const cryptoFactorySwapABI = importAbi("../constants/abis/factory-crypto/factory-crypto-pool-2.json")

export const lowerCasePoolDataAddresses = (poolsData: IPoolDataFromApi[]): IPoolDataFromApi[] => {
    for (const poolData of poolsData) {
        poolData.address = poolData.address.toLowerCase();
        if (poolData.lpTokenAddress) poolData.lpTokenAddress = poolData.lpTokenAddress.toLowerCase();
        if (poolData.gaugeAddress) poolData.gaugeAddress = poolData.gaugeAddress.toLowerCase();
        poolData.implementationAddress = poolData.implementationAddress.toLowerCase();
        for (const coin of poolData.coins) {
            coin.address = coin.address.toLowerCase();
        }
        for (const reward of poolData.gaugeRewards ?? []) {
            reward.gaugeAddress = reward.gaugeAddress.toLowerCase();
            reward.tokenAddress = reward.tokenAddress.toLowerCase();
        }
    }

    return poolsData
}


const whiteList = new Set(
    [
        "0xa2b47e3d5c44877cca798226b7b8118f9bfb7a56",
        "0x52ea46506b9cc5ef470c5bf89f17dc28bb35d85c",
        "0x45f783cce6b7ff23b2ab2d70e416cdb7d6055f51",
        "0x79a8c46dea5ada233abaffd40f3a0a2b1e5a4f27",
        "0xa5407eae9ba41422680e2e00537571bcc53efbfd",
        "0x06364f10b501e868329afbc005b3492902d6c763",
        "0x93054188d876f558f4a66b2ef1d97d16edf0895b",
        "0x7fc77b5c7614e1533320ea6ddc2eb61fa00a9714",
        "0x4ca9b3063ec5866a4b82e437059d2c43d1be596f",
        "0xbebc44782c7db0a1a60cb6fe97d0b483032ff1c7",
        "0x4f062658eaaf2c1ccf8c8e36d6824cdf41167956",
        "0x3ef6a01a0f81d6046290f3e2a8c5b843e738e604",
        "0x3e01dd8a5e1fb3481f0f589056b428fc308af0fb",
        "0x0f9cb53ebe405d49a0bbdbd291a65ff571bc83e1",
        "0x8474ddbe98f5aa3179b3b3f5942d724afcdec9f6",
        "0xc18cc39da8b11da8c3541c598ee022258f9744da",
        "0xc25099792e9349c7dd09759744ea681c7de2cb66",
        "0x8038c01a0390a8c547446a0b2c18fc9aefecc10c",
        "0x7f55dde206dbad629c080068923b36fe9d6bdbef",
        "0x071c661b4deefb59e2a3ddb20db036821eee8f4b",
        "0xd81da8d904b52208541bade1bd6595d8a251f8dd",
        "0xc5424b857f758e906013f3555dad202e4bdb4567",
        "0x0ce6a5ff5217e38315f87032cf90686c96627caa",
        "0x890f4e345b1daed0367a877a1612f86a1f86985f",
        "0xdebf20617708857ebe4f679508e7b7863a8a8eee",
        "0xdc24316b9ae028f1497c275eb9192a3ea0f67022",
        "0xeb16ae0052ed37f479f7fe63849198df1765a733",
        "0xa96a65c051bf88b4095ee1f2451c2a9d43f53ae2",
        "0x42d7025938bec20b69cbae5a77421082407f053a",
        "0x2dded6da1bf5dbdf597c45fcfaa3194e53ecfeaf",
        "0xf178c0b5bb7e7abf4e12a4838c7b7c5ba2c623c0",
        "0xecd5e75afb02efa118af914515d6521aabd189f1",
        "0xd632f22692fac7611d2aa1c0d552930d43caed3b",
        "0xed279fdd11ca84beef15af5d39bb4d4bee23f0ca",
        "0x4807862aa8b2bf68830e4c8dc86d0e9a998e085a",
        "0xf9440930043eb3997fc70e1339dbb11f341de7a8",
        "0x43b4fdfd4ff969587185cdb6f0bd875c5fc83f8c",
        "0x5a6a4d54456819380173272a5e8e9b9904bdf41b",
        "0xd51a44d3fae010294c616388b506acda1bfaae46",
        "0xfd5db7463a3ab53fd211b4af195c5bccc1a03890",
        "0x9838eccc42659fa8aa7daf2ad134b53984c9427b",
        "0x98a7f18d4e56cfe84e3d081b40001b3d5bd3eb8b",
        "0x8301ae4fc9c624d1d396cbdaa1ed877821d7c511",
        "0x618788357d0ebd8a37e763adab3bc575d54c2c7d",
        "0xb576491f1e6e5e62f1d8f26062ee822b40b0e0d4",
        "0xadcfcf9894335dc340f6cd182afa45999f45fc44",
        "0x98638facf9a3865cd033f36548713183f6996122",
        "0x752ebeb79963cf0732e9c0fec72a49fd1defaeac",
        "0x1005f7406f32a61bd760cfa14accd2737913d546",
        "0x4e0915c88bc70750d68c481540f081fefaf22273",
        "0xdcef968d416a41cdac0ed8702fac8128a64241a2",
        "0xe84f5b1582ba325fdf9ce6b0c1f087ccfc924e54",
        "0xa1f8a6807c402e4a15ef4eba36528a3fed24e577",
        "0xf253f83aca21aabd2a20553ae0bf7f65c755a07f",
        "0xae34574ac03a15cd58a92dc79de7b1a0800f1ce3",
        "0xb30da2376f63de30b42dc055c93fa474f31330a5",
        "0xaeda92e6a3b1028edc139a4ae56ec881f3064d4"
    ]
)
export async function getFactoryPoolsDataFromApi(this: ICurve, isCrypto: boolean): Promise<IDict<IPoolData>> {
    const network = this.constants.NETWORK_NAME;
    const factoryType = isCrypto ? "factory-crypto" : "factory";
    let rawPoolList: IPoolDataFromApi[] = lowerCasePoolDataAddresses((await _getPoolsFromApi(network, factoryType)).poolData);
    
    if (!isCrypto) {
        rawPoolList = rawPoolList.filter((p) => p.implementationAddress in FACTORY_CONSTANTS[this.chainId].implementationABIDict);
    } else {
        rawPoolList = rawPoolList.filter(pool => whiteList.has(pool.address.toLowerCase()))
    }
    // Filter duplications
    const mainAddresses = Object.values(this.constants.POOLS_DATA).map((pool: IPoolData) => pool.swap_address);
    rawPoolList = rawPoolList.filter((p) => !mainAddresses.includes(p.address));

    await setFactorySwapContracts.call(this, rawPoolList, isCrypto);
    if (isCrypto) setCryptoFactoryTokenContracts.call(this, rawPoolList);
    await setFactoryGaugeContracts.call(this, rawPoolList);
    setFactoryCoinsContracts.call(this, rawPoolList);
    await setFactoryZapContracts.call(this, isCrypto);

    const FACTORY_POOLS_DATA: IDict<IPoolData> = {};
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
            const lpTokenBasePoolIdDict = CRYPTO_FACTORY_CONSTANTS[this.chainId].lpTokenBasePoolIdDict;
            const basePoolIdZapDict = CRYPTO_FACTORY_CONSTANTS[this.chainId].basePoolIdZapDict;
            const basePoolId = lpTokenBasePoolIdDict[coinAddresses[1]];

            if (basePoolId) {  // isMeta
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
                    token_address: pool.lpTokenAddress as string,
                    gauge_address: pool.gaugeAddress ? pool.gaugeAddress : AddressZero,
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
                    gauge_abi: this.chainId === 1 ? factoryGaugeABI : gaugeChildABI,
                    deposit_abi: basePoolZap.ABI,
                    in_api: true,
                };
            } else {
                FACTORY_POOLS_DATA[pool.id] = {
                    name: pool.name.split(": ")[1].trim(),
                    full_name: pool.name,
                    symbol: pool.symbol,
                    reference_asset: "CRYPTO",
                    swap_address: pool.address,
                    token_address: pool.lpTokenAddress as string,
                    gauge_address: pool.gaugeAddress ? pool.gaugeAddress : AddressZero,
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
                    gauge_abi: this.chainId === 1 ? factoryGaugeABI : gaugeChildABI,
                    in_api: true,
                };
            }
        } else if (pool.implementation.includes("meta")) {
            const implementationABIDict = FACTORY_CONSTANTS[this.chainId].implementationABIDict;
            const implementationBasePoolIdDict = FACTORY_CONSTANTS[this.chainId].implementationBasePoolIdDict;
            const basePoolIds = Object.values(implementationBasePoolIdDict).filter((poolId, i, arr) => arr.indexOf(poolId) === i);
            const allPoolsData = { ...this.constants.POOLS_DATA, ...FACTORY_POOLS_DATA };
            // @ts-ignore
            const basePoolIdCoinsDict = Object.fromEntries(basePoolIds.map(
                (poolId) => [poolId, allPoolsData[poolId]?.underlying_coins]));
            // @ts-ignore
            const basePoolIdCoinAddressesDict = Object.fromEntries(basePoolIds.map(
                (poolId) => [poolId, allPoolsData[poolId]?.underlying_coin_addresses]));
            // @ts-ignore
            const basePoolIdDecimalsDict = Object.fromEntries(basePoolIds.map(
                (poolId) => [poolId, allPoolsData[poolId]?.underlying_decimals]));
            const basePoolIdZapDict = FACTORY_CONSTANTS[this.chainId].basePoolIdZapDict;

            const basePoolId = implementationBasePoolIdDict[pool.implementationAddress];
            const basePoolCoinNames = basePoolIdCoinsDict[basePoolId];
            const basePoolCoinAddresses = basePoolIdCoinAddressesDict[basePoolId];
            const basePoolDecimals = basePoolIdDecimalsDict[basePoolId];
            const basePoolZap = basePoolIdZapDict[basePoolId];

            FACTORY_POOLS_DATA[pool.id] = {
                name: pool.name.split(": ")[1].trim(),
                full_name: pool.name,
                symbol: pool.symbol,
                reference_asset: pool.assetTypeName.toUpperCase() as REFERENCE_ASSET,
                swap_address: pool.address,
                token_address: pool.address,
                gauge_address: pool.gaugeAddress ? pool.gaugeAddress : AddressZero,
                deposit_address: basePoolZap.address,
                implementation_address: pool.implementationAddress, // Only for testing
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
                gauge_abi: this.chainId === 1 ? factoryGaugeABI : gaugeChildABI,
                deposit_abi: basePoolZap.ABI,
                in_api: true,
            };
        } else {
            const implementationABIDict = FACTORY_CONSTANTS[this.chainId].implementationABIDict;

            FACTORY_POOLS_DATA[pool.id] = {
                name: pool.name.split(": ")[1].trim(),
                full_name: pool.name,
                symbol: pool.symbol,
                reference_asset: pool.assetTypeName.toUpperCase() as REFERENCE_ASSET,
                swap_address: pool.address,
                token_address: pool.address,
                gauge_address: pool.gaugeAddress ? pool.gaugeAddress : AddressZero,
                implementation_address: pool.implementationAddress, // Only for testing
                is_plain: true,
                is_factory: true,
                underlying_coins: coinNames,
                wrapped_coins: coinNames,
                underlying_coin_addresses: coinAddresses,
                wrapped_coin_addresses: coinAddresses,
                underlying_decimals: coinDecimals,
                wrapped_decimals: coinDecimals,
                swap_abi: implementationABIDict[pool.implementationAddress],
                gauge_abi: this.chainId === 1 ? factoryGaugeABI : gaugeChildABI,
                in_api: true,
            };
        }
    })

    return FACTORY_POOLS_DATA
}

async function setFactorySwapContracts(this: ICurve, rawPoolList: IPoolDataFromApi[], isCrypto: boolean) {
    if (isCrypto) {
        await Promise.all(rawPoolList.map(async (pool) => {
            const addr = pool.address;

            this.contracts[addr] = {
                contract: new Contract(addr, await cryptoFactorySwapABI(), this.provider),
                multicallContract: new MulticallContract(addr, await cryptoFactorySwapABI()),
            }
        }))
    } else {
        const implementationABIDict = FACTORY_CONSTANTS[this.chainId].implementationABIDict;
        await Promise.all(rawPoolList.map(async (pool) => {
            const addr = pool.address;
            this.contracts[addr] = {
                contract: new Contract(addr, await implementationABIDict[pool.implementationAddress](), this.provider),
                multicallContract: new MulticallContract(addr, await implementationABIDict[pool.implementationAddress]()),
            }
        }))
    }
}

function setCryptoFactoryTokenContracts(this: ICurve, rawPoolList: IPoolDataFromApi[]): void {
    rawPoolList.forEach((pool) => {
        const addr = pool.lpTokenAddress as string;
        this.contracts[addr] = {
            contract: new Contract(addr, ERC20ABI, this.provider),
            multicallContract: new MulticallContract(addr, ERC20ABI),
        }
    });
}

async function setFactoryGaugeContracts(this: ICurve, rawPoolList: IPoolDataFromApi[]) {
    await Promise.all(rawPoolList.map(async (pool) => {
        if (pool.gaugeAddress) {
            const addr = pool.gaugeAddress;
            this.contracts[addr] = {
                contract: new Contract(addr, await factoryGaugeABI(), this.provider),
                multicallContract: new MulticallContract(addr, await factoryGaugeABI()),
            }
        }
    }))
}

function setFactoryCoinsContracts(this: ICurve, rawPoolList: IPoolDataFromApi[]): void {
    for (const pool of rawPoolList) {
        for (const coin of pool.coins) {
            const addr = coin.address;
            if (addr in this.contracts) continue;

            this.contracts[addr] = {
                contract: new Contract(addr, ERC20ABI, this.provider),
                multicallContract: new MulticallContract(addr, ERC20ABI),
            }
        }
    }
}