import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ITokenVault, ITokenVaultInterface } from "../../contracts/ITokenVault";
export declare class ITokenVault__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "assets";
            readonly type: "uint256";
        }, {
            readonly internalType: "address";
            readonly name: "receiver";
            readonly type: "address";
        }];
        readonly name: "deposit";
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
            readonly name: "assets";
            readonly type: "uint256";
        }, {
            readonly internalType: "address";
            readonly name: "receiver";
            readonly type: "address";
        }];
        readonly name: "withdraw";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): ITokenVaultInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ITokenVault;
}
//# sourceMappingURL=ITokenVault__factory.d.ts.map