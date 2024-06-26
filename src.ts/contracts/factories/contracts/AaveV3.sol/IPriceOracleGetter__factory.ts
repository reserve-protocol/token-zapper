/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  IPriceOracleGetter,
  IPriceOracleGetterInterface,
} from "../../../contracts/AaveV3.sol/IPriceOracleGetter";

const _abi = [
  {
    inputs: [],
    name: "BASE_CURRENCY",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "BASE_CURRENCY_UNIT",
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
        internalType: "address",
        name: "asset",
        type: "address",
      },
    ],
    name: "getAssetPrice",
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

export class IPriceOracleGetter__factory {
  static readonly abi = _abi;
  static createInterface(): IPriceOracleGetterInterface {
    return new utils.Interface(_abi) as IPriceOracleGetterInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IPriceOracleGetter {
    return new Contract(address, _abi, signerOrProvider) as IPriceOracleGetter;
  }
}
