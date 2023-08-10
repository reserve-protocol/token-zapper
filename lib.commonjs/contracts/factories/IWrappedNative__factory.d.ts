import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IWrappedNative, IWrappedNativeInterface } from "../IWrappedNative";
export declare class IWrappedNative__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "deposit";
        readonly outputs: readonly [];
        readonly stateMutability: "payable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "amount";
            readonly type: "uint256";
        }];
        readonly name: "withdraw";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): IWrappedNativeInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IWrappedNative;
}
