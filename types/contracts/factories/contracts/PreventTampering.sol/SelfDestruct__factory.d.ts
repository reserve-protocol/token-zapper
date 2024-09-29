import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type { SelfDestruct, SelfDestructInterface } from "../../../contracts/PreventTampering.sol/SelfDestruct";
type SelfDestructConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class SelfDestruct__factory extends ContractFactory {
    constructor(...args: SelfDestructConstructorParams);
    deploy(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<SelfDestruct>;
    getDeployTransaction(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): TransactionRequest;
    attach(address: string): SelfDestruct;
    connect(signer: Signer): SelfDestruct__factory;
    static readonly bytecode = "0x6080604052348015600f57600080fd5b5060988061001e6000396000f3fe6080604052348015600f57600080fd5b506004361060325760003560e01c80632f576f2014603757806383197ef014603f575b600080fd5b603d6047565b005b60456049565b005b565b3373ffffffffffffffffffffffffffffffffffffffff16fffea26469706673582212209b075ede699455cb8eb66d145a368241c514fbfb2bf91bc428d9258b83d1de2a64736f6c63430008110033";
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "destroy";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "doNothing";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): SelfDestructInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): SelfDestruct;
}
export {};
//# sourceMappingURL=SelfDestruct__factory.d.ts.map