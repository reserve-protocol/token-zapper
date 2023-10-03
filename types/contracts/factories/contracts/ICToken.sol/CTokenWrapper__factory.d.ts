import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { CTokenWrapper, CTokenWrapperInterface } from "../../../contracts/ICToken.sol/CTokenWrapper";
export declare class CTokenWrapper__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "mintAmount";
            readonly type: "uint256";
        }, {
            readonly internalType: "address";
            readonly name: "to";
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
        readonly inputs: readonly [];
        readonly name: "exchangeRateStored";
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
            readonly name: "cTokenAmount";
            readonly type: "uint256";
        }, {
            readonly internalType: "address";
            readonly name: "to";
            readonly type: "address";
        }];
        readonly name: "withdraw";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "payable";
        readonly type: "function";
    }];
    static createInterface(): CTokenWrapperInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): CTokenWrapper;
}
//# sourceMappingURL=CTokenWrapper__factory.d.ts.map