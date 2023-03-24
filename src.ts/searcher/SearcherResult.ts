import { ethers } from 'ethers'

import {
  DestinationOptions,
  type Action,
  InteractionConvention,
} from '../action/Action'
import { type ContractCall } from '../base/ContractCall'
import { type Approval } from '../base/Approval'
import { type Address } from '../base/Address'
import { SwapPaths } from '../searcher/Swap'
import { type Token, type TokenQuantity } from '../entities/Token'
import { type Universe } from '../Universe'
import { parseHexStringIntoBuffer } from '../base/utils'
import {
  TransactionBuilder,
  zapperExecutorInterface,
  zapperInterface,
} from './TransactionBuilder'
import { ZapTransaction } from './ZapTransaction'
import { PermitTransferFrom } from '@uniswap/permit2-sdk'

class Step {
  constructor(
    readonly inputs: TokenQuantity[],
    readonly action: Action,
    readonly destination: Address
  ) {}
}

const linearize = (executor: Address, tokenExchange: SwapPaths): Step[] => {
  const out: Step[] = []
  for (const groupOfSwaps of tokenExchange.swapPaths) {
    const endDest = groupOfSwaps.destination
    for (let i = 0; i < groupOfSwaps.steps.length; i++) {
      const step = groupOfSwaps.steps[i]
      const hasNext = groupOfSwaps.steps[i + 1] != null
      let nextAddr = !hasNext ? endDest : executor

      // If this step supports sending funds to a destination, and the next step requires pay before call
      // we will point the output of this to next
      if (
        step.action.proceedsOptions === DestinationOptions.Recipient &&
        groupOfSwaps.steps[i + 1]?.action.interactionConvention ===
          InteractionConvention.PayBeforeCall
      ) {
        nextAddr = groupOfSwaps.steps[i + 1].action.address
      }

      out.push(new Step(step.input, step.action, nextAddr))
    }
  }
  return out
}

export class SearcherResult {
  constructor(
    readonly universe: Universe,
    public readonly swaps: SwapPaths,
    public readonly signer: Address,
    public readonly rToken: Token
  ) {}

  describe() {
    return this.swaps.describe()
  }

  private async encodeActions(steps: Step[]): Promise<ContractCall[]> {
    const blockBuilder = new TransactionBuilder(this.universe)

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]
      if (
        step.action.interactionConvention ===
        InteractionConvention.CallbackBased
      ) {
        const rest = await this.encodeActions(steps.slice(i + 1))
        const encoding = parseHexStringIntoBuffer(
          zapperExecutorInterface.encodeFunctionData('execute', [
            rest.map((i) => ({
              to: i.to.address,
              value: i.value,
              data: i.payload,
            })),
          ])
        )
        blockBuilder.addCall(
          await step.action.encode(step.inputs, step.destination, encoding)
        )
      } else {
        blockBuilder.addCall(
          await step.action.encode(step.inputs, step.destination)
        )
      }
    }
    return blockBuilder.contractCalls
  }

  async toTransaction(
    options: Partial<{
      returnDust: boolean
      permit2: {
        permit: PermitTransferFrom
        signature: string
      }
    }> = {
      returnDust: false,
    }
  ) {
    const executorAddress = this.universe.config.addresses.executorAddress
    const inputIsNativeToken =
      this.swaps.inputs[0].token === this.universe.nativeToken
    const builder = new TransactionBuilder(this.universe)

    const allApprovals: Approval[] = []
    const potentialResidualTokens = new Set<Token>()

    for (const block of this.swaps.swapPaths) {
      for (const swap of block.steps) {
        if (
          swap.action.interactionConvention ===
          InteractionConvention.ApprovalRequired
        ) {
          allApprovals.push(...swap.action.approvals)
        }
        if (swap.input.length > 1) {
          swap.input.forEach((t) => potentialResidualTokens.add(t.token))
        }
      }
    }

    const approvalNeeded: Approval[] = []
    await Promise.all(
      allApprovals.map(async (i) => {
        if (
          await this.universe.approvalStore.needsApproval(
            i.token,
            executorAddress,
            i.spender
          )
        ) {
          approvalNeeded.push(i)
        }
      })
    )
    if (approvalNeeded.length !== 0) {
      builder.setupApprovals(approvalNeeded)
    }

    const steps = linearize(executorAddress, this.swaps)
    for (const encodedSubCall of await this.encodeActions(steps)) {
      builder.addCall(encodedSubCall)
    }

    if (options.returnDust) {
      builder.drainERC20([...potentialResidualTokens], this.signer)
    }

    let inputToken = this.swaps.inputs[0].token
    if (this.universe.commonTokens.ERC20GAS == null) {
      throw new Error('Unexpected: Missing wrapped gas token')
    }
    inputToken =
      inputToken === this.universe.nativeToken
        ? this.universe.commonTokens.ERC20GAS
        : inputToken

    const amountOut = this.swaps.outputs.find(
      (output) => output.token === this.rToken
    )
    if (amountOut == null) {
      throw new Error('Unexpected: output does not contain RToken')
    }
    const payload = {
      tokenIn: inputToken.address.address,
      amountIn: this.swaps.inputs[0].amount,
      commands: builder.contractCalls.map((i) => i.encode()),
      amountOut: amountOut.amount,
      tokenOut: amountOut.token.address.address,
    }

    const value = inputIsNativeToken
      ? ethers.BigNumber.from(this.swaps.inputs[0].amount)
      : ethers.constants.Zero

    const data = inputIsNativeToken
      ? zapperInterface.encodeFunctionData('zapETH', [payload])
      : options.permit2 == null
      ? zapperInterface.encodeFunctionData('zapERC20', [payload])
      : zapperInterface.encodeFunctionData('zapERC20WithPermit2', [
          payload,
          options.permit2.permit,
          parseHexStringIntoBuffer(options.permit2.signature),
        ])

    const tx = {
      to: this.universe.config.addresses.zapperAddress.address,
      data,
      chainId: this.universe.chainId,

      // TODO: For optimism / arbitrum this needs updating to use type: 0 transactions
      type: 2,
      maxFeePerGas: ethers.BigNumber.from(
        this.universe.gasPrice + this.universe.gasPrice / 12n
      ),

      value,
      from: this.signer.address,
    }
    return new ZapTransaction(
      this.universe,
      payload,
      tx,
      builder.gasEstimate(),
      this.swaps.inputs[0],
      this.swaps.outputs,
      this
    )
  }
}
