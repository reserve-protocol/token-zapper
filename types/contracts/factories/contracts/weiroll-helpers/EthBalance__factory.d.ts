import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type { EthBalance, EthBalanceInterface } from "../../../contracts/weiroll-helpers/EthBalance";
type EthBalanceConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class EthBalance__factory extends ContractFactory {
    constructor(...args: EthBalanceConstructorParams);
    deploy(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<EthBalance>;
    getDeployTransaction(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): TransactionRequest;
    attach(address: string): EthBalance;
    connect(signer: Signer): EthBalance__factory;
    static readonly bytecode = "0x608060405234801561001057600080fd5b5061017b806100206000396000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c8063d8f3790f14610030575b600080fd5b61004a600480360381019061004591906100e4565b610060565b604051610057919061012a565b60405180910390f35b60008173ffffffffffffffffffffffffffffffffffffffff16319050919050565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006100b182610086565b9050919050565b6100c1816100a6565b81146100cc57600080fd5b50565b6000813590506100de816100b8565b92915050565b6000602082840312156100fa576100f9610081565b5b6000610108848285016100cf565b91505092915050565b6000819050919050565b61012481610111565b82525050565b600060208201905061013f600083018461011b565b9291505056fea2646970667358221220e5b4232f3957d670531f539e81a7bd13c76f5235c0d6adc3807270ed83d3ce9964736f6c63430008110033";
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "account";
            readonly type: "address";
        }];
        readonly name: "ethBalance";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): EthBalanceInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): EthBalance;
}
export {};
//# sourceMappingURL=EthBalance__factory.d.ts.map