/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type {
  MoveEth,
  MoveEthInterface,
} from "../../../contracts/weiroll-helpers/MoveEth";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "moveEth",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b506102cf806100206000396000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c80631cc1472d14610030575b600080fd5b61004a60048036038101906100459190610196565b61004c565b005b60008273ffffffffffffffffffffffffffffffffffffffff168260405161007290610207565b60006040518083038185875af1925050503d80600081146100af576040519150601f19603f3d011682016040523d82523d6000602084013e6100b4565b606091505b50509050806100f8576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016100ef90610279565b60405180910390fd5b505050565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061012d82610102565b9050919050565b61013d81610122565b811461014857600080fd5b50565b60008135905061015a81610134565b92915050565b6000819050919050565b61017381610160565b811461017e57600080fd5b50565b6000813590506101908161016a565b92915050565b600080604083850312156101ad576101ac6100fd565b5b60006101bb8582860161014b565b92505060206101cc85828601610181565b9150509250929050565b600081905092915050565b50565b60006101f16000836101d6565b91506101fc826101e1565b600082019050919050565b6000610212826101e4565b9150819050919050565b600082825260208201905092915050565b7f4661696c656420746f2073656e64204574686572000000000000000000000000600082015250565b600061026360148361021c565b915061026e8261022d565b602082019050919050565b6000602082019050818103600083015261029281610256565b905091905056fea26469706673582212204079e9d7aeb6bf524e8b4603cd3160adbd91d9ca53f533746c78807cb7f7ca4864736f6c63430008110033";

type MoveEthConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: MoveEthConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class MoveEth__factory extends ContractFactory {
  constructor(...args: MoveEthConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<MoveEth> {
    return super.deploy(overrides || {}) as Promise<MoveEth>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): MoveEth {
    return super.attach(address) as MoveEth;
  }
  override connect(signer: Signer): MoveEth__factory {
    return super.connect(signer) as MoveEth__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): MoveEthInterface {
    return new utils.Interface(_abi) as MoveEthInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): MoveEth {
    return new Contract(address, _abi, signerOrProvider) as MoveEth;
  }
}
