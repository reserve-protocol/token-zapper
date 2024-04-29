import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IInitializableDebtToken, IInitializableDebtTokenInterface } from "../../../contracts/AaveV3.sol/IInitializableDebtToken";
export declare class IInitializableDebtToken__factory {
    static readonly abi: readonly [{
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "underlyingAsset";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "pool";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "address";
            readonly name: "incentivesController";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "uint8";
            readonly name: "debtTokenDecimals";
            readonly type: "uint8";
        }, {
            readonly indexed: false;
            readonly internalType: "string";
            readonly name: "debtTokenName";
            readonly type: "string";
        }, {
            readonly indexed: false;
            readonly internalType: "string";
            readonly name: "debtTokenSymbol";
            readonly type: "string";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes";
            readonly name: "params";
            readonly type: "bytes";
        }];
        readonly name: "Initialized";
        readonly type: "event";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "contract IPool";
            readonly name: "pool";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "underlyingAsset";
            readonly type: "address";
        }, {
            readonly internalType: "contract IAaveIncentivesController";
            readonly name: "incentivesController";
            readonly type: "address";
        }, {
            readonly internalType: "uint8";
            readonly name: "debtTokenDecimals";
            readonly type: "uint8";
        }, {
            readonly internalType: "string";
            readonly name: "debtTokenName";
            readonly type: "string";
        }, {
            readonly internalType: "string";
            readonly name: "debtTokenSymbol";
            readonly type: "string";
        }, {
            readonly internalType: "bytes";
            readonly name: "params";
            readonly type: "bytes";
        }];
        readonly name: "initialize";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): IInitializableDebtTokenInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IInitializableDebtToken;
}
