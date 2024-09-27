import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type { TestPreventSelfDestruct, TestPreventSelfDestructInterface } from "../../../contracts/SelfDestruct.sol/TestPreventSelfDestruct";
type TestPreventSelfDestructConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class TestPreventSelfDestruct__factory extends ContractFactory {
    constructor(...args: TestPreventSelfDestructConstructorParams);
    deploy(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<TestPreventSelfDestruct>;
    getDeployTransaction(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): TransactionRequest;
    attach(address: string): TestPreventSelfDestruct;
    connect(signer: Signer): TestPreventSelfDestruct__factory;
    static readonly bytecode = "0x60a060405234801561001057600080fd5b506000303f905080608081815250505060805161054c61004160003960008181607a01526102a6015261054c6000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c80633b177fc2146100465780633e80d0ba14610064578063d3072d821461006e575b600080fd5b61004e610078565b60405161005b919061032e565b60405180910390f35b61006c61009c565b005b61007661019e565b005b7f000000000000000000000000000000000000000000000000000000000000000081565b60006040516100aa90610309565b604051809103906000f0801580156100c6573d6000803e3d6000fd5b5090508073ffffffffffffffffffffffffffffffffffffffff166383197ef060e01b604051602401604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff838183161783525050505060405161015891906103ba565b600060405180830381855af49150503d8060008114610193576040519150601f19603f3d011682016040523d82523d6000602084013e610198565b606091505b50505050565b60006040516101ac90610309565b604051809103906000f0801580156101c8573d6000803e3d6000fd5b5090508073ffffffffffffffffffffffffffffffffffffffff166383197ef060e01b604051602401604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff838183161783525050505060405161025a91906103ba565b600060405180830381855af49150503d8060008114610295576040519150601f19603f3d011682016040523d82523d6000602084013e61029a565b606091505b505050506000303f90507f00000000000000000000000000000000000000000000000000000000000000008114610306576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016102fd90610454565b60405180910390fd5b50565b60a28061047583390190565b6000819050919050565b61032881610315565b82525050565b6000602082019050610343600083018461031f565b92915050565b600081519050919050565b600081905092915050565b60005b8381101561037d578082015181840152602081019050610362565b60008484015250505050565b600061039482610349565b61039e8185610354565b93506103ae81856020860161035f565b80840191505092915050565b60006103c68284610389565b915081905092915050565b600082825260208201905092915050565b7f50726576656e7453656c6644657374727563743a20436f64652068617320636860008201527f616e676564000000000000000000000000000000000000000000000000000000602082015250565b600061043e6025836103d1565b9150610449826103e2565b604082019050919050565b6000602082019050818103600083015261046d81610431565b905091905056fe6080604052348015600f57600080fd5b5060848061001e6000396000f3fe6080604052348015600f57600080fd5b506004361060285760003560e01c806383197ef014602d575b600080fd5b60336035565b005b3373ffffffffffffffffffffffffffffffffffffffff16fffea26469706673582212201c851d10770fdbba267962bb1b483df8a6aba15a609758859ee580e4947e208564736f6c63430008110033a26469706673582212202a55a8fbf4138fa7bbeb4c9d2963475c386d40a5ae575e4aebe61af269b2640f64736f6c63430008110033";
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "deployCodehash";
        readonly outputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "";
            readonly type: "bytes32";
        }];
        readonly stateMutability: "view";
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
    static createInterface(): TestPreventSelfDestructInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): TestPreventSelfDestruct;
}
export {};
