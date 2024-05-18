/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  IFrxEthFraxOracle,
  IFrxEthFraxOracleInterface,
} from "../../../contracts/IFrxEthFraxOracle.sol/IFrxEthFraxOracle";

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
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "description",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
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
  {
    inputs: [
      {
        internalType: "uint80",
        name: "_roundId",
        type: "uint80",
      },
    ],
    name: "getRoundData",
    outputs: [
      {
        internalType: "uint80",
        name: "roundId",
        type: "uint80",
      },
      {
        internalType: "int256",
        name: "answer",
        type: "int256",
      },
      {
        internalType: "uint256",
        name: "startedAt",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "updatedAt",
        type: "uint256",
      },
      {
        internalType: "uint80",
        name: "answeredInRound",
        type: "uint80",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "latestRoundData",
    outputs: [
      {
        internalType: "uint80",
        name: "roundId",
        type: "uint80",
      },
      {
        internalType: "int256",
        name: "answer",
        type: "int256",
      },
      {
        internalType: "uint256",
        name: "startedAt",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "updatedAt",
        type: "uint256",
      },
      {
        internalType: "uint80",
        name: "answeredInRound",
        type: "uint80",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "version",
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

export class IFrxEthFraxOracle__factory {
  static readonly abi = _abi;
  static createInterface(): IFrxEthFraxOracleInterface {
    return new utils.Interface(_abi) as IFrxEthFraxOracleInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IFrxEthFraxOracle {
    return new Contract(address, _abi, signerOrProvider) as IFrxEthFraxOracle;
  }
}