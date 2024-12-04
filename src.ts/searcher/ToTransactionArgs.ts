import { Token, TokenQuantity } from '../entities/Token'
import { Planner } from '../tx-gen/Planner'
import { ZapERC20ParamsStruct } from '../contracts/contracts/Zapper.sol/Zapper'
import { Zapper__factory } from '../contracts'
import { parseHexStringIntoBuffer } from '../base/utils'
import { Address } from '../base/Address'
import { Universe } from '../Universe'
import { TransactionRequest } from '@ethersproject/providers'

export type ToTransactionArgs = Partial<{
  returnDust: boolean
  maxIssueance?: boolean
  outputSlippage?: bigint
  internalTradeSlippage?: bigint
  gasLimit?: number
  permit2: {
    permit?: any
    signature: string
  }

  enableTradeZaps?: boolean
  minSearchTime?: number

  endPosition?: Token
}>

export const encodeProgramToZapERC20Params = (
  planner: Planner,
  input: TokenQuantity,
  outputTokenOutput: TokenQuantity,
  tokens: Token[]
): ZapERC20ParamsStruct => {
  const plan = planner.plan()
  return {
    tokenIn: input.token.address.address,
    amountIn: input.amount,
    commands: plan.commands,
    state: plan.state,
    amountOut: outputTokenOutput.amount,
    tokenOut: outputTokenOutput.token.address.address,
    tokens: tokens.map((i) => i.address.address),
  }
}

const zapperInterface = Zapper__factory.createInterface()

export const encodeCalldata = (payload: ZapERC20ParamsStruct) => {
  return payload.tokenIn === '0x0000000000000000000000000000000000000000'
    ? zapperInterface.encodeFunctionData('zapETH', [payload])
    : zapperInterface.encodeFunctionData('zapERC20', [payload])
}

export const encodePermit2Calldata = (
  payload: ZapERC20ParamsStruct,
  permit: any,
  signature: string
) => {
  return zapperInterface.encodeFunctionData('zapERC20WithPermit2', [
    payload,
    permit,
    parseHexStringIntoBuffer(signature),
  ])
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
