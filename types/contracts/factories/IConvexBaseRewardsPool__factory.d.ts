import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IConvexBaseRewardsPool, IConvexBaseRewardsPoolInterface } from "../IConvexBaseRewardsPool";
export declare class IConvexBaseRewardsPool__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_amount";
            readonly type: "uint256";
        }];
        readonly name: "stake";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "";
            readonly type: "bool";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "stakeAll";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "";
            readonly type: "bool";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_for";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "_amount";
            readonly type: "uint256";
        }];
        readonly name: "stakeFor";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "";
            readonly type: "bool";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "amount";
            readonly type: "uint256";
        }, {
            readonly internalType: "bool";
            readonly name: "claim";
            readonly type: "bool";
        }];
        readonly name: "withdraw";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "";
            readonly type: "bool";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bool";
            readonly name: "claim";
            readonly type: "bool";
        }];
        readonly name: "withdrawAll";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bool";
            readonly name: "claim";
            readonly type: "bool";
        }];
        readonly name: "withdrawAllAndUnwrap";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "amount";
            readonly type: "uint256";
        }, {
            readonly internalType: "bool";
            readonly name: "claim";
            readonly type: "bool";
        }];
        readonly name: "withdrawAndUnwrap";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "";
            readonly type: "bool";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): IConvexBaseRewardsPoolInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IConvexBaseRewardsPool;
}
//# sourceMappingURL=IConvexBaseRewardsPool__factory.d.ts.map