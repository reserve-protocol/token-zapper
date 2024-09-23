import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IBooster, IBoosterInterface } from "../../../contracts/Convex.sol/IBooster";
export declare class IBooster__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly name: "poolInfo";
        readonly outputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "address";
                readonly name: "lptoken";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "token";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "gauge";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "crvRewards";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "stash";
                readonly type: "address";
            }, {
                readonly internalType: "bool";
                readonly name: "shutdown";
                readonly type: "bool";
            }];
            readonly internalType: "struct PoolInfo";
            readonly name: "";
            readonly type: "tuple";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }];
    static createInterface(): IBoosterInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IBooster;
}
//# sourceMappingURL=IBooster__factory.d.ts.map