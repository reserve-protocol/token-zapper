/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  ICurveRouter,
  ICurveRouterInterface,
} from "../../../../contracts/weiroll-helpers/CurveRouterCall.sol/ICurveRouter";

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

export class ICurveRouter__factory {
  static readonly abi = _abi;
  static createInterface(): ICurveRouterInterface {
    return new utils.Interface(_abi) as ICurveRouterInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ICurveRouter {
    return new Contract(address, _abi, signerOrProvider) as ICurveRouter;
  }
}