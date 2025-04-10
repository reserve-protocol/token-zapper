import { defaultAbiCoder, ParamType } from '@ethersproject/abi'
import { randomBytes } from 'crypto'
import { hexDataSlice, hexlify } from 'ethers/lib/utils'
import { BaseAction, plannerUtils } from '../action/Action'
import { Address } from '../base/Address'
import { DefaultMap } from '../base/DefaultMap'
import {
  EmitId__factory,
  IERC20__factory,
  NTo1Zapper__factory,
  Zapper__factory,
} from '../contracts'
import { Token, TokenQuantity } from '../entities/Token'
import deployments from '../contracts/deployments.json'
import {
  Contract,
  LiteralValue,
  Planner,
  printPlan,
  ReturnValue,
  Value,
} from '../tx-gen/Planner'
import {
  encodeZapper2Calldata,
  encodeZapERC20ParamsStruct,
  encodeZapParamsStruct,
  encodeZapperCalldata,
} from './ToTransactionArgs'
import { Universe } from '../Universe'
import { SimulateParams } from '../configuration/ZapSimulation'
import { ZapTransaction, ZapTxStats } from './ZapTransaction'
import { NodeProxy, TFGResult } from './TokenFlowGraph'
import { Approval } from '../base/Approval'
import { constants } from 'ethers/lib/ethers'
import { DeployFolioConfig } from '../action/DeployFolioConfig'
import { ZapParamsStruct } from '../contracts/contracts/Zapper2'
import {
  ZapERC20ParamsStruct,
  ZapperOutputStructOutput,
} from '../contracts/contracts/Zapper'
import { DeployMintFolioAction } from '../action/Folio'
import { GAS_TOKEN_ADDRESS } from '../base/constants'
import { MultiZapParamsStruct } from '../contracts/contracts/NTo1Zapper'

const iface = Zapper__factory.createInterface()
const simulateAndParse = async (
  universe: Universe,
  simulationPayload: SimulateParams,
  dustTokens: Token[]
) => {
  const timer = universe.perf.begin('simulateZap')
  const start = Date.now()
  const simulationResults = await universe.simulateZapFn(
    simulationPayload,
    universe
  )
  const simulation = simulationResults[simulationResults.length - 1]
  timer()
  universe.logger.debug(`Simulation took ${Date.now() - start}ms`)
  try {
    const parsed = iface.decodeFunctionResult(
      'zapERC20',
      simulation
    )[0] as ZapperOutputStructOutput

    return {
      txFee: universe.nativeToken.from(
        parsed.gasUsed.toBigInt() * universe.gasPrice
      ),
      gasUnits: parsed.gasUsed.toBigInt(),
      amountOut: parsed.amountOut.toBigInt(),
      dust: parsed.dust.map((d, index) => dustTokens[index].from(d)),
    }
  } catch (e) {
    try {
      const [cmdIndex, target, message] = defaultAbiCoder.decode(
        ['uint256', 'address', 'string'],
        hexDataSlice(simulation, 4)
      )
      console.log(
        `ExecutionFailed: cmdIndex=${cmdIndex}, target=${target}, message=${message}`
      )

      throw e
    } catch (e) {
      console.log(`ExecutionFailed: unknown error`)
      console.log(simulation)

      throw e
    }
  }
}

