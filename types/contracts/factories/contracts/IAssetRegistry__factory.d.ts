import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IAssetRegistry, IAssetRegistryInterface } from "../../contracts/IAssetRegistry";
export declare class IAssetRegistry__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "refresh";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): IAssetRegistryInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IAssetRegistry;
}
//# sourceMappingURL=IAssetRegistry__factory.d.ts.map