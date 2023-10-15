import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IStargateRouter, IStargateRouterInterface } from "../../../contracts/IStargateRouter.sol/IStargateRouter";
export declare class IStargateRouter__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "poolId";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "amountLD";
            readonly type: "uint256";
        }, {
            readonly internalType: "address";
            readonly name: "_to";
            readonly type: "address";
        }];
        readonly name: "addLiquidity";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "poolId";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "amountLD";
            readonly type: "uint256";
        }, {
            readonly internalType: "address";
            readonly name: "_to";
            readonly type: "address";
        }];
        readonly name: "instantRedeemLocal";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "amountSD";
            readonly type: "uint256";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): IStargateRouterInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IStargateRouter;
}
//# sourceMappingURL=IStargateRouter__factory.d.ts.map