const evaluateProgram = async (
  universe: Universe,
  planner: Planner,
  inputs: TokenQuantity[],
  dustTokens: Token[],
  signer: Address,
  outputToken: Token | Address,
  minOutput: bigint,
  opts: TxGenOptions
) => {
  dustTokens = dustTokens.map((i) =>
    i.address.address === GAS_TOKEN_ADDRESS ? universe.wrappedNativeToken : i
  )
  const outputTokenAddress =
    outputToken instanceof Address ? outputToken : outputToken.address
  let data: string
  let params: ZapParamsStruct | ZapERC20ParamsStruct | MultiZapParamsStruct
  let to = universe.zapperAddress

  if (inputs.length === 1) {
    if (universe.config.useNewZapperContract) {
      const p = encodeZapParamsStruct(
        planner,
        opts.ethereumInput ? inputs[0].into(universe.nativeToken) : inputs[0],
        opts.ethereumOutput ? Address.ZERO : outputTokenAddress,
        minOutput,
        dustTokens,
        opts.recipient
      )
      params = p
      // console.log(p)
      data = encodeZapper2Calldata(universe, p, {
        deployFolio: opts.deployFolio,
      })
    } else {
      if (opts.ethereumOutput) {
        throw new Error('Ethereum output not supported for old zapper')
      }
      const p = encodeZapERC20ParamsStruct(
        planner,
        inputs[0],
        outputTokenAddress,
        minOutput,
        dustTokens
      )
      params = p
      data = encodeZapperCalldata(p, {
        ethInput: opts.ethereumInput,
      })
    }
  } else {
    const addr = (deployments as any)[universe.chainId][0].contracts.NTo1Zapper
      ?.address
    if (addr == null) {
      throw new Error('NTo1Zapper not deployed')
    }
    const plan = planner.plan()
    const p: MultiZapParamsStruct = {
      inputs: inputs.map((i) => ({
        token: i.token.address.address,
        quantity: i.amount,
      })),
      tokens: inputs.map((i) => i.token.address.address),
      commands: plan.commands,
      state: plan.state,
      amountOut: minOutput,
      tokenOut: outputToken.address.toString(),
      recipient: opts.recipient.address,
    }
    data = NTo1Zapper__factory.createInterface().encodeFunctionData('zap', [p])
    to = Address.from(addr)
    params = p
  }

  let value = 0n
  if (opts.ethereumInput) {
    value = inputs[0].amount
  }
  const simulationPayload = {
    transactions: [
      {
        to: to.address,
        from: signer.address,
        data,
        value,
      },
    ],
    setup: {
      sender: signer.address,
      approvalAddress: to.address,
      inputs,
    },
  }

  universe.logger.debug(
    JSON.stringify(
      {
        to: simulationPayload.transactions[0].to,
        from: simulationPayload.transactions[0].from,
        data: simulationPayload.transactions[0].data,
        block: universe.currentBlock,
      },
      null,
      2
    )
  )

  try {
    return {
      res: await simulateAndParse(universe, simulationPayload, dustTokens),
      tx: {
        tx: {
          to: to.address,
          from: signer.address,
          data,
          value,
        },
        params,
      },
    }
  } catch (e) {
    console.log(printPlan(planner, universe).join('\n'))
    throw e
  }
}
export interface TxGenOptions {
  caller: Address
  recipient: Address
  dustRecipient: Address
  useTrade?: boolean
  ethereumInput: boolean
  ethereumOutput: boolean
  slippage: number

  deployFolio?: DeployFolioConfig
}

export class DagPlanContext {
  public readonly executionContractBalance = new DefaultMap<Token, Value>(
    (token) => this.balanceOf(token.address)
  )

  public balanceOf(token: Token | Address) {
    const addr = token instanceof Token ? token.address : token
    if (this.universe.folioContext.tokens.has(addr)) {
      return new LiteralValue(
        ParamType.fromString('uint256'),
        defaultAbiCoder.encode(['uint256'], [0n])
      )
    }
    return plannerUtils.erc20.balanceOf(
      this.universe,
      this.planner,
      token,
      this.universe.execAddress
    )
  }

  public transfer(token: Token | Address, amount: Value, destination: Address) {
    return plannerUtils.erc20.transfer(
      this.universe,
      this.planner,
      amount,
      token,
      destination
    )
  }

  public fraction(
    fraction: number,
    a: Value,
    comment: string = '',
    name?: string
  ) {
    const fractionAsBigInt = BigInt(Math.floor(10 ** 18 * fraction))
    return plannerUtils.fraction(
      this.universe,
      this.planner,
      a,
      fractionAsBigInt,
      comment,
      name
    )
  }

  public bnFraction(fraction: bigint, a: Value, comment: string = '') {
    return plannerUtils.fraction(
      this.universe,
      this.planner,
      a,
      fraction,
      comment
    )
  }

  public add(a: Value, b: Value, comment: string = '') {
    return plannerUtils.add(this.universe, this.planner, a, b, comment)
  }
  public sub(a: Value, b: Value, comment: string = '') {
    return plannerUtils.sub(this.universe, this.planner, a, b, comment)
  }

  public get thisAddress() {
    return this.universe.execAddress
  }

