/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  IAsset,
  IAssetInterface,
} from "../../../contracts/IAssetRegistry.sol/IAsset";

const _abi = [
  {
    inputs: [],
    name: "price",
    outputs: [
      {
        components: [
          {
            internalType: "uint192",
            name: "low",
            type: "uint192",
          },
          {
            internalType: "uint192",
            name: "high",
            type: "uint192",
          },
        ],
        internalType: "struct Price",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export class IAsset__factory {
  static readonly abi = _abi;
  static createInterface(): IAssetInterface {
    return new utils.Interface(_abi) as IAssetInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): IAsset {
    return new Contract(address, _abi, signerOrProvider) as IAsset;
  }
}