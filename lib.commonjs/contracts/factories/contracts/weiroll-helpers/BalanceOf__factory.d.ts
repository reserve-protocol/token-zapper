import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type { BalanceOf, BalanceOfInterface } from "../../../contracts/weiroll-helpers/BalanceOf";
type BalanceOfConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class BalanceOf__factory extends ContractFactory {
    constructor(...args: BalanceOfConstructorParams);
    deploy(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<BalanceOf>;
    getDeployTransaction(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): TransactionRequest;
    attach(address: string): BalanceOf;
    connect(signer: Signer): BalanceOf__factory;
    static readonly bytecode = "0x608060405234801561001057600080fd5b506103ca806100206000396000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c8063f7888aec14610030575b600080fd5b61004a600480360381019061004591906101ec565b610060565b6040516100579190610245565b60405180910390f35b60008060008473ffffffffffffffffffffffffffffffffffffffff166370a0823185604051602401610092919061026f565b6040516020818303038152906040529060e01b6020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff83818316178352505050506040516100e091906102fb565b6000604051808303816000865af19150503d806000811461011d576040519150601f19603f3d011682016040523d82523d6000602084013e610122565b606091505b50915091508161016b5784846040517f7ebb0767000000000000000000000000000000000000000000000000000000008152600401610162929190610312565b60405180910390fd5b8080602001905181019061017f9190610367565b9250505092915050565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006101b98261018e565b9050919050565b6101c9816101ae565b81146101d457600080fd5b50565b6000813590506101e6816101c0565b92915050565b6000806040838503121561020357610202610189565b5b6000610211858286016101d7565b9250506020610222858286016101d7565b9150509250929050565b6000819050919050565b61023f8161022c565b82525050565b600060208201905061025a6000830184610236565b92915050565b610269816101ae565b82525050565b60006020820190506102846000830184610260565b92915050565b600081519050919050565b600081905092915050565b60005b838110156102be5780820151818401526020810190506102a3565b60008484015250505050565b60006102d58261028a565b6102df8185610295565b93506102ef8185602086016102a0565b80840191505092915050565b600061030782846102ca565b915081905092915050565b60006040820190506103276000830185610260565b6103346020830184610260565b9392505050565b6103448161022c565b811461034f57600080fd5b50565b6000815190506103618161033b565b92915050565b60006020828403121561037d5761037c610189565b5b600061038b84828501610352565b9150509291505056fea2646970667358221220e6d4230fa5a109726077b633d997e9c688078fea148899935ab8c931ad18dfaf64736f6c63430008110033";
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "token";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "account";
            readonly type: "address";
        }];
        readonly name: "BalanceOfFailed";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "token";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "account";
            readonly type: "address";
        }];
        readonly name: "balanceOf";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): BalanceOfInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): BalanceOf;
}
export {};
