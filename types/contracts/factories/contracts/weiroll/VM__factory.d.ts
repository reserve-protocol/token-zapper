import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { VM, VMInterface } from "../../../contracts/weiroll/VM";
export declare class VM__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "command_index";
            readonly type: "uint256";
        }, {
            readonly internalType: "address";
            readonly name: "target";
            readonly type: "address";
        }, {
            readonly internalType: "string";
            readonly name: "message";
            readonly type: "string";
        }];
        readonly name: "ExecutionFailed";
        readonly type: "error";
    }];
    static createInterface(): VMInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): VM;
}
//# sourceMappingURL=VM__factory.d.ts.map