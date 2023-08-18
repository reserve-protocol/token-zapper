import { lowerCaseKeys } from "../constants/utils";
// --- ZAPS --
const tripoolZapABI = () => import("../constants/abis/3pool/meta_zap_crypto.json").then(i => i.default);
const fraxusdcZapABI = () => import("../constants/abis/fraxusdc/meta_zap_crypto.json").then(i => i.default);
export const lpTokenBasePoolIdDictEthereum = lowerCaseKeys({
    '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490': '3pool',
    '0x3175Df0976dFA876431C2E9eE6Bc45b65d3473CC': 'fraxusdc',
});
export const lpTokenBasePoolIdDictPolygon = lowerCaseKeys({
    '0xdAD97F7713Ae9437fa9249920eC8507e5FbB23d3': 'atricrypto3',
});
export const lpTokenBasePoolIdDictFantom = lowerCaseKeys({});
export const lpTokenBasePoolIdDictAvalanche = lowerCaseKeys({});
export const lpTokenBasePoolIdDictArbitrum = lowerCaseKeys({});
export const lpTokenBasePoolIdDictOptimism = lowerCaseKeys({});
export const lpTokenBasePoolIdDictXDai = lowerCaseKeys({});
export const lpTokenBasePoolIdDictMoonbeam = lowerCaseKeys({});
export const lpTokenBasePoolIdDictKava = lowerCaseKeys({});
export const lpTokenBasePoolIdDictCelo = lowerCaseKeys({});
export const basePoolIdZapDictEthereum = {
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
export const basePoolIdZapDictFantom = {};
export const basePoolIdZapDictAvalanche = {};
export const basePoolIdZapDictArbitrum = {};
export const basePoolIdZapDictOptimism = {};
export const basePoolIdZapDictXDai = {};
export const basePoolIdZapDictMoonbeam = {};
export const basePoolIdZapDictKava = {};
export const basePoolIdZapDictCelo = {};
export const CRYPTO_FACTORY_CONSTANTS = {
    1: {
        lpTokenBasePoolIdDict: lpTokenBasePoolIdDictEthereum,
        basePoolIdZapDict: basePoolIdZapDictEthereum,
    }
};
//# sourceMappingURL=constants-crypto.js.map