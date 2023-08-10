import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IZapper, IZapperInterface } from "../../../contracts/IZapper.sol/IZapper";
export declare class IZapper__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "contract IERC20";
                readonly name: "tokenIn";
                readonly type: "address";
            }, {
                readonly internalType: "uint256";
                readonly name: "amountIn";
                readonly type: "uint256";
            }, {
                readonly components: readonly [{
                    readonly internalType: "address";
                    readonly name: "to";
                    readonly type: "address";
                }, {
                    readonly internalType: "bytes";
                    readonly name: "data";
                    readonly type: "bytes";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "value";
                    readonly type: "uint256";
                }];
                readonly internalType: "struct Call[]";
                readonly name: "commands";
                readonly type: "tuple[]";
            }, {
                readonly internalType: "uint256";
                readonly name: "amountOut";
                readonly type: "uint256";
            }, {
                readonly internalType: "contract IERC20";
                readonly name: "tokenOut";
                readonly type: "address";
            }];
            readonly internalType: "struct ZapERC20Params";
            readonly name: "params";
            readonly type: "tuple";
        }];
        readonly name: "zapERC20";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "contract IERC20";
                readonly name: "tokenIn";
                readonly type: "address";
            }, {
                readonly internalType: "uint256";
                readonly name: "amountIn";
                readonly type: "uint256";
            }, {
                readonly components: readonly [{
                    readonly internalType: "address";
                    readonly name: "to";
                    readonly type: "address";
                }, {
                    readonly internalType: "bytes";
                    readonly name: "data";
                    readonly type: "bytes";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "value";
                    readonly type: "uint256";
                }];
                readonly internalType: "struct Call[]";
                readonly name: "commands";
                readonly type: "tuple[]";
            }, {
                readonly internalType: "uint256";
                readonly name: "amountOut";
                readonly type: "uint256";
            }, {
                readonly internalType: "contract IERC20";
                readonly name: "tokenOut";
                readonly type: "address";
            }];
            readonly internalType: "struct ZapERC20Params";
            readonly name: "params";
            readonly type: "tuple";
        }, {
            readonly components: readonly [{
                readonly components: readonly [{
                    readonly internalType: "address";
                    readonly name: "token";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "amount";
                    readonly type: "uint256";
                }];
                readonly internalType: "struct TokenPermissions";
                readonly name: "permitted";
                readonly type: "tuple";
            }, {
                readonly internalType: "uint256";
                readonly name: "nonce";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "deadline";
                readonly type: "uint256";
            }];
            readonly internalType: "struct PermitTransferFrom";
            readonly name: "permit";
            readonly type: "tuple";
        }, {
            readonly internalType: "bytes";
            readonly name: "signature";
            readonly type: "bytes";
        }];
        readonly name: "zapERC20WithPermit2";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "contract IERC20";
                readonly name: "tokenIn";
                readonly type: "address";
            }, {
                readonly internalType: "uint256";
                readonly name: "amountIn";
                readonly type: "uint256";
            }, {
                readonly components: readonly [{
                    readonly internalType: "address";
                    readonly name: "to";
                    readonly type: "address";
                }, {
                    readonly internalType: "bytes";
                    readonly name: "data";
                    readonly type: "bytes";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "value";
                    readonly type: "uint256";
                }];
                readonly internalType: "struct Call[]";
                readonly name: "commands";
                readonly type: "tuple[]";
            }, {
                readonly internalType: "uint256";
                readonly name: "amountOut";
                readonly type: "uint256";
            }, {
                readonly internalType: "contract IERC20";
                readonly name: "tokenOut";
                readonly type: "address";
            }];
            readonly internalType: "struct ZapERC20Params";
            readonly name: "params";
            readonly type: "tuple";
        }];
        readonly name: "zapETH";
        readonly outputs: readonly [];
        readonly stateMutability: "payable";
        readonly type: "function";
    }];
    static createInterface(): IZapperInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IZapper;
}
