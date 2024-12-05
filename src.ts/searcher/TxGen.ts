import { defaultAbiCoder, ParamType } from '@ethersproject/abi'
import { randomBytes } from 'crypto'
import { hexDataSlice, hexlify } from 'ethers/lib/utils'
import { plannerUtils } from '../action/Action'
import { Address } from '../base/Address'
import { DefaultMap } from '../base/DefaultMap'
import { EmitId__factory, Zapper__factory } from '../contracts'
import { Token, TokenQuantity } from '../entities/Token'
import {
  Contract,
  LiteralValue,
  Planner,
  printPlan,
  Value,
} from '../tx-gen/Planner'
import { DagNode, DagPlanContext, EvaluatedDag } from './Dag'
import {
  encodeCalldata,
  encodeProgramToZapERC20Params,
} from './ToTransactionArgs'
import { Universe } from '../Universe'
import { SimulateParams } from '../configuration/ZapSimulation'
import { ZapperOutputStructOutput } from '../contracts/contracts/Zapper.sol/Zapper'
import { DagBuilder } from './DagBuilder'
import { ZapTransaction, ZapTxStats } from './ZapTransaction'
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
  innerDag: DagBuilder,
  dustTokens: Token[],
  signer: Address,
  minOutput: TokenQuantity,
  opts: { ethereumInput: boolean }
) => {
  const tx = encodeProgramToZapERC20Params(
    planner,
    innerDag.config.userInput[0],
    innerDag.config.userOutput[0].token.wei,
    [...dustTokens]
  )
  const data = encodeCalldata(tx, opts.ethereumInput)
  let value = 0n
  if (opts.ethereumInput) {
    value = innerDag.config.userInput[0].amount
  }
  const simulationPayload = {
    to: universe.config.addresses.zapperAddress.address,
    from: signer.address,
    data,
    value,
    setup: {
      inputTokenAddress: innerDag.config.userInput[0].token.address.address,
      userBalanceAndApprovalRequirements: innerDag.config.userInput[0].amount,
    },
  }
  try {
    return {
      res: await simulateAndParse(
        universe,
        simulationPayload,
        innerDag.config.userOutput[0].token,
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

export class TxGen {
  private readonly zapIdBytes = randomBytes(32)
  public readonly zapId: bigint = BigInt(hexlify(this.zapIdBytes))
  public readonly zapIdStr = Buffer.from(this.zapIdBytes).toString('base64')
  public readonly blockNumber: number
  public get universe() {
    return this.dag.dag.universe
  }

  constructor(private dag: EvaluatedDag) {
    this.blockNumber = dag.dag.universe.currentBlock
  }

  public async generate(signer: Address, opts: { ethereumInput: boolean }) {
    console.log(`Generating tx for\n${this.dag.toDot()}`)
    console.log(
      `Expected output: ${this.dag.outputs.join(
        ', '
      )} dust=${this.dag.dust.join(', ')}`
    )
    const emitIdContract = Contract.createLibrary(
      EmitId__factory.connect(
        this.universe.config.addresses.emitId.address,
        this.universe.provider
      )
    )
    const nodes = this.dag.evaluated
    const planner = new Planner()
    planner.add(emitIdContract.emitId(this.zapId))

    const allTokens = new Set<Token>()
    const innerDag = this.dag.dag

    for (const node of nodes) {
      const tokens = innerDag.edges.get(node.node).keys()
      for (const token of tokens) {
        allTokens.add(token)
      }
    }

    const ctx = new DagPlanContext(this.dag, planner, signer, signer)

    const nodeInputs = new DefaultMap<DagNode, DefaultMap<Token, Value[]>>(
      () => new DefaultMap<Token, Value[]>(() => [])
    )

    const startNodeInput = new DefaultMap<Token, Value[]>(() => [])
    for (const input of innerDag.config.userInput) {
      startNodeInput.set(input.token, [
        ctx.executionContractBalance.get(input.token),
      ])
    }
    nodeInputs.set(nodes[0].node, startNodeInput)

    const tokensToTransferBackToUser = new Set<Token>()
    for (const node of nodes) {
      const outgoingEdges = innerDag.edges.get(node.node)
      for (const [token, consumers] of outgoingEdges) {
        for (const consumer of consumers) {
          if (consumer === innerDag.outputNode) {
            tokensToTransferBackToUser.add(token)
          }
        }
      }
      if (node.inputs.every((i) => i.isZero)) {
        continue
      }
      if (!nodeInputs.get(node.node)) {
        throw new Error('No inputs found for node')
      }
      const consumers = [...innerDag.edges.get(node.node).entries()]

      const inputs = node.inputs.map((qty) => {
        const token = qty.token
        const inputs = nodeInputs.get(node.node).get(token)
        if (inputs.length === 0) {
          let val: Value = new LiteralValue(
            ParamType.fromString('uint256'),
            defaultAbiCoder.encode(['uint256'], [qty.amount])
          )
          if (node.node.supportsDynamicInput) {
            val = ctx.executionContractBalance.get(token)
            ctx.executionContractBalance.delete(token)
          }

          return [token, val, qty] as [Token, Value, TokenQuantity]
        }
        if (inputs.length === 1) {
          return [token, inputs[0], qty] as [Token, Value, TokenQuantity]
        }
        const summed = inputs.reduce((acc, input) => ctx.add(acc, input))
        return [token, summed, qty] as [Token, Value, TokenQuantity]
      })
      const result = await node.node.plan(ctx, consumers, inputs)
      for (const [token, node, value] of result) {
        nodeInputs.get(node).get(token).push(value)
      }
    }
    const outputBal = plannerUtils.erc20.balanceOf(
      this.universe,
      planner,
      innerDag.config.userOutput[0].token,
      this.universe.execAddress
    )
    plannerUtils.erc20.transfer(
      this.universe,
      planner,
      outputBal,
      innerDag.config.userOutput[0].token,
      signer
    )

    const dustTokens = [...allTokens].filter(
      (i) => !innerDag.config.outputTokenSet.has(i)
    )
    const { res: testSimulation } = await evaluateProgram(
      this.universe,
      planner,
      innerDag,
      dustTokens,
      signer,
      innerDag.config.userOutput[0].token.from(1n),
      opts
    )

    const minOutputWithSlippage = innerDag.config.userOutput[0].token.from(
      testSimulation.amountOut.amount - testSimulation.amountOut.amount / 10000n
    )

    // Add all input tokens to the set of tokens to transfer back to the user

    for (const token of dustTokens) {
      let dest = ctx.outputRecipient
      if (!innerDag.config.outputTokenSet.has(token)) {
        dest = ctx.dustRecipient
      }
      const bal = plannerUtils.erc20.balanceOf(
        this.universe,
        planner,
        token,
        this.universe.execAddress
      )
      plannerUtils.erc20.transfer(this.universe, planner, bal, token, dest)
    }

    const program = await evaluateProgram(
      this.universe,
      planner,
      innerDag,
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
      gasUnits: program.res.gasUnits,
      input: innerDag.config.userInput[0],
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
