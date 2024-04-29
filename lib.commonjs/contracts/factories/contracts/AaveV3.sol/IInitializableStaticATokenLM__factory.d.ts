import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IInitializableStaticATokenLM, IInitializableStaticATokenLMInterface } from "../../../contracts/AaveV3.sol/IInitializableStaticATokenLM";
export declare class IInitializableStaticATokenLM__factory {
    static readonly abi: readonly [{
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "aToken";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "string";
            readonly name: "staticATokenName";
            readonly type: "string";
        }, {
            readonly indexed: false;
            readonly internalType: "string";
            readonly name: "staticATokenSymbol";
            readonly type: "string";
        }];
        readonly name: "InitializedStaticATokenLM";
        readonly type: "event";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "aToken";
            readonly type: "address";
        }, {
            readonly internalType: "string";
            readonly name: "staticATokenName";
            readonly type: "string";
        }, {
            readonly internalType: "string";
            readonly name: "staticATokenSymbol";
            readonly type: "string";
        }];
        readonly name: "initialize";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): IInitializableStaticATokenLMInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IInitializableStaticATokenLM;
}
