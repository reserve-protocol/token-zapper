/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  IStaticAV3TokenLM,
  IStaticAV3TokenLMInterface,
} from "../../../contracts/ISAV3Token.sol/IStaticAV3TokenLM";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "assets",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "receiver",
        type: "address",
      },
      {
        internalType: "uint16",
        name: "referralCode",
        type: "uint16",
      },
      {
        internalType: "bool",
        name: "fromUnderlying",
        type: "bool",
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
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "rate",
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
    inputs: [
      {
        internalType: "uint256",
        name: "assets",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "receiver",
        type: "address",
      },
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "withdraw",
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

export class IStaticAV3TokenLM__factory {
  static readonly abi = _abi;
  static createInterface(): IStaticAV3TokenLMInterface {
    return new utils.Interface(_abi) as IStaticAV3TokenLMInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IStaticAV3TokenLM {
    return new Contract(address, _abi, signerOrProvider) as IStaticAV3TokenLM;
  }
}