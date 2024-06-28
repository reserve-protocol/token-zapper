import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IRewardable, IRewardableInterface } from "../../../contracts/CompoundV3.sol/IRewardable";
export declare class IRewardable__factory {
    static readonly abi: readonly [{
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "contract IERC20Metadata";
            readonly name: "erc20";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "amount";
            readonly type: "uint256";
        }];
        readonly name: "RewardsClaimed";
        readonly type: "event";
    }, {
        readonly inputs: readonly [];
        readonly name: "claimRewards";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): IRewardableInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IRewardable;
}
