import { BigNumber } from '@ethersproject/bignumber'
import { TransactionRequest } from '@ethersproject/providers'
import { constants, ethers } from 'ethers'
import { ParamType, defaultAbiCoder, formatEther } from 'ethers/lib/utils'
import {
  BaseAction,
  DestinationOptions,
  InteractionConvention,
  plannerUtils,
} from '../action/Action'
import { Address } from '../base/Address'
import { Approval } from '../base/Approval'
import { parseHexStringIntoBuffer } from '../base/utils'
import {
  EthBalance__factory,
  IERC20__factory,
  ZapperExecutor__factory,
  Zapper__factory,
} from '../contracts'
import {
  ZapERC20ParamsStruct,
  ZapperOutputStructOutput,
} from '../contracts/contracts/Zapper.sol/Zapper'
import { type Token, type TokenQuantity } from '../entities/Token'
import { TokenAmounts } from '../entities/TokenAmounts'
import { SwapPath, SwapPaths, type SingleSwap } from '../searcher/Swap'
import {
  Contract,
  LiteralValue,
  Planner,
  Value,
  printPlan,
} from '../tx-gen/Planner'
import { type UniverseWithERC20GasTokenDefined } from './UniverseWithERC20GasTokenDefined'
import { ZapTransaction, ZapTxStats } from './ZapTransaction'
import { DefaultMap } from '../base/DefaultMap'
import { ToTransactionArgs } from './ToTransactionArgs'
import { simulationUrls } from '../base/constants'

const zapperInterface = Zapper__factory.createInterface()
interface SimulateParams {
  data: string
  value: bigint
  quantity: bigint
  inputToken: Token
  gasLimit?: number
}

class Step {
  constructor(
    readonly inputs: TokenQuantity[],
    readonly action: BaseAction,
    readonly destination: Address,
    readonly outputs: TokenQuantity[]
  ) {}
}

const linearize = (executor: Address, tokenExchange: SwapPaths) => {
  const out: Step[] = []
  const allApprovals: Approval[] = []
  const balances = new TokenAmounts()
  balances.addQtys(tokenExchange.inputs)

  const recourseOn = (
    node: SwapPath | SingleSwap,
    nextDestination: Address
  ) => {
    if (node.type === 'SingleSwap') {
      balances.exchange(node.inputs, node.outputs)
      out.push(
        new Step(node.inputs, node.action, nextDestination, node.outputs)
      )

      for (const approval of node.action.approvals) {
        allApprovals.push(approval)
      }
      return
    }
    for (let i = 0; i < node.steps.length; i++) {
      const step = node.steps[i]
      const hasNext = node.steps[i + 1] != null
      let nextAddr = !hasNext ? nextDestination : executor
      if (
        step.proceedsOptions === DestinationOptions.Recipient &&
        node.steps[i + 1]?.interactionConvention ===
          InteractionConvention.PayBeforeCall
      ) {
        nextAddr = node.steps[i + 1].address
      }
      recourseOn(step, nextAddr)
    }
  }

  for (const groupOfSwaps of tokenExchange.swapPaths) {
    const endDest = groupOfSwaps.destination
    recourseOn(groupOfSwaps, endDest)
  }

  return [out, balances, allApprovals] as const
}
export class ThirdPartyIssue extends Error {
  constructor(public readonly msg: string) {
    super(msg)
  }
}
export abstract class BaseSearcherResult {
  protected readonly planner = new Planner()
  public readonly blockNumber: number
  public readonly commands: Step[]
  public readonly potentialResidualTokens: Token[]
  public readonly allApprovals: Approval[]
  public readonly inputToken: Token
  public readonly inputIsNative: boolean

  toId() {
    return this.describe().join('\n')
  }