  public readBalance(token: Token, fresh: boolean = false) {
    if (fresh) {
      this.executionContractBalance.delete(token)
    }

    return this.executionContractBalance.get(token)
  }

  public setBalance(token: Token, value: Value) {
    this.executionContractBalance.set(token, value)
  }

  public async setupApprovals(approvals: [TokenQuantity, Approval][]) {
    for (const [qty, approval] of approvals) {
      const token = approval.token
      const spender = approval.spender
      // if (this.universe.chainId !== 1) {
      //   const tokenLib = Contract.createContract(
      //     IERC20__factory.connect(
      //       approval.token.address.address,
      //       this.universe.provider
      //     )
      //   )
      //   this.planner.add(
      //     tokenLib.approve(spender.address, 0n),
      //     `Approve ${spender} to use ${approval.token}`
      //   )
      //   this.planner.add(
      //     tokenLib.approve(spender.address, constants.MaxUint256.toBigInt()),
      //     `Approve ${spender} to use ${approval.token}`
      //   )
      //   continue
      // }
      if (
        !(await this.universe.approvalsStore.needsApproval(
          token,
          this.thisAddress,
          spender,
          qty.amount
        ))
      ) {
        continue
      }
      const tokenLib = Contract.createContract(
        IERC20__factory.connect(
          approval.token.address.address,
          this.universe.provider
        )
      )
      if (this.universe.zeroBeforeApproval.has(approval.token)) {
        this.planner.add(
          tokenLib.approve(spender.address, 0n),
          `Approve ${spender} to use ${approval.token}`
        )
      }
      this.planner.add(
        tokenLib.approve(spender.address, qty.amount),
        `Approve ${spender} to use ${approval.token}`
      )
    }
  }

  public get caller() {
    return this.opts.caller
  }

  public get recipient() {
    return this.opts.recipient
  }

  public get dustRecipient() {
    return this.opts.dustRecipient
  }

  constructor(
    public readonly universe: Universe,
    public readonly dag: TFGResult,
    public readonly planner: Planner,
    public readonly opts: TxGenOptions
  ) {}
  public readonly values: Map<Token, Value> = new Map()
}

type ValueOfLazyValue = Value | (() => Value)
type NodeInput = [Token, ValueOfLazyValue, TokenQuantity]

const planNode = async (
  node: NodeProxy,
  ctx: DagPlanContext,
  inputs: NodeInput[]
): Promise<[Token, NodeProxy, ValueOfLazyValue][]> => {
  if (node.isEndNode) {
    return []
  }
  const outputs = new Map<Token, ValueOfLazyValue>()

  for (const input of inputs) {
    outputs.set(input[0], input[1])
  }
  const dust = new Set<Token>()
  if (node.action instanceof BaseAction) {
    if (node.action instanceof DeployMintFolioAction) {
      return []
    }

    for (const input of node.action.dustTokens) {
      dust.add(input)
    }
    const actionInputs = node.action.inputToken.map((i) => {
      const inp = inputs.find((inp) => inp[0] === i)
      if (inp == null) {
        throw new Error(`No input for ${i}`)
      }
      return inp
    })

    await ctx.setupApprovals(
      node.action.approvals.map((approval) => [
        approval.token.from(constants.MaxUint256.toBigInt()),
        approval,
      ])
    )

    const outs = await node.action.planWithOutput(
      ctx.universe,
      ctx.planner,
      actionInputs.map((i) => {
        if (typeof i[1] === 'function') {
          return i[1]()
        }
        return i[1]
      }),
      ctx.thisAddress,
      actionInputs.map((i) => i[2])
    )

    for (const input of node.action.inputToken) {
      outputs.delete(input)
    }

    for (let i = 0; i < node.action.outputToken.length; i++) {
      const token = node.action.outputToken[i]
      outputs.set(token, outs[i])
    }
  }

  let out: [Token, NodeProxy, Value | (() => Value)][] = []
  for (const outEdge of node.outgoingEdges()) {
    if (dust.has(outEdge.token)) {
      continue
    }
    const producedValue = outputs.get(outEdge.token)
    if (producedValue == null) {
      continue
    }

    if (outEdge.proportion === 1) {
      out.push([outEdge.token, outEdge.recipient, producedValue])
    } else {
      if (outEdge.proportionBn === 0n) {
        continue
      }
      const valueMulProp =
        typeof producedValue === 'function'
          ? () =>
              ctx.bnFraction(
                outEdge.proportionBn,
                producedValue(),
                `${outEdge.source.nodeId} ${outEdge.proportion} ${outEdge.token} -> ${outEdge.recipient.nodeId}`
              )
          : ctx.bnFraction(
              outEdge.proportionBn,
              producedValue,
              `${outEdge.source.nodeId} ${outEdge.proportion} ${outEdge.token} -> ${outEdge.recipient.nodeId}`
            )
      out.push([outEdge.token, outEdge.recipient, valueMulProp])
    }
  }

  return out
}

