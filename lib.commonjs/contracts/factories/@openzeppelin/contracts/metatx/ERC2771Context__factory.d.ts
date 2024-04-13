import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ERC2771Context, ERC2771ContextInterface } from "../../../../@openzeppelin/contracts/metatx/ERC2771Context";
export declare class ERC2771Context__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "forwarder";
            readonly type: "address";
        }];
        readonly name: "isTrustedForwarder";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "";
            readonly type: "bool";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }];
    static createInterface(): ERC2771ContextInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ERC2771Context;
}