  constructor(
    readonly universe: UniverseWithERC20GasTokenDefined,
    readonly userInput: TokenQuantity,
    public swaps: SwapPaths,
    public readonly signer: Address,
    public readonly outputToken: Token
  ) {
    if (this.universe.commonTokens.ERC20GAS == null) {
      throw new Error('Unexpected: Missing wrapped gas token')
    }
    const inputToken =
      this.swaps.inputs[0].token === this.universe.nativeToken
        ? this.universe.commonTokens.ERC20GAS
        : this.swaps.inputs[0].token

    this.inputToken = inputToken

    this.blockNumber = universe.currentBlock
    const potentialResidualTokens = new Set<Token>()
    const executorAddress = this.universe.config.addresses.executorAddress

    const [steps, , allApprovals] = linearize(executorAddress, this.swaps)
    this.allApprovals = allApprovals
    this.commands = steps
    for (const step of steps) {
      for (const qty of step.inputs) {
        if (qty.token === this.universe.nativeToken) {
          continue
        }
        potentialResidualTokens.add(qty.token)
      }
      for (const qty of step.outputs) {
        if (qty.token === this.universe.nativeToken) {
          continue
        }
        potentialResidualTokens.add(qty.token)
      }
    }

    this.potentialResidualTokens = [...potentialResidualTokens]

    this.inputIsNative = this.userInput.token === this.universe.nativeToken
  }

  describe() {
    return this.swaps.describe()
  }

  public async valueOfDust() {
    let sum = this.universe.usd.zero
    await Promise.all(
      this.swaps.outputs.map(async (out) => {
        if (out.token === this.outputToken) {
          return
        }
        const price =
          (await this.universe.fairPrice(out)) ?? this.universe.usd.zero
        sum = sum.add(price)
      })
    )
    return sum
  }

  async simulateNoNode({ data, value }: SimulateParams) {
    try {
      const resp = await this.universe.provider.send('eth_call', [
        {
          data,
          from: this.signer.address,
          to: this.universe.config.addresses.zapperAddress.address,
          value: '0x' + value.toString(16),
        },
        'latest',
        {
          [this.signer.address]: {
            balance:
              '0x' + ethers.utils.parseEther('10000').toBigInt().toString(16),
          },
        },
      ])
      try {
        return zapperInterface.decodeFunctionResult('zapERC20', resp)
          .out as ZapperOutputStructOutput
      } catch (e) {
        // console.log(
        //   {
        //     data,
        //     from: this.signer.address,
        //     to: this.universe.config.addresses.zapperAddress.address,
        //     value: value.toString(16),
        //   },
        //   'latest',
        //   {
        //     [this.signer.address]: {
        //       balance: ethers.utils.parseEther('10000').toHexString(),
        //     },
        //   }
        // )
        // console.log(resp)
      }
      if (resp.startsWith('0x08c379a0')) {
        const data = resp.slice(138)
        const msg = Buffer.from(data, 'hex').toString()
        throw new Error(msg)
      } else {
        for (let i = 10; i < resp.length; i += 128) {
          const len = BigInt('0x' + resp.slice(i, i + 64))
          if (len != 0n && len < 256n) {
            const data = resp.slice(i + 64, i + 64 + Number(len) * 2)
            const msg = Buffer.from(data, 'hex').toString()
            throw new Error(msg)
          }
        }
      }
      throw new Error('Unknonw error: ' + resp)
    } catch (e: any) {
      // console.log(e)
      if (e.message.includes('LPStakingTime')) {
        console.error('Stargate staking contract out of funds.. Aborting')
        throw new ThirdPartyIssue('Stargate out of funds')
      }

      console.log(
        'error:',
        e.message,
        'Failing program:',
        printPlan(this.planner, this.universe)
          .map((i) => '  ' + i)
          .join('\n')
      )
    }

    // console.log(
    //   JSON.stringify({
    //     data,
    //     value: value.toString(),
    //     address: this.universe.zapperAddress.address,
    //     from: this.signer.address,
    //     block: this.blockNumber,
    //   })
    // )
    throw new Error('Failed to simulate')
  }

