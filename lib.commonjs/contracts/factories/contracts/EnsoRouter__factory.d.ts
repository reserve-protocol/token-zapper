import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { EnsoRouter, EnsoRouterInterface } from "../../contracts/EnsoRouter";
export declare class EnsoRouter__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "contract IERC20";
            readonly name: "tokenIn";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "amountIn";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes32[]";
            readonly name: "commands";
            readonly type: "bytes32[]";
        }, {
            readonly internalType: "bytes[]";
            readonly name: "state";
            readonly type: "bytes[]";
        }];
        readonly name: "routeSingle";
        readonly outputs: readonly [{
            readonly internalType: "bytes[]";
            readonly name: "returnData";
            readonly type: "bytes[]";
        }];
        readonly stateMutability: "payable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "contract IERC20";
            readonly name: "tokenIn";
            readonly type: "address";
        }, {
            readonly internalType: "contract IERC20";
            readonly name: "tokenOut";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "amountIn";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "minAmountOut";
            readonly type: "uint256";
        }, {
            readonly internalType: "address";
            readonly name: "receiver";
            readonly type: "address";
        }, {
            readonly internalType: "bytes32[]";
            readonly name: "commands";
            readonly type: "bytes32[]";
        }, {
            readonly internalType: "bytes[]";
            readonly name: "state";
            readonly type: "bytes[]";
        }];
        readonly name: "safeRouteSingle";
        readonly outputs: readonly [{
            readonly internalType: "bytes[]";
            readonly name: "returnData";
            readonly type: "bytes[]";
        }];
        readonly stateMutability: "payable";
        readonly type: "function";
    }];
    static createInterface(): EnsoRouterInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): EnsoRouter;
}
