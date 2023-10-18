import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IMain, IMainInterface } from "../../contracts/IMain";
export declare class IMain__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "backingManager";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "basketHandler";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "rToken";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }];
    static createInterface(): IMainInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IMain;
}
