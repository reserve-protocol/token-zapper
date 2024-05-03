import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IConvexStakingWrapper, IConvexStakingWrapperInterface } from "../../contracts/IConvexStakingWrapper";
export declare class IConvexStakingWrapper__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "N_COINS";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256[]";
            readonly name: "amounts";
            readonly type: "uint256[]";
        }, {
            readonly internalType: "uint256";
            readonly name: "minOut";
            readonly type: "uint256";
        }];
        readonly name: "add_liquidity";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256[]";
            readonly name: "amounts";
            readonly type: "uint256[]";
        }, {
            readonly internalType: "bool";
            readonly name: "isDeposit";
            readonly type: "bool";
        }];
        readonly name: "calc_token_amount";
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
            readonly name: "amt";
            readonly type: "uint256";
        }, {
            readonly internalType: "int128";
            readonly name: "i";
            readonly type: "int128";
        }];
        readonly name: "calc_withdraw_one_coin";
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
            readonly name: "i";
            readonly type: "uint256";
        }];
        readonly name: "coins";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "int128";
            readonly name: "i";
            readonly type: "int128";
        }, {
            readonly internalType: "int128";
            readonly name: "j";
            readonly type: "int128";
        }, {
            readonly internalType: "address";
            readonly name: "pool";
            readonly type: "address";
        }];
        readonly name: "dynamic_fee";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "int128";
            readonly name: "i";
            readonly type: "int128";
        }, {
            readonly internalType: "int128";
            readonly name: "j";
            readonly type: "int128";
        }, {
            readonly internalType: "uint256";
            readonly name: "dy";
            readonly type: "uint256";
        }, {
            readonly internalType: "address";
            readonly name: "pool";
            readonly type: "address";
        }];
        readonly name: "get_dx";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "int128";
            readonly name: "i";
            readonly type: "int128";
        }, {
            readonly internalType: "int128";
            readonly name: "j";
            readonly type: "int128";
        }, {
            readonly internalType: "uint256";
            readonly name: "dx";
            readonly type: "uint256";
        }, {
            readonly internalType: "address";
            readonly name: "pool";
            readonly type: "address";
        }];
        readonly name: "get_dy";
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
            readonly name: "amount";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256[]";
            readonly name: "mintOuts";
            readonly type: "uint256[]";
        }];
        readonly name: "remove_liquidity";
        readonly outputs: readonly [{
            readonly internalType: "uint256[]";
            readonly name: "";
            readonly type: "uint256[]";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "amt";
            readonly type: "uint256";
        }, {
            readonly internalType: "int128";
            readonly name: "i";
            readonly type: "int128";
        }, {
            readonly internalType: "uint256";
            readonly name: "mintOut";
            readonly type: "uint256";
        }];
        readonly name: "remove_liquidity_one_coin";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): IConvexStakingWrapperInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IConvexStakingWrapper;
}
//# sourceMappingURL=IConvexStakingWrapper__factory.d.ts.map