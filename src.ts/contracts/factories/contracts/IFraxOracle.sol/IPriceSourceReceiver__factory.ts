/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  IPriceSourceReceiver,
  IPriceSourceReceiverInterface,
} from "../../../contracts/IFraxOracle.sol/IPriceSourceReceiver";

const _abi = [
  {
    inputs: [
      {
        internalType: "bool",
        name: "isBadData",
        type: "bool",
      },
      {
        internalType: "uint104",
        name: "priceLow",
        type: "uint104",
      },
      {
        internalType: "uint104",
        name: "priceHigh",
        type: "uint104",
      },
      {
        internalType: "uint40",
        name: "timestamp",
        type: "uint40",
      },
    ],
    name: "addRoundData",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getPrices",
    outputs: [
      {
        internalType: "bool",
        name: "isBadData",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "priceLow",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "priceHigh",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export class IPriceSourceReceiver__factory {
  static readonly abi = _abi;
  static createInterface(): IPriceSourceReceiverInterface {
    return new utils.Interface(_abi) as IPriceSourceReceiverInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IPriceSourceReceiver {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as IPriceSourceReceiver;
  }
}
