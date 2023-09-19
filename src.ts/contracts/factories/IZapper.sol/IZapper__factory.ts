/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IZapper, IZapperInterface } from "../../IZapper.sol/IZapper";

const _abi = [
  {
    inputs: [
      {
        components: [
          {
            internalType: "contract IERC20",
            name: "tokenIn",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "amountIn",
            type: "uint256",
          },
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
            name: "commands",
            type: "tuple[]",
          },
          {
            internalType: "uint256",
            name: "amountOut",
            type: "uint256",
          },
          {
            internalType: "contract IERC20",
            name: "tokenOut",
            type: "address",
          },
        ],
        internalType: "struct ZapERC20Params",
        name: "params",
        type: "tuple",
      },
    ],
    name: "zapERC20",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "contract IERC20",
            name: "tokenIn",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "amountIn",
            type: "uint256",
          },
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
            name: "commands",
            type: "tuple[]",
          },
          {
            internalType: "uint256",
            name: "amountOut",
            type: "uint256",
          },
          {
            internalType: "contract IERC20",
            name: "tokenOut",
            type: "address",
          },
        ],
        internalType: "struct ZapERC20Params",
        name: "params",
        type: "tuple",
      },
      {
        components: [
          {
            components: [
              {
                internalType: "address",
                name: "token",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "amount",
                type: "uint256",
              },
            ],
            internalType: "struct TokenPermissions",
            name: "permitted",
            type: "tuple",
          },
          {
            internalType: "uint256",
            name: "nonce",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "deadline",
            type: "uint256",
          },
        ],
        internalType: "struct PermitTransferFrom",
        name: "permit",
        type: "tuple",
      },
      {
        internalType: "bytes",
        name: "signature",
        type: "bytes",
      },
    ],
    name: "zapERC20WithPermit2",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "contract IERC20",
            name: "tokenIn",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "amountIn",
            type: "uint256",
          },
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
            name: "commands",
            type: "tuple[]",
          },
          {
            internalType: "uint256",
            name: "amountOut",
            type: "uint256",
          },
          {
            internalType: "contract IERC20",
            name: "tokenOut",
            type: "address",
          },
        ],
        internalType: "struct ZapERC20Params",
        name: "params",
        type: "tuple",
      },
    ],
    name: "zapETH",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
] as const;

export class IZapper__factory {
  static readonly abi = _abi;
  static createInterface(): IZapperInterface {
    return new utils.Interface(_abi) as IZapperInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IZapper {
    return new Contract(address, _abi, signerOrProvider) as IZapper;
  }
}