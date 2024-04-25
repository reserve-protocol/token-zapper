import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IGeneratedInterface, IGeneratedInterfaceInterface } from "../../../contracts/Aerodrome.sol/IGeneratedInterface";
export declare class IGeneratedInterface__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "forSwaps";
        readonly outputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "address";
                readonly name: "lp";
                readonly type: "address";
            }, {
                readonly internalType: "bool";
                readonly name: "stable";
                readonly type: "bool";
            }, {
                readonly internalType: "address";
                readonly name: "token0";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "token1";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "factory";
                readonly type: "address";
            }, {
                readonly internalType: "uint256";
                readonly name: "pool_fee";
                readonly type: "uint256";
            }];
            readonly internalType: "struct SwapLp[]";
            readonly name: "";
            readonly type: "tuple[]";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }];
    static createInterface(): IGeneratedInterfaceInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IGeneratedInterface;
}
//# sourceMappingURL=IGeneratedInterface__factory.d.ts.map