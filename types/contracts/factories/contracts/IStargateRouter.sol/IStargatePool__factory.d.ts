import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IStargatePool, IStargatePoolInterface } from "../../../contracts/IStargateRouter.sol/IStargatePool";
export declare class IStargatePool__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "poolId";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "token";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }];
    static createInterface(): IStargatePoolInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IStargatePool;
}
//# sourceMappingURL=IStargatePool__factory.d.ts.map