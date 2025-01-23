import { Token, TokenQuantity } from '../entities/Token'
import { Planner } from '../tx-gen/Planner'
import { Zapper2__factory } from '../contracts'
import { parseHexStringIntoBuffer } from '../base/utils'
import { Address } from '../base/Address'
import { Universe } from '../Universe'
import { TransactionRequest } from '@ethersproject/providers'
import { ZapParamsStruct } from '../contracts/contracts/Zapper2'

export type ToTransactionArgs = Partial<{
  recipient?: Address
  dustRecipient?: Address
}>

export const encodeProgramToZapERC20Params = (
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

const zapperInterface = Zapper2__factory.createInterface()

export const encodeCalldata = (
  payload: ZapParamsStruct,
  options: { isDeployZap: boolean }
) => {
  const data = options.isDeployZap
    ? zapperInterface.encodeFunctionData('zapDeploy', [payload])
    : zapperInterface.encodeFunctionData('zap', [payload])

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
    to: universe.config.addresses.zapperAddress.address,
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
