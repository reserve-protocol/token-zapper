/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type {
  TestPreventTampering,
  TestPreventTamperingInterface,
} from "../../../contracts/PreventTampering.sol/TestPreventTampering";

const _abi = [
  {
    inputs: [],
    name: "deployCodehash",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "shouldNotRevert",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "shouldRevert",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x60a060405234801561001057600080fd5b506000303f905080608081815250505060805161054c61004160003960008181607a01526102a6015261054c6000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c80633b177fc2146100465780633e80d0ba14610064578063d3072d821461006e575b600080fd5b61004e610078565b60405161005b919061032e565b60405180910390f35b61006c61009c565b005b61007661019e565b005b7f000000000000000000000000000000000000000000000000000000000000000081565b60006040516100aa90610309565b604051809103906000f0801580156100c6573d6000803e3d6000fd5b5090508073ffffffffffffffffffffffffffffffffffffffff166383197ef060e01b604051602401604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff838183161783525050505060405161015891906103ba565b600060405180830381855af49150503d8060008114610193576040519150601f19603f3d011682016040523d82523d6000602084013e610198565b606091505b50505050565b60006040516101ac90610309565b604051809103906000f0801580156101c8573d6000803e3d6000fd5b5090508073ffffffffffffffffffffffffffffffffffffffff166383197ef060e01b604051602401604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff838183161783525050505060405161025a91906103ba565b600060405180830381855af49150503d8060008114610295576040519150601f19603f3d011682016040523d82523d6000602084013e61029a565b606091505b505050506000303f90507f00000000000000000000000000000000000000000000000000000000000000008114610306576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016102fd90610454565b60405180910390fd5b50565b60a28061047583390190565b6000819050919050565b61032881610315565b82525050565b6000602082019050610343600083018461031f565b92915050565b600081519050919050565b600081905092915050565b60005b8381101561037d578082015181840152602081019050610362565b60008484015250505050565b600061039482610349565b61039e8185610354565b93506103ae81856020860161035f565b80840191505092915050565b60006103c68284610389565b915081905092915050565b600082825260208201905092915050565b7f50726576656e7454616d706572696e673a20436f646520686173206368616e6760008201527f6564000000000000000000000000000000000000000000000000000000000000602082015250565b600061043e6022836103d1565b9150610449826103e2565b604082019050919050565b6000602082019050818103600083015261046d81610431565b905091905056fe6080604052348015600f57600080fd5b5060848061001e6000396000f3fe6080604052348015600f57600080fd5b506004361060285760003560e01c806383197ef014602d575b600080fd5b60336035565b005b3373ffffffffffffffffffffffffffffffffffffffff16fffea2646970667358221220ba689aec123f3b328964ae1b225cc250d4dbb36e7e82182d97fff8045835119a64736f6c63430008110033a2646970667358221220378932a75afccc3e5136ab448402c8c0a8cad449ebfd37527c1f162983fbab5864736f6c63430008110033";

type TestPreventTamperingConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: TestPreventTamperingConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class TestPreventTampering__factory extends ContractFactory {
  constructor(...args: TestPreventTamperingConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<TestPreventTampering> {
    return super.deploy(overrides || {}) as Promise<TestPreventTampering>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): TestPreventTampering {
    return super.attach(address) as TestPreventTampering;
  }
  override connect(signer: Signer): TestPreventTampering__factory {
    return super.connect(signer) as TestPreventTampering__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): TestPreventTamperingInterface {
    return new utils.Interface(_abi) as TestPreventTamperingInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): TestPreventTampering {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as TestPreventTampering;
  }
}
