import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IZapperExecutor, IZapperExecutorInterface } from "../../../contracts/IZapper.sol/IZapperExecutor";
export declare class IZapperExecutor__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "contract IERC20[]";
            readonly name: "tokens";
            readonly type: "address[]";
        }, {
            readonly internalType: "address";
            readonly name: "destination";
            readonly type: "address";
        }];
        readonly name: "drainERC20s";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "address";
                readonly name: "to";
                readonly type: "address";
            }, {
                readonly internalType: "bytes";
                readonly name: "data";
                readonly type: "bytes";
            }, {
                readonly internalType: "uint256";
                readonly name: "value";
                readonly type: "uint256";
            }];
            readonly internalType: "struct Call[]";
            readonly name: "calls";
            readonly type: "tuple[]";
        }];
        readonly name: "execute";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "contract IERC20[]";
            readonly name: "tokens";
            readonly type: "address[]";
        }, {
            readonly internalType: "address[]";
            readonly name: "spenders";
            readonly type: "address[]";
        }];
        readonly name: "setupApprovals";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): IZapperExecutorInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IZapperExecutor;
}
//# sourceMappingURL=IZapperExecutor__factory.d.ts.map