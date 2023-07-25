import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IBasketHandler, IBasketHandlerInterface } from "../../contracts/IBasketHandler";
export declare class IBasketHandler__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "account";
            readonly type: "address";
        }];
        readonly name: "basketsHeldBy";
        readonly outputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "uint192";
                readonly name: "bottom";
                readonly type: "uint192";
            }, {
                readonly internalType: "uint192";
                readonly name: "top";
                readonly type: "uint192";
            }];
            readonly internalType: "struct BasketRange";
            readonly name: "";
            readonly type: "tuple";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "basketsNeeded";
        readonly outputs: readonly [{
            readonly internalType: "uint192";
            readonly name: "";
            readonly type: "uint192";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "disableBasket";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "fullyCollateralized";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "";
            readonly type: "bool";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "lotPrice";
        readonly outputs: readonly [{
            readonly internalType: "uint192";
            readonly name: "lotLow";
            readonly type: "uint192";
        }, {
            readonly internalType: "uint192";
            readonly name: "lotHigh";
            readonly type: "uint192";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
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
        readonly inputs: readonly [];
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
            readonly internalType: "contract IERC20";
            readonly name: "erc20";
            readonly type: "address";
        }];
        readonly name: "quantity";
        readonly outputs: readonly [{
            readonly internalType: "uint192";
            readonly name: "";
            readonly type: "uint192";
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
    }, {
        readonly inputs: readonly [];
        readonly name: "refreshBasket";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "targetName";
            readonly type: "bytes32";
        }, {
            readonly internalType: "uint256";
            readonly name: "max";
            readonly type: "uint256";
        }, {
            readonly internalType: "contract IERC20[]";
            readonly name: "erc20s";
            readonly type: "address[]";
        }];
        readonly name: "setBackupConfig";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "contract IERC20[]";
            readonly name: "erc20s";
            readonly type: "address[]";
        }, {
            readonly internalType: "uint192[]";
            readonly name: "targetAmts";
            readonly type: "uint192[]";
        }];
        readonly name: "setPrimeBasket";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "status";
        readonly outputs: readonly [{
            readonly internalType: "enum CollateralStatus";
            readonly name: "status";
            readonly type: "uint8";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "timestamp";
        readonly outputs: readonly [{
            readonly internalType: "uint48";
            readonly name: "";
            readonly type: "uint48";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }];
    static createInterface(): IBasketHandlerInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IBasketHandler;
}
//# sourceMappingURL=IBasketHandler__factory.d.ts.map