import { type JsonFragment } from "@ethersproject/abi";
import { lowerCaseKeys } from "../constants/utils";

import { type IDict } from "../interfaces";

// --- ZAPS --
const tripoolZapABI = () => import("../constants/abis/3pool/meta_zap_crypto.json", {assert:{type: "json"}}).then(i => i.default)
const fraxusdcZapABI = () => import("../constants/abis/fraxusdc/meta_zap_crypto.json", {assert:{type: "json"}}).then(i => i.default)

export const lpTokenBasePoolIdDictEthereum: IDict<string> = lowerCaseKeys({
    '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490': '3pool',
    '0x3175Df0976dFA876431C2E9eE6Bc45b65d3473CC': 'fraxusdc',
});

export const lpTokenBasePoolIdDictPolygon: IDict<string> = lowerCaseKeys({
    '0xdAD97F7713Ae9437fa9249920eC8507e5FbB23d3': 'atricrypto3',
});

export const lpTokenBasePoolIdDictFantom: IDict<string> = lowerCaseKeys({});

export const lpTokenBasePoolIdDictAvalanche: IDict<string> = lowerCaseKeys({});

export const lpTokenBasePoolIdDictArbitrum: IDict<string> = lowerCaseKeys({});

export const lpTokenBasePoolIdDictOptimism: IDict<string> = lowerCaseKeys({});

export const lpTokenBasePoolIdDictXDai: IDict<string> = lowerCaseKeys({});

export const lpTokenBasePoolIdDictMoonbeam: IDict<string> = lowerCaseKeys({});

export const lpTokenBasePoolIdDictKava: IDict<string> = lowerCaseKeys({});

export const lpTokenBasePoolIdDictCelo: IDict<string> = lowerCaseKeys({});

export const basePoolIdZapDictEthereum: IDict<{ address: string, ABI: () => Promise<JsonFragment[]> }> = {
    '3pool': {
        address: "0x97aDC08FA1D849D2C48C5dcC1DaB568B169b0267".toLowerCase(),
        ABI: tripoolZapABI,
    },
    fraxusdc: {
        address: "0x5de4ef4879f4fe3bbadf2227d2ac5d0e2d76c895".toLowerCase(),
        ABI: fraxusdcZapABI,
    },
};

// export const basePoolIdZapDictPolygon: IDict<{ address: string, ABI: () => Promise<JsonFragment[]> }> = {
//     atricrypto3: {
//         address: "0x3d8EADb739D1Ef95dd53D718e4810721837c69c1".toLowerCase(),
//         ABI: atricrypto3ZapABI,
//     },
// };

export const basePoolIdZapDictFantom: IDict<{ address: string, ABI: () => Promise<JsonFragment[]> }> = {};

export const basePoolIdZapDictAvalanche: IDict<{ address: string, ABI: () => Promise<JsonFragment[]> }> = {};

export const basePoolIdZapDictArbitrum: IDict<{ address: string, ABI: () => Promise<JsonFragment[]> }> = {};

export const basePoolIdZapDictOptimism: IDict<{ address: string, ABI: () => Promise<JsonFragment[]> }> = {};

export const basePoolIdZapDictXDai: IDict<{ address: string, ABI: () => Promise<JsonFragment[]> }> = {};

export const basePoolIdZapDictMoonbeam: IDict<{ address: string, ABI: () => Promise<JsonFragment[]> }> = {};

export const basePoolIdZapDictKava: IDict<{ address: string, ABI: () => Promise<JsonFragment[]> }> = {};

export const basePoolIdZapDictCelo: IDict<{ address: string, ABI: () => Promise<JsonFragment[]> }> = {};

export const CRYPTO_FACTORY_CONSTANTS: { [index: number]: { lpTokenBasePoolIdDict: IDict<string>, basePoolIdZapDict: IDict<{ address: string, ABI: () => Promise<JsonFragment[]> }> } } = {
    1: {  // ETH
        lpTokenBasePoolIdDict: lpTokenBasePoolIdDictEthereum,
        basePoolIdZapDict: basePoolIdZapDictEthereum,
    }
}
