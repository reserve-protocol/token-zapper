import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IRETHRouter, IRETHRouterInterface } from "../../contracts/IRETHRouter";
export declare class IRETHRouter__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_amount";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_steps";
            readonly type: "uint256";
        }];
        readonly name: "optimiseSwapFrom";
        readonly outputs: readonly [{
            readonly internalType: "uint256[2]";
            readonly name: "portions";
            readonly type: "uint256[2]";
        }, {
            readonly internalType: "uint256";
            readonly name: "amountOut";
            readonly type: "uint256";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_amount";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_steps";
            readonly type: "uint256";
        }];
        readonly name: "optimiseSwapTo";
        readonly outputs: readonly [{
            readonly internalType: "uint256[2]";
            readonly name: "portions";
            readonly type: "uint256[2]";
        }, {
            readonly internalType: "uint256";
            readonly name: "amountOut";
            readonly type: "uint256";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_uniswapPortion";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_balancerPortion";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_minTokensOut";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_idealTokensOut";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_tokensIn";
            readonly type: "uint256";
        }];
        readonly name: "swapFrom";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_uniswapPortion";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_balancerPortion";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_minTokensOut";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_idealTokensOut";
            readonly type: "uint256";
        }];
        readonly name: "swapTo";
        readonly outputs: readonly [];
        readonly stateMutability: "payable";
        readonly type: "function";
    }];
    static createInterface(): IRETHRouterInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IRETHRouter;
}
//# sourceMappingURL=IRETHRouter__factory.d.ts.map