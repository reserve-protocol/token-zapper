import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { CurveRouter, CurveRouterInterface } from "../../../../contracts/weiroll-helpers/CurveRouterCall.sol/CurveRouter";
export declare class CurveRouter__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "address[9]";
            readonly name: "_route";
            readonly type: "address[9]";
        }, {
            readonly internalType: "uint256[3][4]";
            readonly name: "_swap_params";
            readonly type: "uint256[3][4]";
        }, {
            readonly internalType: "uint256";
            readonly name: "_amount";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_expected";
            readonly type: "uint256";
        }, {
            readonly internalType: "address[4]";
            readonly name: "_pools";
            readonly type: "address[4]";
        }];
        readonly name: "exchange_multiple";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): CurveRouterInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): CurveRouter;
}
