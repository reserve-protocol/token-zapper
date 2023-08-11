import { IDict } from "../interfaces";
import { lowerCaseKeys } from "../constants/utils";
import { JsonFragment } from "@ethersproject/abi";

const factorySwapABI = async () => (await import("../constants/abis/factoryPools/swap.json", { assert: { type: "json" } })).default as JsonFragment[]
const MetaUSDABI = async () => (await import("../constants/abis/factory-v2/MetaUSD.json", { assert: { type: "json" } })).default as JsonFragment[]
const MetaUSDBalancesABI = async () => (await import("../constants/abis/factory-v2/MetaUSDBalances.json", { assert: { type: "json" } })).default as JsonFragment[]
const MetaFraxUSDABI = async () => (await import("../constants/abis/factory-v2/MetaFraxUSD.json", { assert: { type: "json" } })).default as JsonFragment[]
const MetaFraxUSDBalancesABI = async () => (await import("../constants/abis/factory-v2/MetaFraxUSDBalances.json", { assert: { type: "json" } })).default as JsonFragment[]
const MetaBTCABI = async () => (await import("../constants/abis/factory-v2/MetaBTC.json", { assert: { type: "json" } })).default as JsonFragment[]
const MetaBTCBalancesABI = async () => (await import("../constants/abis/factory-v2/MetaBTCBalances.json", { assert: { type: "json" } })).default as JsonFragment[]
const MetaBTCRenABI = async () => (await import("../constants/abis/factory-v2/MetaBTCRen.json", { assert: { type: "json" } })).default as JsonFragment[]
const MetaBTCRenBalancesABI = async () => (await import("../constants/abis/factory-v2/MetaBTCBalancesRen.json", { assert: { type: "json" } })).default as JsonFragment[]
const MetaSbtc2ABI = async () => (await import("../constants/abis/factory-v2/MetaSbtc2.json", { assert: { type: "json" } })).default as JsonFragment[]
const MetaSbtc2BalancesABI = async () => (await import("../constants/abis/factory-v2/MetaSbtc2Balance.json", { assert: { type: "json" } })).default as JsonFragment[]
const Plain2BasicABI = async () => (await import("../constants/abis/factory-v2/Plain2Basic.json", { assert: { type: "json" } })).default as JsonFragment[]
const Plain2BalancesABI = async () => (await import("../constants/abis/factory-v2/Plain2Balances.json", { assert: { type: "json" } })).default as JsonFragment[]
const Plain2ETHABI = async () => (await import("../constants/abis/factory-v2/Plain2ETH.json", { assert: { type: "json" } })).default as JsonFragment[]
const Plain2OptimizedABI = async () => (await import("../constants/abis/factory-v2/Plain2Optimized.json", { assert: { type: "json" } })).default as JsonFragment[]
const Plain3BasicABI = async () => (await import("../constants/abis/factory-v2/Plain3Basic.json", { assert: { type: "json" } })).default as JsonFragment[]
const Plain3BalancesABI = async () => (await import("../constants/abis/factory-v2/Plain3Balances.json", { assert: { type: "json" } })).default as JsonFragment[]
const Plain3ETHABI = async () => (await import("../constants/abis/factory-v2/Plain3ETH.json", { assert: { type: "json" } })).default as JsonFragment[]
const Plain3OptimizedABI = async () => (await import("../constants/abis/factory-v2/Plain3Optimized.json", { assert: { type: "json" } })).default as JsonFragment[]
const Plain4BasicABI = async () => (await import("../constants/abis/factory-v2/Plain4Basic.json", { assert: { type: "json" } })).default as JsonFragment[]
const Plain4BalancesABI = async () => (await import("../constants/abis/factory-v2/Plain4Balances.json", { assert: { type: "json" } })).default as JsonFragment[]
const Plain4ETHABI = async () => (await import("../constants/abis/factory-v2/Plain4ETH.json", { assert: { type: "json" } })).default as JsonFragment[]
const Plain4OptimizedABI = async () => (await import("../constants/abis/factory-v2/Plain4Optimized.json", { assert: { type: "json" } })).default as JsonFragment[]
// --- ZAPS --
const factoryDepositABI = async () => (await import("../constants/abis/factoryPools/deposit.json", { assert: { type: "json" } })).default as JsonFragment[]
const fraxusdcMetaZapABI = async () => (await import("../constants/abis/fraxusdc/meta_zap.json", { assert: { type: "json" } })).default as JsonFragment[]
const RenMetaZapABI = async () => (await import("../constants/abis/ren/meta_zap.json", { assert: { type: "json" } })).default as JsonFragment[]
const Sbtc2MetaZapABI = async () => (await import("../constants/abis/sbtc2/meta_zap.json", { assert: { type: "json" } })).default as JsonFragment[]


