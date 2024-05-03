import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IReadFacet, IReadFacetInterface } from "../../../contracts/IFacade.sol/IReadFacet";
export declare class IReadFacet__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "contract IRToken";
            readonly name: "rToken";
            readonly type: "address";
        }];
        readonly name: "basketTokens";
        readonly outputs: readonly [{
            readonly internalType: "address[]";
            readonly name: "tokens";
            readonly type: "address[]";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "contract IRToken";
            readonly name: "rToken";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "amount";
            readonly type: "uint256";
        }];
        readonly name: "issue";
        readonly outputs: readonly [{
            readonly internalType: "address[]";
            readonly name: "tokens";
            readonly type: "address[]";
        }, {
            readonly internalType: "uint256[]";
            readonly name: "deposits";
            readonly type: "uint256[]";
        }, {
            readonly internalType: "uint192[]";
            readonly name: "depositsUoA";
            readonly type: "uint192[]";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "contract IRToken";
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
    }, {
        readonly inputs: readonly [{
            readonly internalType: "contract IRToken";
            readonly name: "rToken";
            readonly type: "address";
        }, {
            readonly internalType: "uint256[]";
            readonly name: "amounts";
            readonly type: "uint256[]";
        }];
        readonly name: "maxIssuableByAmounts";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "contract IRToken";
            readonly name: "rToken";
            readonly type: "address";
        }];
        readonly name: "price";
        readonly outputs: readonly [{
            readonly internalType: "uint192";
            readonly name: "low";
            readonly type: "uint192";
        }, {
            readonly internalType: "uint192";
            readonly name: "high";
            readonly type: "uint192";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "contract IRToken";
            readonly name: "rToken";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "amount";
            readonly type: "uint256";
        }];
        readonly name: "redeem";
        readonly outputs: readonly [{
            readonly internalType: "address[]";
            readonly name: "tokens";
            readonly type: "address[]";
        }, {
            readonly internalType: "uint256[]";
            readonly name: "withdrawals";
            readonly type: "uint256[]";
        }, {
            readonly internalType: "uint256[]";
            readonly name: "available";
            readonly type: "uint256[]";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): IReadFacetInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IReadFacet;
}
//# sourceMappingURL=IReadFacet__factory.d.ts.map