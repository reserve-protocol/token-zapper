import { defaultAbiCoder, ParamType } from '@ethersproject/abi'
import { randomBytes } from 'crypto'
import { hexDataSlice, hexlify } from 'ethers/lib/utils'
import { BaseAction, plannerUtils } from '../action/Action'
import { Address } from '../base/Address'
import { DefaultMap } from '../base/DefaultMap'
import { EmitId__factory, IERC20__factory, Zapper__factory } from '../contracts'
import { Token, TokenQuantity } from '../entities/Token'
import {
  Contract,
  LiteralValue,
  Planner,
  printPlan,
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
import { ZapperOutputStructOutput } from '../contracts/contracts/Zapper.sol/Zapper'
import { ZapTransaction, ZapTxStats } from './ZapTransaction'
import { NodeProxy, TFGResult } from './TokenFlowGraph'
import { Approval } from '../base/Approval'
import { constants } from 'ethers/lib/ethers'
import { DeployFolioConfig } from '../action/DeployFolioConfig'
import { ZapParamsStruct } from '../contracts/contracts/Zapper2'
import { ZapERC20ParamsStruct } from '../contracts/contracts/Zapper'

const iface = Zapper__factory.createInterface()
const simulateAndParse = async (
  universe: Universe,
  simulationPayload: SimulateParams,
  dustTokens: Token[]
) => {
  const timer = universe.perf.begin('simulateZap')
  const start = Date.now()
  const simulation = await universe.simulateZapFn(simulationPayload, universe)
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
  const outputTokenAddress =
    outputToken instanceof Address ? outputToken : outputToken.address
  let data: string
  let params: ZapParamsStruct | ZapERC20ParamsStruct
  if (universe.config.useNewZapperContract) {
    const p = encodeZapParamsStruct(
      planner,
      opts.ethereumInput ? inputs[0].into(universe.nativeToken) : inputs[0],
      outputTokenAddress,
      minOutput,
      dustTokens,
      opts.recipient
    )
    params = p
    data = encodeZapper2Calldata(p, {
      isDeployZap: opts.deployFolio != null,
    })
  } else {
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

  const to = universe.zapperAddress

  let value = 0n
  if (opts.ethereumInput) {
    value = inputs[0].amount
  }
  const simulationPayload = {
    to: to.address,
    from: signer.address,
    data,
    value,
    setup: {
      inputTokenAddress: inputs[0].token.address.address,
      userBalanceAndApprovalRequirements: inputs[0].amount,
    },
  }

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
interface TxGenOptions {
  caller: Address
  recipient: Address
  dustRecipient: Address
  ethereumInput: boolean

  deployFolio?: DeployFolioConfig
}

export class DagPlanContext {
  public readonly executionContractBalance = new DefaultMap<Token, Value>(
    (token) => this.balanceOf(token.address)
  )

  public balanceOf(token: Token | Address) {
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

  public takeBalance(token: Token) {
    const out = this.executionContractBalance.get(token)
    this.executionContractBalance.delete(token)
    return out
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

const planNode = async (
  node: NodeProxy,
  ctx: DagPlanContext,
  inputs: [Token, Value, TokenQuantity][]
): Promise<[Token, NodeProxy, Value][]> => {
  if (node.isEndNode) {
    return []
  }
  const outputs = new Map<Token, Value>()

  for (const input of inputs) {
    outputs.set(input[0], input[1])
  }
  const dust = new Set<Token>()
  if (node.action instanceof BaseAction) {
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
      actionInputs.map((i) => i[1]),
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

  let out: [Token, NodeProxy, Value][] = []
  for (const outEdge of node.outgoingEdges()) {
    if (dust.has(outEdge.token)) {
      continue
    }
    const producedValue = outputs.get(outEdge.token)
    if (producedValue == null) {
      throw new Error(`No value for ${outEdge.token}`)
    }

    if (outEdge.proportion === 1) {
      out.push([outEdge.token, outEdge.recipient, producedValue])
    } else {
      const valueMulProp = ctx.bnFraction(
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
    const logger = this.universe.logger.child({
      prefix: `TxGen`,
      zapId: this.zapIdStr,
      blockNumber: this.blockNumber,
    })
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

    const nodeInputs = new DefaultMap<number, DefaultMap<Token, Value[]>>(
      () => new DefaultMap<Token, Value[]>(() => [])
    )

    const startNodeInput = new DefaultMap<Token, Value[]>(() => [])
    for (const input of this.result.result.inputs) {
      startNodeInput.set(input.token, [
        ctx.executionContractBalance.get(input.token),
      ])
    }
    nodeInputs.set(nodes[0].node.id, startNodeInput)

    const tokensToTransferBackToUser = new Set<Token>()
    for (const node of nodes) {
      for (const input of node.node.inputs) {
        tokensToTransferBackToUser.add(input)
      }
      for (const output of node.node.outputs) {
        tokensToTransferBackToUser.add(output)
      }
      if (!nodeInputs.get(node.node.id)) {
        throw new Error('No inputs found for node')
      }

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

          return [token, val, qty] as [Token, Value, TokenQuantity]
        }
        if (node.node.isEndNode) {
          return [
            qty.token,
            ctx.executionContractBalance.get(qty.token),
            qty,
          ] as [Token, Value, TokenQuantity]
        }
        if (inputs.length === 1) {
          return [token, inputs[0], qty] as [Token, Value, TokenQuantity]
        } else {
          console.log(inputs.length)
          console.log(inputs)
        }

        // if (inputs.length === 2) {
        //   return [token, ctx.add(inputs[0], inputs[1], `${qty}`), qty] as [
        //     Token,
        //     Value,
        //     TokenQuantity
        //   ]
        // }

        const summed = ctx.readBalance(token, true)
        return [token, summed, qty] as [Token, Value, TokenQuantity]
      })

      const result = await planNode(node.node, ctx, inputs)
      for (const [token, node, value] of result) {
        nodeInputs.get(node.id).get(token).push(value)
      }
    }

    let outputTokenAddress = outputToken.address
    if (opts.deployFolio) {
      outputTokenAddress =
        await this.universe.folioContext.computeNextFolioTokenAddress(
          opts.deployFolio
        )

      logger.info(
        `Generating deployZap, expected token addr should be '${outputTokenAddress}' based on config`
      )
    }

    const dustTokens = this.graph
      .getDustTokens()
      .filter((t) => t.address !== outputTokenAddress)

    ctx.transfer(
      outputTokenAddress,
      ctx.balanceOf(outputTokenAddress),
      ctx.recipient
    )

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
    for (const token of dustTokens) {
      let recipient =
        ctx.dag.result.output.token === token
          ? ctx.recipient
          : ctx.dustRecipient

      const val = ctx.balanceOf(token)

      ctx.transfer(token, val, recipient)
    }

    const minOutputWithSlippage = outputToken.from(
      testSimulation.amountOut - testSimulation.amountOut / 10000n
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

    // console.log(testSimulation.dust.join(', '))
    const dustQtys = testSimulation.dust.filter((i) => i.amount > 1000n)

    const stats = await ZapTxStats.create(result, {
      gasUnits: program.res.gasUnits + program.res.gasUnits / 6n,
      input: this.result.result.inputs[0],
      output: outputToken.from(program.res.amountOut),
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
