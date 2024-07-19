import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IFlashLoanSimpleReceiver, IFlashLoanSimpleReceiverInterface } from "../../../contracts/AaveV3.sol/IFlashLoanSimpleReceiver";
export declare class IFlashLoanSimpleReceiver__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "ADDRESSES_PROVIDER";
        readonly outputs: readonly [{
            readonly internalType: "contract IPoolAddressesProvider";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "POOL";
        readonly outputs: readonly [{
            readonly internalType: "contract IPool";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "asset";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "amount";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "premium";
            readonly type: "uint256";
        }, {
            readonly internalType: "address";
            readonly name: "initiator";
            readonly type: "address";
        }, {
            readonly internalType: "bytes";
            readonly name: "params";
            readonly type: "bytes";
        }];
        readonly name: "executeOperation";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "";
            readonly type: "bool";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): IFlashLoanSimpleReceiverInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IFlashLoanSimpleReceiver;
}
