import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IStaticAV3TokenLM, IStaticAV3TokenLMInterface } from "../../../contracts/ISAV3Token.sol/IStaticAV3TokenLM";
export declare class IStaticAV3TokenLM__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "assets";
            readonly type: "uint256";
        }, {
            readonly internalType: "address";
            readonly name: "receiver";
            readonly type: "address";
        }, {
            readonly internalType: "uint16";
            readonly name: "referralCode";
            readonly type: "uint16";
        }, {
            readonly internalType: "bool";
            readonly name: "fromUnderlying";
            readonly type: "bool";
        }];
        readonly name: "deposit";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "rate";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "shares";
            readonly type: "uint256";
        }, {
            readonly internalType: "address";
            readonly name: "receiver";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "owner";
            readonly type: "address";
        }, {
            readonly internalType: "bool";
            readonly name: "withdrawFromAave";
            readonly type: "bool";
        }];
        readonly name: "redeem";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): IStaticAV3TokenLMInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IStaticAV3TokenLM;
}
