import { type JsonFragment } from "@ethersproject/abi";
import { type IDict } from "../interfaces";
export declare const lpTokenBasePoolIdDictEthereum: IDict<string>;
export declare const lpTokenBasePoolIdDictPolygon: IDict<string>;
export declare const lpTokenBasePoolIdDictFantom: IDict<string>;
export declare const lpTokenBasePoolIdDictAvalanche: IDict<string>;
export declare const lpTokenBasePoolIdDictArbitrum: IDict<string>;
export declare const lpTokenBasePoolIdDictOptimism: IDict<string>;
export declare const lpTokenBasePoolIdDictXDai: IDict<string>;
export declare const lpTokenBasePoolIdDictMoonbeam: IDict<string>;
export declare const lpTokenBasePoolIdDictKava: IDict<string>;
export declare const lpTokenBasePoolIdDictCelo: IDict<string>;
export declare const basePoolIdZapDictEthereum: IDict<{
    address: string;
    ABI: () => Promise<JsonFragment[]>;
}>;
export declare const basePoolIdZapDictFantom: IDict<{
    address: string;
    ABI: () => Promise<JsonFragment[]>;
}>;
export declare const basePoolIdZapDictAvalanche: IDict<{
    address: string;
    ABI: () => Promise<JsonFragment[]>;
}>;
export declare const basePoolIdZapDictArbitrum: IDict<{
    address: string;
    ABI: () => Promise<JsonFragment[]>;
}>;
export declare const basePoolIdZapDictOptimism: IDict<{
    address: string;
    ABI: () => Promise<JsonFragment[]>;
}>;
export declare const basePoolIdZapDictXDai: IDict<{
    address: string;
    ABI: () => Promise<JsonFragment[]>;
}>;
export declare const basePoolIdZapDictMoonbeam: IDict<{
    address: string;
    ABI: () => Promise<JsonFragment[]>;
}>;
export declare const basePoolIdZapDictKava: IDict<{
    address: string;
    ABI: () => Promise<JsonFragment[]>;
}>;
export declare const basePoolIdZapDictCelo: IDict<{
    address: string;
    ABI: () => Promise<JsonFragment[]>;
}>;
export declare const CRYPTO_FACTORY_CONSTANTS: {
    [index: number]: {
        lpTokenBasePoolIdDict: IDict<string>;
        basePoolIdZapDict: IDict<{
            address: string;
            ABI: () => Promise<JsonFragment[]>;
        }>;
    };
};
//# sourceMappingURL=constants-crypto.d.ts.map