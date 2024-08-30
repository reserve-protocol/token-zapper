/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  PreventSelfDestruct,
  PreventSelfDestructInterface,
} from "../../../contracts/SelfDestruct.sol/PreventSelfDestruct";

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
] as const;

export class PreventSelfDestruct__factory {
  static readonly abi = _abi;
  static createInterface(): PreventSelfDestructInterface {
    return new utils.Interface(_abi) as PreventSelfDestructInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): PreventSelfDestruct {
    return new Contract(address, _abi, signerOrProvider) as PreventSelfDestruct;
  }
}
