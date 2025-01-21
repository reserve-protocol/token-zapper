/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  IGovernanceDeployer,
  IGovernanceDeployerInterface,
} from "../../../contracts/IFolio.sol/IGovernanceDeployer";

const _abi = [
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint48",
            name: "votingDelay",
            type: "uint48",
          },
          {
            internalType: "uint32",
            name: "votingPeriod",
            type: "uint32",
          },
          {
            internalType: "uint256",
            name: "proposalThreshold",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "quorumPercent",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "timelockDelay",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "guardian",
            type: "address",
          },
        ],
        internalType: "struct IGovernanceDeployer.GovParams",
        name: "govParams",
        type: "tuple",
      },
      {
        internalType: "contract IVotes",
        name: "stToken",
        type: "address",
      },
    ],
    name: "deployGovernanceWithTimelock",
    outputs: [
      {
        internalType: "address",
        name: "governor",
        type: "address",
      },
      {
        internalType: "address",
        name: "timelock",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export class IGovernanceDeployer__factory {
  static readonly abi = _abi;
  static createInterface(): IGovernanceDeployerInterface {
    return new utils.Interface(_abi) as IGovernanceDeployerInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IGovernanceDeployer {
    return new Contract(address, _abi, signerOrProvider) as IGovernanceDeployer;
  }
}
