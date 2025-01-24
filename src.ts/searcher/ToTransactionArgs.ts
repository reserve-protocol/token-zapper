import { Token, TokenQuantity } from '../entities/Token'
import { Planner } from '../tx-gen/Planner'
import { Zapper2__factory, Zapper__factory } from '../contracts'
import { parseHexStringIntoBuffer } from '../base/utils'
import { Address } from '../base/Address'
import { Universe } from '../Universe'
import { TransactionRequest } from '@ethersproject/providers'
import { ZapParamsStruct } from '../contracts/contracts/Zapper2'
import { ZapERC20ParamsStruct } from '../contracts/contracts/Zapper'

export type ToTransactionArgs = Partial<{
  recipient?: Address
  dustRecipient?: Address
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
    tokenIn: input.token.address.address,
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
  payload: ZapParamsStruct,
  options: { isDeployZap: boolean }
) => {
  const data = options.isDeployZap
    ? zapper2Interface.encodeFunctionData('zapDeploy', [payload])
    : zapper2Interface.encodeFunctionData('zap', [payload])

  return data
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