export const implementationABIDictEthereum: IDict<() => Promise<JsonFragment[]>> = lowerCaseKeys({
    "0x5F890841f657d90E081bAbdB532A05996Af79Fe6": factorySwapABI,

    "0x213be373FDff327658139C7df330817DAD2d5bBE": MetaUSDABI,
    "0x55Aa9BF126bCABF0bDC17Fa9E39Ec9239e1ce7A9": MetaUSDBalancesABI,

    "0x33bB0e62d5e8C688E645Dd46DFb48Cd613250067": MetaFraxUSDABI,  // fraxusdc
    "0x2EB24483Ef551dA247ab87Cf18e1Cc980073032D": MetaFraxUSDBalancesABI,  // fraxusdc

    "0xF9B62b61d108232Ef0C9DD143bb3c22c7D4A715a": MetaFraxUSDABI,  // fraxusdp
    "0xB172AC2Fe440B5dA74Dc460e5E9d96bc2BF6261F": MetaFraxUSDBalancesABI,  // fraxusdp

    "0xC6A8466d128Fbfd34AdA64a9FFFce325D57C9a52": MetaBTCABI,
    "0xc4C78b08fA0c3d0a312605634461A88184Ecd630": MetaBTCBalancesABI,

    "0xECAaecd9d2193900b424774133B1f51ae0F29d9E": MetaBTCRenABI,
    "0x40fD58D44cFE63E8517c9Bb3ac98676838Ea56A8": MetaBTCRenBalancesABI,

    "0x008CFa89df5B0c780cA3462fc2602D7F8c7Ac315": MetaSbtc2ABI,
    "0xAbc533EbCDdeD41215C46ee078C5818B5b0A252F": MetaSbtc2BalancesABI,

    "0x6523Ac15EC152Cb70a334230F6c5d62C5Bd963f1": Plain2BasicABI,
    "0x24D937143d3F5cF04c72bA112735151A8CAE2262": Plain2BalancesABI,
    "0x6326DEbBAa15bCFE603d831e7D75f4fc10d9B43E": Plain2ETHABI,
    "0x4A4d7868390EF5CaC51cDA262888f34bD3025C3F": Plain2OptimizedABI,
    "0xc629a01eC23AB04E1050500A3717A2a5c0701497": Plain2BasicABI, // EMA
    "0x94b4DFd9Ba5865Cc931195c99A2db42F3fc5d45B": Plain2ETHABI,   // EMA

    "0x9B52F13DF69D79Ec5aAB6D1aCe3157d29B409cC3": Plain3BasicABI,
    "0x50b085f2e5958C4A87baf93A8AB79F6bec068494": Plain3BalancesABI,
    "0x8c1aB78601c259E1B43F19816923609dC7d7de9B": Plain3ETHABI,
    "0xE5F4b89E0A16578B3e0e7581327BDb4C712E44De": Plain3OptimizedABI,

    "0x5Bd47eA4494e0F8DE6e3Ca10F1c05F55b72466B8": Plain4BasicABI,
    "0xd35B58386705CE75CE6d09842E38E9BE9CDe5bF6": Plain4BalancesABI,
    "0x88855cdF2b0A8413D470B86952E726684de915be": Plain4ETHABI,
    "0xaD4753D045D3Aed5C1a6606dFb6a7D7AD67C1Ad7": Plain4OptimizedABI,
});

export const implementationBasePoolIdDictEthereum: IDict<string> = lowerCaseKeys({
    "0x5F890841f657d90E081bAbdB532A05996Af79Fe6": "3pool",

    "0x213be373FDff327658139C7df330817DAD2d5bBE": "3pool",
    "0x55Aa9BF126bCABF0bDC17Fa9E39Ec9239e1ce7A9": "3pool",

    "0x33bB0e62d5e8C688E645Dd46DFb48Cd613250067": "fraxusdc",
    "0x2EB24483Ef551dA247ab87Cf18e1Cc980073032D": "fraxusdc",

    "0xF9B62b61d108232Ef0C9DD143bb3c22c7D4A715a": "fraxusdp",
    "0xB172AC2Fe440B5dA74Dc460e5E9d96bc2BF6261F": "fraxusdp",

    "0xC6A8466d128Fbfd34AdA64a9FFFce325D57C9a52": "sbtc",
    "0xc4C78b08fA0c3d0a312605634461A88184Ecd630": "sbtc",

    "0xECAaecd9d2193900b424774133B1f51ae0F29d9E": "ren",
    "0x40fD58D44cFE63E8517c9Bb3ac98676838Ea56A8": "ren",

    "0x008CFa89df5B0c780cA3462fc2602D7F8c7Ac315": "sbtc2",
    "0xAbc533EbCDdeD41215C46ee078C5818B5b0A252F": "sbtc2",
});

export const basePoolIdZapDictEthereum: IDict<{ address: string, ABI: () => Promise<JsonFragment[]> }> = {
    '3pool': {
        address: "0xA79828DF1850E8a3A3064576f380D90aECDD3359".toLowerCase(),
        ABI: factoryDepositABI,
    },
    fraxusdc: {
        address: "0x08780fb7E580e492c1935bEe4fA5920b94AA95Da".toLowerCase(),
        ABI: fraxusdcMetaZapABI,
    },
    fraxusdp: {
        address: "0x63B709d2118Ba0389ee75A131d1F9a473e06afbD".toLowerCase(),
        ABI: fraxusdcMetaZapABI,
    },
    sbtc: {
        address: "0x7abdbaf29929e7f8621b757d2a7c04d78d633834".toLowerCase(),
        ABI: factoryDepositABI,
    },
    ren: {
        address: "0x8Fb3Ec8f2d1Dc089E70CD61f1E49496d443B2124".toLowerCase(),
        ABI: RenMetaZapABI,
    },
    sbtc2: {
        address: "0xA2d40Edbf76C6C0701BA8899e2d059798eBa628e".toLowerCase(),
        ABI: Sbtc2MetaZapABI,
    },
}

export const FACTORY_CONSTANTS: { [index: number]: { implementationABIDict: IDict<() => Promise<JsonFragment[]>>, implementationBasePoolIdDict: IDict<string>, basePoolIdZapDict: IDict<{ address: string, ABI: () => Promise<JsonFragment[]> }> } } = {
    1: {  // ETH
        implementationABIDict: implementationABIDictEthereum,
        implementationBasePoolIdDict: implementationBasePoolIdDictEthereum,
        basePoolIdZapDict: basePoolIdZapDictEthereum,
    }
}
