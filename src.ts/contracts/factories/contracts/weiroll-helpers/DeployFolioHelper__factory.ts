/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type {
  DeployFolioHelper,
  DeployFolioHelperInterface,
} from "../../../contracts/weiroll-helpers/DeployFolioHelper";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "deployer",
        type: "address",
      },
      {
        internalType: "address",
        name: "expectedTokenAddress",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "encodedFolioDeployerCall",
        type: "bytes",
      },
    ],
    name: "deployFolio",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b506106d3806100206000396000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c8063545a48b714610030575b600080fd5b61004a600480360381019061004591906103a7565b610060565b604051610057919061042f565b60405180910390f35b60008060008573ffffffffffffffffffffffffffffffffffffffff168460405161008a91906104bb565b6000604051808303816000865af19150503d80600081146100c7576040519150601f19603f3d011682016040523d82523d6000602084013e6100cc565b606091505b5091509150816100de57805160208201fd5b6000818060200190518101906100f49190610510565b505050505090508573ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1614610169576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610160906105fa565b60405180910390fd5b8573ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b81526004016101a29190610629565b602060405180830381865afa1580156101bf573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101e39190610670565b93505050509392505050565b6000604051905090565b600080fd5b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061022e82610203565b9050919050565b61023e81610223565b811461024957600080fd5b50565b60008135905061025b81610235565b92915050565b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6102b48261026b565b810181811067ffffffffffffffff821117156102d3576102d261027c565b5b80604052505050565b60006102e66101ef565b90506102f282826102ab565b919050565b600067ffffffffffffffff8211156103125761031161027c565b5b61031b8261026b565b9050602081019050919050565b82818337600083830152505050565b600061034a610345846102f7565b6102dc565b90508281526020810184848401111561036657610365610266565b5b610371848285610328565b509392505050565b600082601f83011261038e5761038d610261565b5b813561039e848260208601610337565b91505092915050565b6000806000606084860312156103c0576103bf6101f9565b5b60006103ce8682870161024c565b93505060206103df8682870161024c565b925050604084013567ffffffffffffffff811115610400576103ff6101fe565b5b61040c86828701610379565b9150509250925092565b6000819050919050565b61042981610416565b82525050565b60006020820190506104446000830184610420565b92915050565b600081519050919050565b600081905092915050565b60005b8381101561047e578082015181840152602081019050610463565b60008484015250505050565b60006104958261044a565b61049f8185610455565b93506104af818560208601610460565b80840191505092915050565b60006104c7828461048a565b915081905092915050565b60006104dd82610203565b9050919050565b6104ed816104d2565b81146104f857600080fd5b50565b60008151905061050a816104e4565b92915050565b60008060008060008060c0878903121561052d5761052c6101f9565b5b600061053b89828a016104fb565b965050602061054c89828a016104fb565b955050604061055d89828a016104fb565b945050606061056e89828a016104fb565b935050608061057f89828a016104fb565b92505060a061059089828a016104fb565b9150509295509295509295565b600082825260208201905092915050565b7f496e76616c696420726573756c74000000000000000000000000000000000000600082015250565b60006105e4600e8361059d565b91506105ef826105ae565b602082019050919050565b60006020820190508181036000830152610613816105d7565b9050919050565b61062381610223565b82525050565b600060208201905061063e600083018461061a565b92915050565b61064d81610416565b811461065857600080fd5b50565b60008151905061066a81610644565b92915050565b600060208284031215610686576106856101f9565b5b60006106948482850161065b565b9150509291505056fea264697066735822122066d46e67f64ac9c498da43138aeb302b90228bb1a6fa227c6da45c40008ae4e464736f6c63430008110033";

type DeployFolioHelperConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: DeployFolioHelperConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class DeployFolioHelper__factory extends ContractFactory {
  constructor(...args: DeployFolioHelperConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<DeployFolioHelper> {
    return super.deploy(overrides || {}) as Promise<DeployFolioHelper>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): DeployFolioHelper {
    return super.attach(address) as DeployFolioHelper;
  }
  override connect(signer: Signer): DeployFolioHelper__factory {
    return super.connect(signer) as DeployFolioHelper__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): DeployFolioHelperInterface {
    return new utils.Interface(_abi) as DeployFolioHelperInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): DeployFolioHelper {
    return new Contract(address, _abi, signerOrProvider) as DeployFolioHelper;
  }
}