export class TxGen {
  private readonly zapIdBytes = randomBytes(32)
  public readonly zapId: bigint = BigInt(hexlify(this.zapIdBytes))
  public readonly zapIdStr = Buffer.from(this.zapIdBytes).toString('base64')
  public readonly blockNumber: number

  constructor(public readonly universe: Universe, private result: TFGResult) {
    this.blockNumber = universe.currentBlock
  }

  public get graph() {
    return this.result.graph
  }

  public async generate(opts: TxGenOptions) {
    const emitIdContract = Contract.createLibrary(
      EmitId__factory.connect(
        this.universe.config.addresses.emitId.address,
        this.universe.provider
      )
    )
    const outputToken = this.result.result.output.token
    const nodes = this.result.nodeResults

    // console.log(this.graph.toDot().join('\n'))

    const planner = new Planner()
    planner.add(emitIdContract.emitId(this.zapId))

    const allTokens = new Set<Token>()

    for (const node of nodes) {
      for (const token of [...node.node.inputs, ...node.node.outputs]) {
        allTokens.add(token)
      }
    }

    const ctx = new DagPlanContext(this.universe, this.result, planner, opts)

    const nodeInputs = new DefaultMap<
      number,
      DefaultMap<Token, ValueOfLazyValue[]>
    >(() => new DefaultMap<Token, Value[]>(() => []))

    const startNodeInput = new DefaultMap<Token, Value[]>(() => [])
    for (const input of this.result.result.inputs) {
      startNodeInput.set(input.token, [
        ctx.executionContractBalance.get(input.token),
      ])
    }
    nodeInputs.set(nodes[0].node.id, startNodeInput)

    const isRedeem = !(
      (await this.universe.isRToken(outputToken)) ||
      (await this.universe.folioContext.isFolio(outputToken))
    )

    const tokensToTransferBackToUser = new Set<Token>()
    for (const node of nodes) {
      if (node.node.action instanceof DeployMintFolioAction) {
        break
      }
      for (const input of node.node.inputs) {
        tokensToTransferBackToUser.add(input)
      }
      for (const output of node.node.outputs) {
        tokensToTransferBackToUser.add(output)
      }
      if (!nodeInputs.get(node.node.id)) {
        throw new Error('No inputs found for node')
      }

      node.result.inputs.map((qty) => {
        const inputs = nodeInputs.get(node.node.id).get(qty.token)
        if (inputs.length > 1) {
          ctx.readBalance(qty.token, true)
        }
      })

      const inputs = node.result.inputs.map((qty) => {
        const token = qty.token
        const inputs = nodeInputs.get(node.node.id).get(token)
        if (inputs.length === 0) {
          let val: Value = new LiteralValue(
            ParamType.fromString('uint256'),
            defaultAbiCoder.encode(['uint256'], [qty.amount])
          )

          if (
            node.node.action instanceof BaseAction &&
            node.node.action.supportsDynamicInput
          ) {
            val = ctx.executionContractBalance.get(token)
            ctx.executionContractBalance.delete(token)
          }

          return [token, val, qty] as NodeInput
        }
        if (
          node.node.action instanceof BaseAction &&
          !node.node.action.supportsDynamicInput
        ) {
          return [
            token,
            new LiteralValue(
              ParamType.fromString('uint256'),
              defaultAbiCoder.encode(['uint256'], [qty.amount])
            ),
            qty,
          ] as NodeInput
        }
        if (node.node.isEndNode) {
          return [
            qty.token,
            ctx.executionContractBalance.get(qty.token),
            qty,
          ] as NodeInput
        }
        if (inputs.length === 1) {
          return [token, inputs[0], qty] as NodeInput
        }
        const summed = () =>
          isRedeem
            ? ctx.readBalance(token)
            : inputs.reduce((acc, curr) => {
                const l = typeof acc === 'function' ? acc() : acc
                const r = typeof curr === 'function' ? curr() : curr
                if (l === r || (l as any).name === (r as any).name) {
                  return l
                }

                if (
                  l instanceof ReturnValue &&
                  l.command.call.fragment.name === 'balanceOf'
                ) {
                  return ctx.readBalance(token)
                }
                if (
                  r instanceof ReturnValue &&
                  r.command.call.fragment.name === 'balanceOf'
                ) {
                  return ctx.readBalance(token)
                }

                const res = ctx.add(l, r)
                return res
              })
        return [token, summed, qty] as NodeInput
      })

      const result = await planNode(node.node, ctx, inputs)
      for (const [token, node, value] of result) {
        nodeInputs.get(node.id).get(token).push(value)
      }
    }

    let outputTokenAddress = outputToken.address
    if (!opts.deployFolio) {
      ctx.transfer(
        opts.ethereumOutput ? ctx.universe.nativeToken : outputTokenAddress,
        ctx.balanceOf(
          opts.ethereumOutput
            ? ctx.universe.wrappedNativeToken
            : outputTokenAddress
        ),
        ctx.recipient
      )
    }

    const dustTokens = this.graph
      .getDustTokens()
      .filter((t) => t.address !== outputTokenAddress && t !== outputToken)

    const { res: testSimulation } = await evaluateProgram(
      this.universe,
      planner,
      this.result.result.inputs,
      dustTokens,
      ctx.caller,
      outputTokenAddress,
      outputToken.wei.amount,
      opts
    )
    if (!opts.deployFolio) {
      for (const token of dustTokens) {
        let recipient =
          ctx.dag.result.output.token === token
            ? ctx.recipient
            : ctx.dustRecipient

        const val = ctx.balanceOf(token)

        ctx.transfer(token, val, recipient)
      }
    }

    const amountOut = (
      opts.ethereumOutput ? this.universe.nativeToken : outputToken
    ).from(testSimulation.amountOut)
    const minOutputWithSlippage = amountOut.sub(
      amountOut.mul(
        outputToken.from(opts.deployFolio?.slippage ?? opts.slippage)
      )
    )

    const program = await evaluateProgram(
      this.universe,
      planner,
      this.result.result.inputs,
      dustTokens,
      ctx.caller,
      outputTokenAddress,
      minOutputWithSlippage.amount,
      opts
    )
    const result = {
      universe: this.universe,
      zapId: this.zapIdStr,
      startTime: Date.now(),
      blockNumber: this.blockNumber,
      tokenPrices: new Map(),
    }

    const dustQtys = testSimulation.dust.filter((i) => i.amount > 1000n)

    const stats = await ZapTxStats.create(result, {
      gasUnits: program.res.gasUnits + program.res.gasUnits / 6n,
      inputs: this.result.result.inputs,
      output: (opts.ethereumOutput
        ? this.universe.nativeToken
        : outputToken
      ).from(program.res.amountOut),
      dust: dustQtys,
    })
    const zapTx = await ZapTransaction.create(
      result,
      planner,
      {
        tx: program.tx.tx,
        params: program.tx.params,
      },
      stats
    )

    // const valueSlippage = stats.netValueUSD.div(stats.input.price).asNumber()
    // const maxValueSlippage = this.universe.config.zapMaxValueLoss / 100
    // for (const res of this.result.nodeResults) {
    //   if (res.node.action instanceof BaseAction) {
    //     console.log(
    //       `${res.result.inputs.join(', ')}  ${
    //         res.node.action
    //       } -> ${res.result.outputs.join(', ')}`
    //     )
    //   }
    // }
    // logger.error(
    //   `Value slippage is too high: ${((1 - valueSlippage) * 100).toFixed(
    //     2
    //   )}% for ${this.result.result.inputs.join(', ')} -> ${
    //     this.result.result.output.token
    //   } - Max allowed value slippage ${this.universe.config.zapMaxValueLoss}%`
    // )

    // console.log(zapTx.toString())

    // console.log(printPlan(zapTx.planner, this.universe).join('\n'))

    return zapTx
    // return zapTx
  }
}
