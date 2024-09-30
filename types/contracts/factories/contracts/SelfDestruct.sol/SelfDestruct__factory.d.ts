import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type { SelfDestruct, SelfDestructInterface } from "../../../contracts/SelfDestruct.sol/SelfDestruct";
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
    static readonly bytecode = "0x6080604052348015600f57600080fd5b5060848061001e6000396000f3fe6080604052348015600f57600080fd5b506004361060285760003560e01c806383197ef014602d575b600080fd5b60336035565b005b3373ffffffffffffffffffffffffffffffffffffffff16fffea26469706673582212201c851d10770fdbba267962bb1b483df8a6aba15a609758859ee580e4947e208564736f6c63430008110033";
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "destroy";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): SelfDestructInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): SelfDestruct;
}
export {};
//# sourceMappingURL=SelfDestruct__factory.d.ts.map