import { Token, TokenQuantity } from '../entities/Token'
import { Planner } from '../tx-gen/Planner'
import { Zapper2__factory, Zapper__factory } from '../contracts'
import { parseHexStringIntoBuffer } from '../base/utils'
import { Address } from '../base/Address'
import { Universe } from '../Universe'
import { TransactionRequest } from '@ethersproject/providers'
import {
  GovRolesStruct,
  IFolio,
  IGovernanceDeployer,
  ZapParamsStruct,
} from '../contracts/contracts/Zapper2'
import { ZapERC20ParamsStruct } from '../contracts/contracts/Zapper'
import { GAS_TOKEN_ADDRESS } from '../base/constants'
import { constants, ethers } from 'ethers'
import { DeployFolioConfig } from '../action/DeployFolioConfig'
import { folioDeployerAddress } from '../action/Folio'
import { ChainId } from '../configuration/ReserveAddresses'
import type { PromiseOrValue } from '../contracts/common'

export type ToTransactionArgs = Partial<{
  recipient?: Address
  dustRecipient?: Address
  slippage?: number
}>

export const encodeZapParamsStruct = (
  planner: Planner,
  input: TokenQuantity,
  outputToken: Address,
  minOutput: bigint,
  tokens: Token[],
  recipient: Address
): ZapParamsStruct => {
  const plan = planner.plan()
  return {
    tokenIn:
      input.token.address.address === GAS_TOKEN_ADDRESS
        ? constants.AddressZero
        : input.token.address.address,
    amountIn: input.amount,
    commands: plan.commands,
    state: plan.state,
    amountOut: minOutput,
    tokenOut: outputToken.address,
    tokens: tokens.map((i) => i.address.address),
    recipient: recipient.address,
  }
}
export const encodeZapERC20ParamsStruct = (
  planner: Planner,
  input: TokenQuantity,
  outputToken: Address,
  minOutput: bigint,
  tokens: Token[]
): ZapERC20ParamsStruct => {
  const plan = planner.plan()
  return {
    tokenIn: input.token.address.address,
    amountIn: input.amount,
    commands: plan.commands,
    state: plan.state,
    amountOut: minOutput,
    tokenOut: outputToken.address,
    tokens: tokens.map((i) => i.address.address),
  }
}

const zapperInterface = Zapper__factory.createInterface()
const zapper2Interface = Zapper2__factory.createInterface()

export const encodeZapper2Calldata = (
  universe: Universe,
  payload: ZapParamsStruct,
  options: { deployFolio?: DeployFolioConfig }
) => {
  const config = options.deployFolio

  if (config) {
    const basicDetails: IFolio.FolioBasicDetailsStruct =
      config.basicDetails.serialize()
    const additionalDetails: IFolio.FolioAdditionalDetailsStruct =
      config.additionalDetails.serialize()
    const owner =
      config.governance.type === 'governed'
        ? ethers.constants.AddressZero
        : config.governance.owner.address

    const stToken =
      config.governance.type === 'governed'
        ? config.governance.stToken.address.address
        : ethers.constants.AddressZero

    const emptyGovParams = {
      votingDelay: 0n,
      votingPeriod: 0n,
      proposalThreshold: 0n,
      quorumPercent: 0n,
      timelockDelay: 0n,
      guardians: [],
    }

    const ownerGovParams =
      config.governance.type === 'governed'
        ? config.governance.ownerGovParams.serialize()
        : emptyGovParams
    const tradingGovParams =
      config.governance.type === 'governed'
        ? config.governance.tradingGovParams.serialize()
        : emptyGovParams

    // deployer: PromiseOrValue<string>
    // basicDetails: IFolio.FolioBasicDetailsStruct
    // additionalDetails: IFolio.FolioAdditionalDetailsStruct
    // govRoles: GovRolesStruct
    // isGoverned: PromiseOrValue<boolean>
    // stToken: PromiseOrValue<string>
    // owner: PromiseOrValue<string>
    // ownerGovParams: IGovernanceDeployer.GovParamsStruct
    // tradingGovParams: IGovernanceDeployer.GovParamsStruct

    const deployerContractAddress =
      folioDeployerAddress[universe.chainId as ChainId].deployer.address

    return zapper2Interface.encodeFunctionData('zapDeploy', [
      payload,
      {
        deployer: deployerContractAddress,
        basicDetails: basicDetails as IFolio.FolioBasicDetailsStruct,
        additionalDetails:
          additionalDetails as IFolio.FolioAdditionalDetailsStruct,
        govRoles: {
          existingTradeProposers: config.existingTradeProposers.map(
            (i) => i.address
          ),
          tradeLaunchers: config.tradeLaunchers.map((i) => i.address),
          vibesOfficers: config.vibesOfficers.map((i) => i.address),
        } as GovRolesStruct,
        isGoverned: config.governance.type === 'governed',
        stToken: stToken,
        owner: owner,
        ownerGovParams: ownerGovParams,
        tradingGovParams: tradingGovParams,
      },
    ])
  }
  return zapper2Interface.encodeFunctionData('zap', [payload])
}
export const encodeZapperCalldata = (
  payload: ZapERC20ParamsStruct,
  options: { ethInput: boolean }
) => {
  const data = options.ethInput
    ? zapperInterface.encodeFunctionData('zapETH', [payload])
    : zapperInterface.encodeFunctionData('zapERC20', [payload])

  return data
}

export const encodeTx = (
  universe: Universe,
  signer: Address,
  value: bigint,
  data: string,
  gasNeeded: bigint
) => {
  let tx = {
    to: universe.zapperAddress.address,
    data,
    gasLimit: gasNeeded,
    chainId: universe.chainId,
    value,
    from: signer.address,
  } as TransactionRequest

  tx = {
    ...tx,
    type: 2,
    maxFeePerGas: universe.gasPrice + universe.gasPrice / 12n,
  }
  return tx
}
