import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IChainLinkFeedRegistry, IChainLinkFeedRegistryInterface } from "../IChainLinkFeedRegistry";
export declare class IChainLinkFeedRegistry__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "base";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "quote";
            readonly type: "address";
        }];
        readonly name: "latestAnswer";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): IChainLinkFeedRegistryInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IChainLinkFeedRegistry;
}
//# sourceMappingURL=IChainLinkFeedRegistry__factory.d.ts.map