import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IBasketHandler, IBasketHandlerInterface } from "../../contracts/IBasketHandler";
export declare class IBasketHandler__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "nonce";
        readonly outputs: readonly [{
            readonly internalType: "uint48";
            readonly name: "";
            readonly type: "uint48";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint192";
            readonly name: "amount";
            readonly type: "uint192";
        }, {
            readonly internalType: "enum RoundingMode";
            readonly name: "rounding";
            readonly type: "uint8";
        }];
        readonly name: "quote";
        readonly outputs: readonly [{
            readonly internalType: "address[]";
            readonly name: "erc20s";
            readonly type: "address[]";
        }, {
            readonly internalType: "uint256[]";
            readonly name: "quantities";
            readonly type: "uint256[]";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }];
    static createInterface(): IBasketHandlerInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IBasketHandler;
}
//# sourceMappingURL=IBasketHandler__factory.d.ts.map