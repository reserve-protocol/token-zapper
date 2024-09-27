import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IAsset, IAssetInterface } from "../../../contracts/IAssetRegistry.sol/IAsset";
export declare class IAsset__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "price";
        readonly outputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "uint192";
                readonly name: "low";
                readonly type: "uint192";
            }, {
                readonly internalType: "uint192";
                readonly name: "high";
                readonly type: "uint192";
            }];
            readonly internalType: "struct Price";
            readonly name: "";
            readonly type: "tuple";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }];
    static createInterface(): IAssetInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IAsset;
}
//# sourceMappingURL=IAsset__factory.d.ts.map