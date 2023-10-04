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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CRYPTO_FACTORY_CONSTANTS = exports.basePoolIdZapDictCelo = exports.basePoolIdZapDictKava = exports.basePoolIdZapDictMoonbeam = exports.basePoolIdZapDictXDai = exports.basePoolIdZapDictOptimism = exports.basePoolIdZapDictArbitrum = exports.basePoolIdZapDictAvalanche = exports.basePoolIdZapDictFantom = exports.basePoolIdZapDictEthereum = exports.lpTokenBasePoolIdDictCelo = exports.lpTokenBasePoolIdDictKava = exports.lpTokenBasePoolIdDictMoonbeam = exports.lpTokenBasePoolIdDictXDai = exports.lpTokenBasePoolIdDictOptimism = exports.lpTokenBasePoolIdDictArbitrum = exports.lpTokenBasePoolIdDictAvalanche = exports.lpTokenBasePoolIdDictFantom = exports.lpTokenBasePoolIdDictPolygon = exports.lpTokenBasePoolIdDictEthereum = void 0;
const utils_1 = require("../constants/utils");
// --- ZAPS --
const tripoolZapABI = () => Promise.resolve().then(() => __importStar(require("../constants/abis/3pool/meta_zap_crypto.json"))).then(i => i.default);
const fraxusdcZapABI = () => Promise.resolve().then(() => __importStar(require("../constants/abis/fraxusdc/meta_zap_crypto.json"))).then(i => i.default);
exports.lpTokenBasePoolIdDictEthereum = (0, utils_1.lowerCaseKeys)({
    '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490': '3pool',
    '0x3175Df0976dFA876431C2E9eE6Bc45b65d3473CC': 'fraxusdc',
});
exports.lpTokenBasePoolIdDictPolygon = (0, utils_1.lowerCaseKeys)({
    '0xdAD97F7713Ae9437fa9249920eC8507e5FbB23d3': 'atricrypto3',
});
exports.lpTokenBasePoolIdDictFantom = (0, utils_1.lowerCaseKeys)({});
exports.lpTokenBasePoolIdDictAvalanche = (0, utils_1.lowerCaseKeys)({});
exports.lpTokenBasePoolIdDictArbitrum = (0, utils_1.lowerCaseKeys)({});
exports.lpTokenBasePoolIdDictOptimism = (0, utils_1.lowerCaseKeys)({});
exports.lpTokenBasePoolIdDictXDai = (0, utils_1.lowerCaseKeys)({});
exports.lpTokenBasePoolIdDictMoonbeam = (0, utils_1.lowerCaseKeys)({});
exports.lpTokenBasePoolIdDictKava = (0, utils_1.lowerCaseKeys)({});
exports.lpTokenBasePoolIdDictCelo = (0, utils_1.lowerCaseKeys)({});
exports.basePoolIdZapDictEthereum = {
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
exports.basePoolIdZapDictFantom = {};
exports.basePoolIdZapDictAvalanche = {};
exports.basePoolIdZapDictArbitrum = {};
exports.basePoolIdZapDictOptimism = {};
exports.basePoolIdZapDictXDai = {};
exports.basePoolIdZapDictMoonbeam = {};
exports.basePoolIdZapDictKava = {};
exports.basePoolIdZapDictCelo = {};
exports.CRYPTO_FACTORY_CONSTANTS = {
    1: {
        lpTokenBasePoolIdDict: exports.lpTokenBasePoolIdDictEthereum,
        basePoolIdZapDict: exports.basePoolIdZapDictEthereum,
    }
};
//# sourceMappingURL=constants-crypto.js.map