/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Signer,
  utils,
  Contract,
  ContractFactory,
  BigNumberish,
  Overrides,
} from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type {
  ConvexVirtualERC20,
  ConvexVirtualERC20Interface,
} from "../../../contracts/Convex.sol/ConvexVirtualERC20";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_crvRewards",
        type: "address",
      },
      {
        internalType: "string",
        name: "name_",
        type: "string",
      },
      {
        internalType: "string",
        name: "symbol_",
        type: "string",
      },
      {
        internalType: "uint8",
        name: "decimals_",
        type: "uint8",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "crvRewards",
    outputs: [
      {
        internalType: "contract IRewardStaking",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amt",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
] as const;

const _bytecode =
  "0x60c06040523480156200001157600080fd5b5060405162000ee238038062000ee28339818101604052810190620000379190620002dd565b8373ffffffffffffffffffffffffffffffffffffffff1660808173ffffffffffffffffffffffffffffffffffffffff168152505082600090816200007c9190620005d8565b5081600190816200008e9190620005d8565b508060ff1660a08160ff168152505050505050620006bf565b6000604051905090565b600080fd5b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000620000e882620000bb565b9050919050565b620000fa81620000db565b81146200010657600080fd5b50565b6000815190506200011a81620000ef565b92915050565b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b62000175826200012a565b810181811067ffffffffffffffff821117156200019757620001966200013b565b5b80604052505050565b6000620001ac620000a7565b9050620001ba82826200016a565b919050565b600067ffffffffffffffff821115620001dd57620001dc6200013b565b5b620001e8826200012a565b9050602081019050919050565b60005b8381101562000215578082015181840152602081019050620001f8565b60008484015250505050565b6000620002386200023284620001bf565b620001a0565b90508281526020810184848401111562000257576200025662000125565b5b62000264848285620001f5565b509392505050565b600082601f83011262000284576200028362000120565b5b81516200029684826020860162000221565b91505092915050565b600060ff82169050919050565b620002b7816200029f565b8114620002c357600080fd5b50565b600081519050620002d781620002ac565b92915050565b60008060008060808587031215620002fa57620002f9620000b1565b5b60006200030a8782880162000109565b945050602085015167ffffffffffffffff8111156200032e576200032d620000b6565b5b6200033c878288016200026c565b935050604085015167ffffffffffffffff81111562000360576200035f620000b6565b5b6200036e878288016200026c565b92505060606200038187828801620002c6565b91505092959194509250565b600081519050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b60006002820490506001821680620003e057607f821691505b602082108103620003f657620003f562000398565b5b50919050565b60008190508160005260206000209050919050565b60006020601f8301049050919050565b600082821b905092915050565b600060088302620004607fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8262000421565b6200046c868362000421565b95508019841693508086168417925050509392505050565b6000819050919050565b6000819050919050565b6000620004b9620004b3620004ad8462000484565b6200048e565b62000484565b9050919050565b6000819050919050565b620004d58362000498565b620004ed620004e482620004c0565b8484546200042e565b825550505050565b600090565b62000504620004f5565b62000511818484620004ca565b505050565b5b8181101562000539576200052d600082620004fa565b60018101905062000517565b5050565b601f82111562000588576200055281620003fc565b6200055d8462000411565b810160208510156200056d578190505b620005856200057c8562000411565b83018262000516565b50505b505050565b600082821c905092915050565b6000620005ad600019846008026200058d565b1980831691505092915050565b6000620005c883836200059a565b9150826002028217905092915050565b620005e3826200038d565b67ffffffffffffffff811115620005ff57620005fe6200013b565b5b6200060b8254620003c7565b620006188282856200053d565b600060209050601f8311600181146200065057600084156200063b578287015190505b620006478582620005ba565b865550620006b7565b601f1984166200066086620003fc565b60005b828110156200068a5784890151825560018201915060208501945060208101905062000663565b86831015620006aa5784890151620006a6601f8916826200059a565b8355505b6001600288020188555050505b505050505050565b60805160a0516107f6620006ec60003960006101cf0152600081816101f5015261037701526107f66000f3fe608060405234801561001057600080fd5b50600436106100625760003560e01c806306fdde0314610067578063313ce5671461008557806370a08231146100a357806395d89b41146100d3578063a9059cbb146100f1578063b6bff29514610121575b600080fd5b61006f61013f565b60405161007c9190610429565b60405180910390f35b61008d6101cd565b60405161009a9190610467565b60405180910390f35b6100bd60048036038101906100b891906104e5565b6101f1565b6040516100ca919061052b565b60405180910390f35b6100db610294565b6040516100e89190610429565b60405180910390f35b61010b60048036038101906101069190610572565b610322565b60405161011891906105cd565b60405180910390f35b610129610375565b6040516101369190610647565b60405180910390f35b6000805461014c90610691565b80601f016020809104026020016040519081016040528092919081815260200182805461017890610691565b80156101c55780601f1061019a576101008083540402835291602001916101c5565b820191906000526020600020905b8154815290600101906020018083116101a857829003601f168201915b505050505081565b7f000000000000000000000000000000000000000000000000000000000000000081565b60007f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff166370a08231836040518263ffffffff1660e01b815260040161024c91906106d1565b602060405180830381865afa158015610269573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061028d9190610701565b9050919050565b600180546102a190610691565b80601f01602080910402602001604051908101604052809291908181526020018280546102cd90610691565b801561031a5780601f106102ef5761010080835404028352916020019161031a565b820191906000526020600020905b8154815290600101906020018083116102fd57829003601f168201915b505050505081565b6000808203610334576001905061036f565b6040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610366906107a0565b60405180910390fd5b92915050565b7f000000000000000000000000000000000000000000000000000000000000000081565b600081519050919050565b600082825260208201905092915050565b60005b838110156103d35780820151818401526020810190506103b8565b60008484015250505050565b6000601f19601f8301169050919050565b60006103fb82610399565b61040581856103a4565b93506104158185602086016103b5565b61041e816103df565b840191505092915050565b6000602082019050818103600083015261044381846103f0565b905092915050565b600060ff82169050919050565b6104618161044b565b82525050565b600060208201905061047c6000830184610458565b92915050565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006104b282610487565b9050919050565b6104c2816104a7565b81146104cd57600080fd5b50565b6000813590506104df816104b9565b92915050565b6000602082840312156104fb576104fa610482565b5b6000610509848285016104d0565b91505092915050565b6000819050919050565b61052581610512565b82525050565b6000602082019050610540600083018461051c565b92915050565b61054f81610512565b811461055a57600080fd5b50565b60008135905061056c81610546565b92915050565b6000806040838503121561058957610588610482565b5b6000610597858286016104d0565b92505060206105a88582860161055d565b9150509250929050565b60008115159050919050565b6105c7816105b2565b82525050565b60006020820190506105e260008301846105be565b92915050565b6000819050919050565b600061060d61060861060384610487565b6105e8565b610487565b9050919050565b600061061f826105f2565b9050919050565b600061063182610614565b9050919050565b61064181610626565b82525050565b600060208201905061065c6000830184610638565b92915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b600060028204905060018216806106a957607f821691505b6020821081036106bc576106bb610662565b5b50919050565b6106cb816104a7565b82525050565b60006020820190506106e660008301846106c2565b92915050565b6000815190506106fb81610546565b92915050565b60006020828403121561071757610716610482565b5b6000610725848285016106ec565b91505092915050565b7f436f6e7665785669727475616c45524332303a205472616e7366657273206e6f60008201527f7420737570706f72746564000000000000000000000000000000000000000000602082015250565b600061078a602b836103a4565b91506107958261072e565b604082019050919050565b600060208201905081810360008301526107b98161077d565b905091905056fea2646970667358221220e8057ec4cc5e920a4e7f5c6013e18436753d1f6c8bfc60db47dfe9c97d03b0f364736f6c63430008110033";

type ConvexVirtualERC20ConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ConvexVirtualERC20ConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class ConvexVirtualERC20__factory extends ContractFactory {
  constructor(...args: ConvexVirtualERC20ConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    _crvRewards: PromiseOrValue<string>,
    name_: PromiseOrValue<string>,
    symbol_: PromiseOrValue<string>,
    decimals_: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ConvexVirtualERC20> {
    return super.deploy(
      _crvRewards,
      name_,
      symbol_,
      decimals_,
      overrides || {}
    ) as Promise<ConvexVirtualERC20>;
  }
  override getDeployTransaction(
    _crvRewards: PromiseOrValue<string>,
    name_: PromiseOrValue<string>,
    symbol_: PromiseOrValue<string>,
    decimals_: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(
      _crvRewards,
      name_,
      symbol_,
      decimals_,
      overrides || {}
    );
  }
  override attach(address: string): ConvexVirtualERC20 {
    return super.attach(address) as ConvexVirtualERC20;
  }
  override connect(signer: Signer): ConvexVirtualERC20__factory {
    return super.connect(signer) as ConvexVirtualERC20__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ConvexVirtualERC20Interface {
    return new utils.Interface(_abi) as ConvexVirtualERC20Interface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ConvexVirtualERC20 {
    return new Contract(address, _abi, signerOrProvider) as ConvexVirtualERC20;
  }
}
