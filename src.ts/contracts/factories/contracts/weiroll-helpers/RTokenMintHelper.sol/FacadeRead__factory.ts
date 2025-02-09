/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  FacadeRead,
  FacadeReadInterface,
} from "../../../../contracts/weiroll-helpers/RTokenMintHelper.sol/FacadeRead";

const _abi = [
  {
    inputs: [
      {
        internalType: "contract RToken",
        name: "rToken",
        type: "address",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "maxIssuable",
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

export class FacadeRead__factory {
  static readonly abi = _abi;
  static createInterface(): FacadeReadInterface {
    return new utils.Interface(_abi) as FacadeReadInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): FacadeRead {
    return new Contract(address, _abi, signerOrProvider) as FacadeRead;
  }
}
