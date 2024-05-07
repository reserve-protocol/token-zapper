import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { FacadeRead, FacadeReadInterface } from "../../../contracts/IRTokenZapper.sol/FacadeRead";
export declare class FacadeRead__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "contract RToken";
            readonly name: "rToken";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "account";
            readonly type: "address";
        }];
        readonly name: "maxIssuable";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): FacadeReadInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): FacadeRead;
}
//# sourceMappingURL=FacadeRead__factory.d.ts.map