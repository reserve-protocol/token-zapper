import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { CEther, CEtherInterface } from "../../ICToken.sol/CEther";
export declare class CEther__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "mint";
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
            readonly name: "cTokenAmount";
            readonly type: "uint256";
        }];
        readonly name: "redeem";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "payable";
        readonly type: "function";
    }];
    static createInterface(): CEtherInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): CEther;
}
