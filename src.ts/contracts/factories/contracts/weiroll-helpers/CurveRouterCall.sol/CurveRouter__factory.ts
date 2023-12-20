/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  CurveRouter,
  CurveRouterInterface,
} from "../../../../contracts/weiroll-helpers/CurveRouterCall.sol/CurveRouter";

const _abi = [
  {
    inputs: [
      {
        internalType: "address[9]",
        name: "_route",
        type: "address[9]",
      },
      {
        internalType: "uint256[3][4]",
        name: "_swap_params",
        type: "uint256[3][4]",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_expected",
        type: "uint256",
      },
      {
        internalType: "address[4]",
        name: "_pools",
        type: "address[4]",
      },
    ],
    name: "exchange_multiple",
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

export class CurveRouter__factory {
  static readonly abi = _abi;
  static createInterface(): CurveRouterInterface {
    return new utils.Interface(_abi) as CurveRouterInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): CurveRouter {
    return new Contract(address, _abi, signerOrProvider) as CurveRouter;
  }
}
