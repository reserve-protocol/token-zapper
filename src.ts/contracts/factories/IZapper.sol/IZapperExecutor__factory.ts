/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  IZapperExecutor,
  IZapperExecutorInterface,
} from "../../IZapper.sol/IZapperExecutor";

const _abi = [
  {
    inputs: [
      {
        internalType: "contract IERC20[]",
        name: "tokens",
        type: "address[]",
      },
      {
        internalType: "address",
        name: "destination",
        type: "address",
      },
    ],
    name: "drainERC20s",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "bytes",
            name: "data",
            type: "bytes",
          },
          {
            internalType: "uint256",
            name: "value",
            type: "uint256",
          },
        ],
        internalType: "struct Call[]",
        name: "calls",
        type: "tuple[]",
      },
    ],
    name: "execute",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IERC20[]",
        name: "tokens",
        type: "address[]",
      },
      {
        internalType: "address[]",
        name: "spenders",
        type: "address[]",
      },
    ],
    name: "setupApprovals",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export class IZapperExecutor__factory {
  static readonly abi = _abi;
  static createInterface(): IZapperExecutorInterface {
    return new utils.Interface(_abi) as IZapperExecutorInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IZapperExecutor {
    return new Contract(address, _abi, signerOrProvider) as IZapperExecutor;
  }
}