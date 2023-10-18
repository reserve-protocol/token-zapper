import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { RToken, RTokenInterface } from "../../../contracts/IRTokenZapper.sol/RToken";
export declare class RToken__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "recipient";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "amount";
            readonly type: "uint256";
        }];
        readonly name: "issueTo";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): RTokenInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): RToken;
}
//# sourceMappingURL=RToken__factory.d.ts.map