  async simulate({
    data,
    value,
    quantity,
    inputToken,
    gasLimit = 10000000,
  }: SimulateParams) {
    const url = simulationUrls[this.universe.chainId]

    if (url == null) {
      return this.simulateNoNode({
        data,
        value,
        quantity,
        inputToken,
        gasLimit,
      })
    }
    try {
      const overrides = {}

      const body = JSON.stringify(
        {
          from: this.signer.address,
          to: this.universe.config.addresses.zapperAddress.address,
          data,
          quantity: '0x' + quantity.toString(16),
          gasLimit,
          value: '0x' + value.toString(16),
          token: inputToken.address.address,
          overrides,
        },
        null,
        1
      )

      return await (
        await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body,
        })
      )
        .json()
        .then((a: { data: string; error?: string }) => {
          // console.log(a)
          if (a.error != null) {
            throw new Error(a.error)
          }
          if (a.data.startsWith('0x08c379a0')) {
            const length = BigInt('0x' + a.data.slice(10, 74))
            const data = a.data.slice(74, 74 + Number(length) * 2)
            const msg = Buffer.from(data, 'hex').toString()
            throw new Error(msg)
          }
          if (a.data === '0xundefined') {
            throw new Error('Failed to simulate')
          }
          const out = zapperInterface.decodeFunctionResult('zapERC20', a.data)
            .out as ZapperOutputStructOutput
          // console.log(out)
          return out
        })
    } catch (e) {
      // console.log(e)
      return this.simulateNoNode({
        data,
        value,
        quantity,
        inputToken,
        gasLimit,
      })
    }
  }

  protected async simulateAndParse(options: ToTransactionArgs, data: string) {
    const zapperResult = await this.simulate({
      data,
      value: this.value,
      quantity: this.userInput.amount,
      inputToken: this.inputToken,
    })

    const dustQuantities = zapperResult.dust
      .map((qty, index) => this.potentialResidualTokens[index].from(qty))
      .filter((i) => i.token !== this.outputToken && i.amount !== 0n)

    const amount = zapperResult.amountOut.toBigInt()
    const rounding = 10n ** BigInt(this.outputToken.decimals / 2)

    const outputTokenOutput = this.outputToken.from(
      (amount / rounding) * rounding
    )
    const [valueOfOut, ...dustValues] = await Promise.all([
      this.universe.fairPrice(outputTokenOutput),
      ...dustQuantities.map(
        async (i) => [await this.universe.fairPrice(i), i] as const
      ),
    ])

    let valueOfDust = this.universe.usd.zero
    for (const [usdValue] of dustValues) {
      if (usdValue == null) {
        // console.info(`Failed to find a price for ${dustQuantity}`)
        continue
      }
      valueOfDust = valueOfDust.add(usdValue)
    }

    const simulatedOutputs = [...dustQuantities, outputTokenOutput]
    const totalValue = valueOfOut?.add(valueOfDust) ?? valueOfDust

    const gasUsed = zapperResult.gasUsed.toBigInt()
    return {
      gasUsed: gasUsed + 100000n + gasUsed / 10n,
      simulatedOutputs,
      totalValue,
      swaps: new SwapPaths(
        this.universe,
        this.swaps.inputs,
        this.swaps.swapPaths,
        simulatedOutputs.map((i) => {
          if (i.token === this.outputToken) {
            const slippage =
              outputTokenOutput.amount / (options.outputSlippage ?? 250_000n)
            return i.token.from(
              outputTokenOutput.amount - (slippage === 0n ? 1n : slippage)
            )
          }
          return i
        }),
        totalValue,
        this.swaps.destination
      ),
      dust: dustQuantities,
      dustValue: valueOfDust,
      output: outputTokenOutput,
    }
  }

  protected async setupApprovals() {
    const executorAddress = this.universe.config.addresses.executorAddress
    const approvalNeeded: Approval[] = []
    const duplicate = new Set<string>()
    await Promise.all(
      this.allApprovals.map(async (i) => {
        const key = i.spender.toString() + i.token.address.toString()
        if (duplicate.has(key)) {
          return
        }
        duplicate.add(key)
        if (
          await this.universe.approvalsStore.needsApproval(
            i.token,
            executorAddress,
            i.spender,
            constants.MaxUint256.div(2).toBigInt()
          )
        ) {
          approvalNeeded.push(i)
        }
      })
    )

    for (const approval of approvalNeeded) {
      const token = Contract.createContract(
        IERC20__factory.connect(
          approval.token.address.address,
          this.universe.provider
        )
      )
      this.planner.add(
        token.approve(approval.spender.address, constants.MaxUint256)
      )
    }
  }

  protected encodePayload(
    outputTokenOutput: TokenQuantity,
    options: ToTransactionArgs
  ): ZapERC20ParamsStruct {
    const plan = this.planner.plan()
    return {
      tokenIn: this.inputToken.address.address,
      amountIn: this.swaps.inputs[0].amount,
      commands: plan.commands,
      state: plan.state,
      amountOut:
        outputTokenOutput.amount -
        outputTokenOutput.amount / (options.outputSlippage ?? 250_000n),
      tokenOut: this.outputToken.address.address,
      tokens: this.potentialResidualTokens.map((i) => i.address.address),
    }
  }

  protected get value() {
    return this.inputIsNative ? this.userInput.amount : 0n
  }

  protected encodeCall(options: ToTransactionArgs, payload: any) {
    return this.inputIsNative
      ? zapperInterface.encodeFunctionData('zapETH', [payload])
      : options.permit2 == null
      ? zapperInterface.encodeFunctionData('zapERC20', [payload])
      : zapperInterface.encodeFunctionData('zapERC20WithPermit2', [
          payload,
          options.permit2.permit,
          parseHexStringIntoBuffer(options.permit2.signature),
        ])
  }

  protected encodeTx(data: string, gasNeeded: bigint) {
    let tx = {
      to: this.universe.config.addresses.zapperAddress.address,
      data,
      gasLimit: gasNeeded,
      chainId: this.universe.chainId,
      // TODO: For opti & arbi this needs updating to use type: 0 transactions
      value: BigNumber.from(this.value),
      from: this.signer.address,
    } as TransactionRequest

    if (this.universe.chainId === 1 || this.universe.chainId === 8453) {
      tx = {
        ...tx,
        type: 2,
        maxFeePerGas: BigNumber.from(
          this.universe.gasPrice + this.universe.gasPrice / 12n
        ),
      }
    } else {
      tx = {
        ...tx,
        type: 0,
        gasPrice: BigNumber.from(
          this.universe.gasPrice + this.universe.gasPrice / 12n
        ),
      }
    }
    return tx
  }

  abstract toTransaction(options: ToTransactionArgs): Promise<ZapTransaction>

  async createZapTransaction(options: ToTransactionArgs) {
    try {
      const params = this.encodePayload(this.swaps.outputs[0].token.from(1n), {
        ...options,
        returnDust: false,
      })
      const data = this.encodeCall(options, params)
      const tx = this.encodeTx(data, 300000n)
      // console.log(printPlan(this.planner, this.universe).join('\n'))
      const result = await this.simulateAndParse(options, tx.data!.toString())

      let dust = this.potentialResidualTokens.map((qty) => qty)
      if (options.returnDust === true) {
        for (const tok of dust) {
          const balanceOfDust = plannerUtils.erc20.balanceOf(
            this.universe,
            this.planner,
            tok,
            this.universe.config.addresses.executorAddress
          )
          plannerUtils.erc20.transfer(
            this.universe,
            this.planner,
            balanceOfDust,
            tok,
            this.signer
          )
        }
      }

      const finalParams = this.encodePayload(result.output, options)
      const outputTokenQty = this.outputToken.from(
        BigNumber.from(finalParams.amountOut)
      )
      const dustOutputQtys = result.simulatedOutputs.filter(
        (i) => i.token !== this.outputToken
      )
      const gasEstimate = result.gasUsed + result.gasUsed / 12n
      if (gasEstimate === 0n) {
        throw new Error('Failed to estimate gas')
      }
      const stats = await ZapTxStats.create(this.universe, {
        gasUnits: gasEstimate,
        input: this.userInput,
        output: outputTokenQty,
        dust: dustOutputQtys,
      })

      this.swaps = new SwapPaths(
        this.swaps.universe,
        this.swaps.inputs,
        this.swaps.swapPaths,
        stats.outputs.map((i) => i.quantity),
        stats.valueUSD,
        this.swaps.destination
      )

      const finalTx = this.encodeTx(
        this.encodeCall(options, finalParams),
        gasEstimate
      )

      return ZapTransaction.create(
        this,
        this.planner,
        {
          params: finalParams,
          tx: finalTx,
        },
        stats
      )
    } catch (e: any) {
      if (e instanceof ThirdPartyIssue) {
        throw e
      }
      throw e
    }
  }
}

