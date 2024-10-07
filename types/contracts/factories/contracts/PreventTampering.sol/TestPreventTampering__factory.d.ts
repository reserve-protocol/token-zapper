import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type { TestPreventTampering, TestPreventTamperingInterface } from "../../../contracts/PreventTampering.sol/TestPreventTampering";
type TestPreventTamperingConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class TestPreventTampering__factory extends ContractFactory {
    constructor(...args: TestPreventTamperingConstructorParams);
    deploy(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<TestPreventTampering>;
    getDeployTransaction(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): TransactionRequest;
    attach(address: string): TestPreventTampering;
    connect(signer: Signer): TestPreventTampering__factory;
    static readonly bytecode = "0x608060405234801561001057600080fd5b5061062d806100206000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c80633e80d0ba146100465780635d0c2f2d14610050578063d3072d821461005a575b600080fd5b61004e610064565b005b610058610166565b005b6100626102b8565b005b60006040516100729061040a565b604051809103906000f08015801561008e573d6000803e3d6000fd5b5090508073ffffffffffffffffffffffffffffffffffffffff166383197ef060e01b604051602401604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff83818316178352505050506040516101209190610487565b600060405180830381855af49150503d806000811461015b576040519150601f19603f3d011682016040523d82523d6000602084013e610160565b606091505b50505050565b6000303f9050600060405161017a9061040a565b604051809103906000f080158015610196573d6000803e3d6000fd5b5090508073ffffffffffffffffffffffffffffffffffffffff16632f576f2060e01b604051602401604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff83818316178352505050506040516102289190610487565b600060405180830381855af49150503d8060008114610263576040519150601f19603f3d011682016040523d82523d6000602084013e610268565b606091505b505050506000303f90508181146102b4576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016102ab90610521565b60405180910390fd5b5050565b6000303f905060006040516102cc9061040a565b604051809103906000f0801580156102e8573d6000803e3d6000fd5b5090508073ffffffffffffffffffffffffffffffffffffffff166383197ef060e01b604051602401604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff838183161783525050505060405161037a9190610487565b600060405180830381855af49150503d80600081146103b5576040519150601f19603f3d011682016040523d82523d6000602084013e6103ba565b606091505b505050506000303f9050818114610406576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016103fd90610521565b60405180910390fd5b5050565b60b68061054283390190565b600081519050919050565b600081905092915050565b60005b8381101561044a57808201518184015260208101905061042f565b60008484015250505050565b600061046182610416565b61046b8185610421565b935061047b81856020860161042c565b80840191505092915050565b60006104938284610456565b915081905092915050565b600082825260208201905092915050565b7f50726576656e7454616d706572696e673a20436f646520686173206368616e6760008201527f6564000000000000000000000000000000000000000000000000000000000000602082015250565b600061050b60228361049e565b9150610516826104af565b604082019050919050565b6000602082019050818103600083015261053a816104fe565b905091905056fe6080604052348015600f57600080fd5b5060988061001e6000396000f3fe6080604052348015600f57600080fd5b506004361060325760003560e01c80632f576f2014603757806383197ef014603f575b600080fd5b603d6047565b005b60456049565b005b565b3373ffffffffffffffffffffffffffffffffffffffff16fffea26469706673582212209b075ede699455cb8eb66d145a368241c514fbfb2bf91bc428d9258b83d1de2a64736f6c63430008110033a2646970667358221220761dc440d2fef290babccafa57f76d07d5c895fa1180f94e2f245e4adaaa864264736f6c63430008110033";
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "markedRevertOnCodeHashChangeDontRevert";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "shouldNotRevert";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "shouldRevert";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): TestPreventTamperingInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): TestPreventTampering;
}
export {};
//# sourceMappingURL=TestPreventTampering__factory.d.ts.map