import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ICurveCryptoFactory, ICurveCryptoFactoryInterface } from "../../../../contracts/weiroll-helpers/Curvepools.sol/ICurveCryptoFactory";
export declare class ICurveCryptoFactory__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "uint256[2]";
            readonly name: "amounts";
            readonly type: "uint256[2]";
        }, {
            readonly internalType: "uint256";
            readonly name: "minOut";
            readonly type: "uint256";
        }, {
            readonly internalType: "bool";
            readonly name: "useEth";
            readonly type: "bool";
        }];
        readonly name: "add_liquidity";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): ICurveCryptoFactoryInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ICurveCryptoFactory;
}
