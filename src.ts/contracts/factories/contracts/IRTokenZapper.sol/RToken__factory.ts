/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  RToken,
  RTokenInterface,
} from "../../../contracts/IRTokenZapper.sol/RToken";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "issueTo",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export class RToken__factory {
  static readonly abi = _abi;
  static createInterface(): RTokenInterface {
    return new utils.Interface(_abi) as RTokenInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): RToken {
    return new Contract(address, _abi, signerOrProvider) as RToken;
  }
}