export class TradeSearcherResult extends BaseSearcherResult {
  async toTransaction(
    options: ToTransactionArgs = {}
  ): Promise<ZapTransaction> {
    await this.setupApprovals()

    for (const step of this.swaps.swapPaths[0].steps) {
      await step.action.plan(this.planner, [], this.signer, [this.userInput])
    }
    for (const token of this.potentialResidualTokens) {
      const out = plannerUtils.erc20.balanceOf(
        this.universe,
        this.planner,
        token,
        this.universe.config.addresses.executorAddress
      )
      plannerUtils.planForwardERC20(
        this.universe,
        this.planner,
        token,
        out,
        this.signer
      )
    }

    return this.createZapTransaction(options)
  }
}

export class BurnRTokenSearcherResult extends BaseSearcherResult {
  constructor(
    readonly universe: UniverseWithERC20GasTokenDefined,
    readonly userInput: TokenQuantity,
    readonly parts: {
      full: SwapPaths
      rtokenRedemption: SwapPath
      tokenBasketUnwrap: SwapPath[]
      tradesToOutput: SwapPath[]
    },
    public readonly signer: Address,
    public readonly outputToken: Token
  ) {
    super(universe, userInput, parts.full, signer, outputToken)
  }
  async toTransaction(
    options: ToTransactionArgs = {}
  ): Promise<ZapTransaction> {
    await this.setupApprovals()

    const tokens = new Map<Token, Value[]>()
    const outputs = await this.parts.rtokenRedemption.steps[0].action.plan(
      this.planner,
      [
        new LiteralValue(
          ParamType.fromString('uint256'),
          defaultAbiCoder.encode(['uint256'], [this.userInput.amount])
        ),
      ],
      this.universe.config.addresses.executorAddress,
      [this.userInput]
    )

    for (
      let i = 0;
      i < this.parts.rtokenRedemption.steps[0].action.outputToken.length;
      i++
    ) {
      tokens.set(this.parts.rtokenRedemption.steps[0].action.outputToken[i], [
        outputs[i],
      ])
    }
    const executorAddress = this.universe.config.addresses.executorAddress
    const tradeOutputs = new Map<Token, Value>()
    for (const unwrapBasketTokenPath of this.parts.tokenBasketUnwrap) {
      for (const step of unwrapBasketTokenPath.steps) {
        let input = tokens.get(step.action.inputToken[0])
        if (input == null) {
          throw new Error('MISSING INPUT')
        }
        const size = await step.action.plan(
          this.planner,
          input,
          executorAddress,
          step.inputs
        )
        tokens.set(step.outputs[0].token, size)
      }
    }

    for (const path of this.parts.tradesToOutput) {
      const input = plannerUtils.erc20.balanceOf(
        this.universe,
        this.planner,
        path.steps[0].inputs[0].token,
        executorAddress
      )
      for (const step of path.steps) {
        const out = await step.action.plan(
          this.planner,
          [input],
          executorAddress,
          step.inputs
        )
        tradeOutputs.set(step.outputs[0].token, out[0])
      }
    }
    const out = plannerUtils.erc20.balanceOf(
      this.universe,
      this.planner,
      this.outputToken,
      executorAddress
    )
    plannerUtils.planForwardERC20(
      this.universe,
      this.planner,
      this.outputToken,
      out,
      this.signer
    )

    return this.createZapTransaction(options)
  }
}

