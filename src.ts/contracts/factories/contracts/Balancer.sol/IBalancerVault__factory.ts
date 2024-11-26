/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  IBalancerVault,
  IBalancerVaultInterface,
} from "../../../contracts/Balancer.sol/IBalancerVault";

const _abi = [
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "poolId",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "getPoolTokenInfo",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "cash",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "managed",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "lastChangeBlock",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "assetManager",
            type: "address",
          },
        ],
        internalType: "struct IBalancerVault.PoolTokenInfo",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "bytes32",
            name: "poolId",
            type: "bytes32",
          },
          {
            internalType: "enum IBalancerVault.SwapKind",
            name: "kind",
            type: "uint8",
          },
          {
            internalType: "address",
            name: "assetIn",
            type: "address",
          },
          {
            internalType: "address",
            name: "assetOut",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "userData",
            type: "bytes",
          },
        ],
        internalType: "struct IBalancerVault.SingleSwap",
        name: "singleSwap",
        type: "tuple",
      },
      {
        components: [
          {
            internalType: "address",
            name: "sender",
            type: "address",
          },
          {
            internalType: "bool",
            name: "fromInternalBalance",
            type: "bool",
          },
          {
            internalType: "address payable",
            name: "recipient",
            type: "address",
          },
          {
            internalType: "bool",
            name: "toInternalBalance",
            type: "bool",
          },
        ],
        internalType: "struct IBalancerVault.FundManagement",
        name: "funds",
        type: "tuple",
      },
      {
        internalType: "uint256",
        name: "limit",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
    ],
    name: "swap",
    outputs: [
      {
        internalType: "uint256",
        name: "amountCalculated",
        type: "uint256",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
] as const;

export class IBalancerVault__factory {
  static readonly abi = _abi;
  static createInterface(): IBalancerVaultInterface {
    return new utils.Interface(_abi) as IBalancerVaultInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IBalancerVault {
    return new Contract(address, _abi, signerOrProvider) as IBalancerVault;
  }
}
