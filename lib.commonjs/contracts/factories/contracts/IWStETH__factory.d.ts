import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IWStETH, IWStETHInterface } from "../../contracts/IWStETH";
export declare class IWStETH__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_wstETHAmount";
            readonly type: "uint256";
        }];
        readonly name: "getStETHByWstETH";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_stETHAmount";
            readonly type: "uint256";
        }];
        readonly name: "getWstETHByStETH";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "stEthPerToken";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_wstETHAmount";
            readonly type: "uint256";
        }];
        readonly name: "unwrap";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_stETHAmount";
            readonly type: "uint256";
        }];
        readonly name: "wrap";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): IWStETHInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IWStETH;
}
