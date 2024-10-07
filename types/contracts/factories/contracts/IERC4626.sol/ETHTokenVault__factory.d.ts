import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ETHTokenVault, ETHTokenVaultInterface } from "../../../contracts/IERC4626.sol/ETHTokenVault";
export declare class ETHTokenVault__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
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
        readonly stateMutability: "payable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "amount";
            readonly type: "uint256";
        }];
        readonly name: "previewDeposit";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }];
    static createInterface(): ETHTokenVaultInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ETHTokenVault;
}
//# sourceMappingURL=ETHTokenVault__factory.d.ts.map