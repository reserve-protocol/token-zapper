import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { PreventTampering, PreventTamperingInterface } from "../../../contracts/PreventTampering.sol/PreventTampering";
export declare class PreventTampering__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "deployCodehash";
        readonly outputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "";
            readonly type: "bytes32";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }];
    static createInterface(): PreventTamperingInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): PreventTampering;
}
