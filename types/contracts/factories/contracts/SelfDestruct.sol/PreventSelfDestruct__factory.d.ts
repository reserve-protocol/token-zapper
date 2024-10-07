import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { PreventSelfDestruct, PreventSelfDestructInterface } from "../../../contracts/SelfDestruct.sol/PreventSelfDestruct";
export declare class PreventSelfDestruct__factory {
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
    static createInterface(): PreventSelfDestructInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): PreventSelfDestruct;
}
//# sourceMappingURL=PreventSelfDestruct__factory.d.ts.map