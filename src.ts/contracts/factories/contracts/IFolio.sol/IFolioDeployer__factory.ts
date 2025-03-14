/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  IFolioDeployer,
  IFolioDeployerInterface,
} from "../../../contracts/IFolio.sol/IFolioDeployer";

const _abi = [
  {
    inputs: [],
    name: "FolioDeployer__LengthMismatch",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "folioOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "folio",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "folioAdmin",
        type: "address",
      },
    ],
    name: "FolioDeployed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "stToken",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "folio",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "ownerGovernor",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "ownerTimelock",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "tradingGovernor",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "tradingTimelock",
        type: "address",
      },
    ],
    name: "GovernedFolioDeployed",
    type: "event",
  },
  {
    inputs: [
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
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address[]",
        name: "auctionApprovers",
        type: "address[]",
      },
      {
        internalType: "address[]",
        name: "auctionLaunchers",
        type: "address[]",
      },
      {
        internalType: "address[]",
        name: "brandManagers",
        type: "address[]",
      },
      {
        internalType: "bytes32",
        name: "deploymentNonce",
        type: "bytes32",
      },
    ],
    name: "deployFolio",
    outputs: [
      {
        internalType: "address",
        name: "folio",
        type: "address",
      },
      {
        internalType: "address",
        name: "proxyAdmin",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IVotes",
        name: "stToken",
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
        internalType: "bytes32",
        name: "deploymentNonce",
        type: "bytes32",
      },
    ],
    name: "deployGovernedFolio",
    outputs: [
      {
        internalType: "address",
        name: "folio",
        type: "address",
      },
      {
        internalType: "address",
        name: "proxyAdmin",
        type: "address",
      },
      {
        internalType: "address",
        name: "ownerGovernor",
        type: "address",
      },
      {
        internalType: "address",
        name: "ownerTimelock",
        type: "address",
      },
      {
        internalType: "address",
        name: "tradingGovernor",
        type: "address",
      },
      {
        internalType: "address",
        name: "tradingTimelock",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "folioImplementation",
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
] as const;

export class IFolioDeployer__factory {
  static readonly abi = _abi;
  static createInterface(): IFolioDeployerInterface {
    return new utils.Interface(_abi) as IFolioDeployerInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IFolioDeployer {
    return new Contract(address, _abi, signerOrProvider) as IFolioDeployer;
  }
}