const ONE = 10n ** 18n
const ONE_Val = new LiteralValue(
  ParamType.fromString('uint256'),
  defaultAbiCoder.encode(['uint256'], [ONE])
)
export class MintRTokenSearcherResult extends BaseSearcherResult {
  constructor(
    readonly universe: UniverseWithERC20GasTokenDefined,
    readonly userInput: TokenQuantity,
    readonly parts: {
      trading: SwapPaths
      minting: SwapPaths
      rTokenMint: SwapPath
      full: SwapPaths
    },
    public readonly signer: Address,
    public readonly outputToken: Token
  ) {
    super(universe, userInput, parts.full, signer, outputToken)
  }

  async toTransaction(
    options: ToTransactionArgs = {}
  ): Promise<ZapTransaction> {
    await this.setupApprovals()

    const ethBalance = Contract.createContract(
      EthBalance__factory.connect(
        this.universe.config.addresses.ethBalanceOf.address,
        this.universe.provider
      )
    )

    const zapperLib = Contract.createContract(
      ZapperExecutor__factory.connect(
        this.universe.config.addresses.executorAddress.address,
        this.universe.provider
      )
    )

    const trades = new Map<Token, Value>()

    for (const trade of this.parts.trading.swapPaths) {
      for (const step of trade.steps) {
        const inputsVal = new LiteralValue(
          ParamType.fromString('uint256'),
          defaultAbiCoder.encode(['uint256'], [step.inputs[0].amount])
        )
        const output = await step.action.plan(
          this.planner,
          [inputsVal],
          this.universe.config.addresses.executorAddress,
          step.inputs
        )
        if (output.length === 0) {
          throw new Error("Unexpected: Didn't get an output")
        }
        for (let i = 0; i < step.action.outputToken.length; i++) {
          trades.set(step.action.outputToken[i], output[i])
        }
      }
    }

    const totalUsedInMinting = new TokenAmounts()
    const numberOfUsers = new DefaultMap<Token, number>(() => 0)
    for (const mintPath of this.parts.minting.swapPaths) {
      for (const step of mintPath.steps) {
        totalUsedInMinting.addQtys(step.inputs)
        numberOfUsers.set(
          step.inputs[0].token,
          numberOfUsers.get(step.inputs[0].token) + 1
        )
      }
    }
    if (totalUsedInMinting.get(this.inputToken).amount !== 0n) {
      trades.set(
        this.inputToken,
        plannerUtils.erc20.balanceOf(
          this.universe,
          this.planner,
          this.inputToken,
          this.universe.config.addresses.executorAddress
        )
      )
    }

    for (const mintPath of this.parts.minting.swapPaths) {
      for (const step of mintPath.steps) {
        const inputToken = step.inputs[0].token
        let actionInput = trades.get(inputToken)
        if (actionInput == null) {
          throw new Error('NO INPUT')
        }
        const total = totalUsedInMinting.get(inputToken)
        if (total.amount !== step.inputs[0].amount) {
          const currentUsersLeft = numberOfUsers.get(inputToken)
          if (currentUsersLeft === 1) {
            if (inputToken === this.universe.nativeToken) {
              actionInput = this.planner.add(
                ethBalance.ethBalance(
                  this.universe.config.addresses.executorAddress.address
                )
              )!
            } else {
              actionInput = plannerUtils.erc20.balanceOf(
                this.universe,
                this.planner,
                inputToken,
                this.universe.config.addresses.executorAddress
              )
            }
          } else {
            const fraction =
              (step.inputs[0].toScaled(ONE) * ONE) / total.toScaled(ONE)
            actionInput = this.planner.add(
              zapperLib.fpMul(actionInput, fraction, ONE_Val),
              `${inputToken} * ${formatEther(fraction)}`,
              `frac_${step.outputs[0].token.symbol}`
            )!
            numberOfUsers.set(inputToken, currentUsersLeft - 1)
          }
        }

        const result = await step.action.plan(
          this.planner,
          [actionInput],
          this.universe.config.addresses.executorAddress,
          step.inputs
        )
        for (let i = 0; i < step.outputs.length; i++) {
          trades.set(step.outputs[i].token, result[i])
        }
      }
    }

    this.planner.add(
      zapperLib.mintMaxRToken(
        this.universe.config.addresses.facadeAddress.address,
        this.outputToken.address.address,
        this.signer.address
      ),
      'txGen,mint rToken via mintMaxRToken helper'
    )

    return this.createZapTransaction(options)
  }
}
