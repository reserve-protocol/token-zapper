import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IfrxETHMinter, IfrxETHMinterInterface } from "../../../contracts/IFrxMinter.sol/IfrxETHMinter";
export declare class IfrxETHMinter__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "recipient";
            readonly type: "address";
        }];
        readonly name: "submit";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "shares";
            readonly type: "uint256";
        }];
        readonly stateMutability: "payable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "recipient";
            readonly type: "address";
        }];
        readonly name: "submitAndDeposit";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "shares";
            readonly type: "uint256";
        }];
        readonly stateMutability: "payable";
        readonly type: "function";
    }];
    static createInterface(): IfrxETHMinterInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IfrxETHMinter;
}
//# sourceMappingURL=IfrxETHMinter__factory.d.ts.map