import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IWrappedNative, IWrappedNativeInterface } from "../../contracts/IWrappedNative";
export declare class IWrappedNative__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "account";
            readonly type: "address";
        }];
        readonly name: "balanceOf";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
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
//# sourceMappingURL=IWrappedNative__factory.d.ts.map