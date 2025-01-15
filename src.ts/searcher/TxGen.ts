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
  ReturnValue,
  Value,
} from '../tx-gen/Planner'
import {
  encodeCalldata,
  encodeProgramToZapERC20Params,
} from './ToTransactionArgs'
import { Universe } from '../Universe'
import { SimulateParams } from '../configuration/ZapSimulation'
import { ZapperOutputStructOutput } from '../contracts/contracts/Zapper.sol/Zapper'
import { ZapTransaction, ZapTxStats } from './ZapTransaction'
import { NodeProxy, TFGResult } from './TokenFlowGraph'
import { Approval } from '../base/Approval'
import { constants } from 'ethers/lib/ethers'
const iface = Zapper__factory.createInterface()
const simulateAndParse = async (
  universe: Universe,
  simulationPayload: SimulateParams,
  outputToken: Token,
  dustTokens: Token[]
) => {
  const simulation = await universe.simulateZapFn(simulationPayload, universe)
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
      amountOut: outputToken.from(parsed.amountOut),
      dust: parsed.dust.map((d, index) => dustTokens[index].from(d)),
    }
  } catch (e) {
    console.log(simulation)
    const [cmdIndex, target, message] = defaultAbiCoder.decode(
      ['uint256', 'address', 'string'],
      hexDataSlice(simulation, 4)
    )
    console.log(
      `ExecutionFailed: cmdIndex=${cmdIndex}, target=${target}, message=${message}`
    )

    throw e
  }
}

const evaluateProgram = async (
  universe: Universe,
  planner: Planner,
  inputs: TokenQuantity[],
  dustTokens: Token[],
  signer: Address,
  minOutput: TokenQuantity,
  opts: { ethereumInput: boolean }
) => {
  const tx = encodeProgramToZapERC20Params(planner, inputs[0], minOutput, [
    ...dustTokens.slice(1),
  ])
  const data = encodeCalldata(tx, opts.ethereumInput)
  let value = 0n
  if (opts.ethereumInput) {
    value = inputs[0].amount
  }
  const simulationPayload = {
    to: universe.config.addresses.zapperAddress.address,
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
      res: await simulateAndParse(
        universe,
        simulationPayload,
        minOutput.token,
        dustTokens
      ),
      tx: {
        tx: {
          to: universe.config.addresses.zapperAddress.address,
          from: signer.address,
          data,
          value,
        },
        params: tx,
      },
    }
  } catch (e) {
    console.log(printPlan(planner, universe).join('\n'))
    throw e
  }
}

export class DagPlanContext {
  public readonly executionContractBalance = new DefaultMap<Token, Value>(
    (token) => {
      return plannerUtils.erc20.balanceOf(
        this.universe,
        this.planner,
        token,
        this.universe.execAddress
      )
    }
  )

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
      this.planner.add(
        tokenLib.approve(spender.address, constants.MaxUint256),
        `Approve ${spender} to use ${approval.token}`
      )
    }
  }

  constructor(
    public readonly universe: Universe,
    public readonly dag: TFGResult,
    public readonly planner: Planner,
    public readonly outputRecipient: Address,
    public readonly dustRecipient: Address = outputRecipient
  ) {}
  public readonly values: Map<Token, Value> = new Map()
}

const planNode = async (
  node: NodeProxy,
  ctx: DagPlanContext,
  inputs: [Token, Value, TokenQuantity][]
): Promise<[Token, NodeProxy, Value][]> => {
  if (node.isEndNode) {
    console.log(inputs.map((i) => i[2]).join(', '))
    for (const [token, value] of inputs) {
      let recipient =
        ctx.dag.result.output.token === token
          ? ctx.outputRecipient
          : ctx.dustRecipient

      const val = plannerUtils.erc20.balanceOf(
        ctx.universe,
        ctx.planner,
        token,
        ctx.thisAddress
      )

      plannerUtils.erc20.transfer(
        ctx.universe,
        ctx.planner,
        val,
        token,
        recipient
      )
    }
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
        approval.token.from(
          constants.MaxInt256.sub(constants.MaxInt256.div(4))
        ),
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

  public async generate(signer: Address, opts: { ethereumInput: boolean }) {
    const emitIdContract = Contract.createLibrary(
      EmitId__factory.connect(
        this.universe.config.addresses.emitId.address,
        this.universe.provider
      )
    )
    const nodes = this.result.nodeResults
    const planner = new Planner()
    planner.add(emitIdContract.emitId(this.zapId))

    const allTokens = new Set<Token>()

    for (const node of nodes) {
      for (const token of [...node.node.inputs, ...node.node.outputs]) {
        allTokens.add(token)
      }
    }

    const ctx = new DagPlanContext(
      this.universe,
      this.result,
      planner,
      signer,
      signer
    )

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
        }
        const summed = ctx.readBalance(token, true)
        return [token, summed, qty] as [Token, Value, TokenQuantity]
      })

      const result = await planNode(node.node, ctx, inputs)
      for (const [token, node, value] of result) {
        nodeInputs.get(node.id).get(token).push(value)
      }
    }

    const dustTokens = this.result.result.outputs
      .filter((o) => o.token !== this.result.result.output.token)
      .map((i) => i.token)

    const { res: testSimulation } = await evaluateProgram(
      this.universe,
      planner,
      this.result.result.inputs,
      dustTokens,
      signer,
      this.result.result.output.token.wei,
      opts
    )
    console.log(
      testSimulation.amountOut.toString(),
      testSimulation.dust.join(', ')
    )

    const minOutputWithSlippage = this.result.result.output.token.from(
      testSimulation.amountOut.amount - testSimulation.amountOut.amount / 10000n
    )

    const program = await evaluateProgram(
      this.universe,
      planner,
      this.result.result.inputs,
      dustTokens,
      signer,
      minOutputWithSlippage,
      opts
    )
    const result = {
      universe: this.universe,
      zapId: this.zapIdStr,
      startTime: Date.now(),
      blockNumber: this.blockNumber,
      tokenPrices: new Map(),
    }

    const stats = await ZapTxStats.create(result, {
      gasUnits: program.res.gasUnits + program.res.gasUnits / 6n,
      input: this.result.result.inputs[0],
      output: program.res.amountOut,
      dust: testSimulation.dust.filter(
        (i) => i.token !== program.res.amountOut.token && i.amount > 100000n
      ),
    })

    return ZapTransaction.create(
      result,
      planner,
      {
        tx: program.tx.tx,
        params: program.tx.params,
      },
      stats
    )
  }
}
