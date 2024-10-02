/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  ETHTokenVault,
  ETHTokenVaultInterface,
} from "../../../contracts/IERC4626.sol/ETHTokenVault";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "receiver",
        type: "address",
      },
    ],
    name: "deposit",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "previewDeposit",
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
] as const;

export class ETHTokenVault__factory {
  static readonly abi = _abi;
  static createInterface(): ETHTokenVaultInterface {
    return new utils.Interface(_abi) as ETHTokenVaultInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ETHTokenVault {
    return new Contract(address, _abi, signerOrProvider) as ETHTokenVault;
  }
}
