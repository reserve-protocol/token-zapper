import {
  DestinationOptions,
  type Action,
  InteractionConvention,
} from '../action/Action'
import { type ContractCall } from '../base/ContractCall'
import { type Approval } from '../base/Approval'
import { type Address } from '../base/Address'
import { type ZapERC20ParamsStruct } from '../contracts/contracts/IZapper.sol/IZapper'
import { SwapPaths } from '../searcher/Swap'
import { type Token, type TokenQuantity } from '../entities/Token'
import { type Universe } from '../Universe'
import { parseHexStringIntoBuffer } from '../base/utils'
import {
  TransactionBuilder,
  zapperExecutorInterface,
  zapperInterface,
} from './TransactionBuilder'
import { ethers } from 'ethers'
import { ApprovalsStore } from './ApprovalsStore'

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

class ZapTransaction {
  constructor(
    private readonly universe: Universe,
    public readonly params: ZapERC20ParamsStruct,
    public readonly tx: ethers.providers.TransactionRequest,
    public readonly gas: bigint,
    public readonly input: TokenQuantity,
    public readonly output: TokenQuantity[],
    public readonly result: SearcherResult,
  ) {}

  get fee() {
    return this.universe.nativeToken.quantityFromBigInt(
      this.universe.gasPrice * this.gas
    )
  }

  toString() {
    return `ZapTransaction(input:${this.input.formatWithSymbol()},outputs:[${this.output
      .map((i) => i.formatWithSymbol())
      .join(', ')}],txFee:${this.fee.formatWithSymbol()})`
  }
}
export class SearcherResult {
  constructor(
    readonly universe: Universe,
    readonly approvals: ApprovalsStore,
    public readonly swaps: SwapPaths,
    public readonly signer: Address
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

  async toTransaction() {
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
          await this.approvals.needsApproval(
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

    builder.drainERC20([...potentialResidualTokens], this.signer)

    let inputToken = this.swaps.inputs[0].token
    if (this.universe.commonTokens.ERC20GAS == null) {
      throw new Error('..')
    }
    inputToken =
      inputToken === this.universe.nativeToken
        ? this.universe.commonTokens.ERC20GAS
        : inputToken
    const payload = {
      tokenIn: inputToken.address.address,
      amountIn: this.swaps.inputs[0].amount,
      commands: builder.contractCalls.map((i) => i.encode()),
      amountOut: this.swaps.outputs[0].amount,
      tokenOut: this.swaps.outputs[0].token.address.address,
    }
    const data = inputIsNativeToken
      ? zapperInterface.encodeFunctionData('zapETH', [payload])
      : zapperInterface.encodeFunctionData('zapERC20', [payload])
    const gas = (
      await this.universe.provider.estimateGas({
        to: this.universe.config.addresses.zapperAddress.address,
        data,
        value: inputIsNativeToken ? ethers.BigNumber.from(this.swaps.inputs[0].amount) : 0,
        from: this.signer.address,
      })
    ).toBigInt()

    const tx = {
      to: this.universe.config.addresses.zapperAddress.address,
      data,
      chainId: (await this.universe.provider.getNetwork()).chainId,

      // TODO: For optimism / arbitrum this needs updating to use type: 0 transactions
      type: 2,
      maxFeePerGas: ethers.BigNumber.from(
        this.universe.gasPrice + this.universe.gasPrice / 12n
      ),

      gasLimit: ethers.BigNumber.from(gas + gas / 100n),
      value: inputIsNativeToken ? ethers.BigNumber.from(this.swaps.inputs[0].amount) : 0,
      from: this.signer.address,
    }
    return new ZapTransaction(
      this.universe,
      payload,
      tx,
      gas,
      this.swaps.inputs[0],
      this.swaps.outputs,
      this
    )
  }
}
