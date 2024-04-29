import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { UniswapV2Pair, UniswapV2PairInterface } from "../../contracts/UniswapV2Pair";
export declare class UniswapV2Pair__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "amount0Out";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "amount1Out";
            readonly type: "uint256";
        }, {
            readonly internalType: "address";
            readonly name: "to";
            readonly type: "address";
        }, {
            readonly internalType: "bytes";
            readonly name: "data";
            readonly type: "bytes";
        }];
        readonly name: "swap";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): UniswapV2PairInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): UniswapV2Pair;
}
