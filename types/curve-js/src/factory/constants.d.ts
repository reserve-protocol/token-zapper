import { type IDict } from "../interfaces";
import { JsonFragment } from "@ethersproject/abi";
export declare const implementationABIDictEthereum: IDict<() => Promise<JsonFragment[]>>;
export declare const implementationBasePoolIdDictEthereum: IDict<string>;
export declare const basePoolIdZapDictEthereum: IDict<{
    address: string;
    ABI: () => Promise<JsonFragment[]>;
}>;
export declare const FACTORY_CONSTANTS: {
    [index: number]: {
        implementationABIDict: IDict<() => Promise<JsonFragment[]>>;
        implementationBasePoolIdDict: IDict<string>;
        basePoolIdZapDict: IDict<{
            address: string;
            ABI: () => Promise<JsonFragment[]>;
        }>;
    };
};
//# sourceMappingURL=constants.d.ts.map