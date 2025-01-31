/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  IDeployFolioHelper,
  IDeployFolioHelperInterface,
} from "../../../../contracts/weiroll-helpers/DeployFolioHelper.sol/IDeployFolioHelper";

const _abi = [
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "deployer",
            type: "address",
          },
          {
            internalType: "address",
            name: "expectedTokenAddress",
            type: "address",
          },
          {
            components: [
              {
                internalType: "string",
                name: "name",
                type: "string",
              },
              {
                internalType: "string",
                name: "symbol",
                type: "string",
              },
              {
                internalType: "address[]",
                name: "assets",
                type: "address[]",
              },
              {
                internalType: "uint256[]",
                name: "amounts",
                type: "uint256[]",
              },
              {
                internalType: "uint256",
                name: "initialShares",
                type: "uint256",
              },
            ],
            internalType: "struct IFolio.FolioBasicDetails",
            name: "basicDetails",
            type: "tuple",
          },
          {
            components: [
              {
                internalType: "uint256",
                name: "auctionDelay",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "auctionLength",
                type: "uint256",
              },
              {
                components: [
                  {
                    internalType: "address",
                    name: "recipient",
                    type: "address",
                  },
                  {
                    internalType: "uint96",
                    name: "portion",
                    type: "uint96",
                  },
                ],
                internalType: "struct IFolio.FeeRecipient[]",
                name: "feeRecipients",
                type: "tuple[]",
              },
              {
                internalType: "uint256",
                name: "tvlFee",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "mintFee",
                type: "uint256",
              },
              {
                internalType: "string",
                name: "mandate",
                type: "string",
              },
            ],
            internalType: "struct IFolio.FolioAdditionalDetails",
            name: "additionalDetails",
            type: "tuple",
          },
          {
            components: [
              {
                internalType: "address[]",
                name: "existingTradeProposers",
                type: "address[]",
              },
              {
                internalType: "address[]",
                name: "tradeLaunchers",
                type: "address[]",
              },
              {
                internalType: "address[]",
                name: "vibesOfficers",
                type: "address[]",
              },
            ],
            internalType: "struct GovRoles",
            name: "govRoles",
            type: "tuple",
          },
          {
            internalType: "bool",
            name: "isGoverned",
            type: "bool",
          },
          {
            internalType: "contract IVotes",
            name: "stToken",
            type: "address",
          },
          {
            internalType: "address",
            name: "owner",
            type: "address",
          },
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
                internalType: "address[]",
                name: "guardians",
                type: "address[]",
              },
            ],
            internalType: "struct IGovernanceDeployer.GovParams",
            name: "ownerGovParams",
            type: "tuple",
          },
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
                internalType: "address[]",
                name: "guardians",
                type: "address[]",
              },
            ],
            internalType: "struct IGovernanceDeployer.GovParams",
            name: "tradingGovParams",
            type: "tuple",
          },
        ],
        internalType: "struct DeployFolioConfig",
        name: "config",
        type: "tuple",
      },
    ],
    name: "deployFolio",
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

export class IDeployFolioHelper__factory {
  static readonly abi = _abi;
  static createInterface(): IDeployFolioHelperInterface {
    return new utils.Interface(_abi) as IDeployFolioHelperInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IDeployFolioHelper {
    return new Contract(address, _abi, signerOrProvider) as IDeployFolioHelper;
  }
}
