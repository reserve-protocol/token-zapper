import { defaultAbiCoder, ParamType } from '@ethersproject/abi'
import { randomBytes } from 'crypto'
import { hexlify } from 'ethers/lib/utils'
import { plannerUtils } from '../action/Action'
import { DefaultMap } from '../base/DefaultMap'
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
  encodeTx,
} from './ToTransactionArgs'
import { EmitId__factory } from '../contracts'
import { Address } from '../base/Address'

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

  public async generate(signer: Address) {
    const emitIdContract = Contract.createLibrary(
      EmitId__factory.connect(
        this.universe.config.addresses.emitId.address,
        this.universe.provider
      )
    )
    const nodes = this.dag.evaluated
    const planner = new Planner()

    const allTokens = new Set<Token>()
    const innerDag = this.dag.dag

    for (const node of nodes) {
      const tokens = innerDag.edges.get(node.node).keys()
      for (const token of tokens) {
        allTokens.add(token)
      }
    }

    const ctx = new DagPlanContext(this.dag, planner, this.universe.execAddress)

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
    // Add all input tokens to the set of tokens to transfer back to the user
    for (const token of innerDag.config.inputTokenSet) {
      tokensToTransferBackToUser.add(token)
    }
    for (const token of tokensToTransferBackToUser) {
      let dest = ctx.outputRecipient
      if (!innerDag.config.outputTokenSet.has(token)) {
        dest = ctx.dustRecipient
      }
      plannerUtils.erc20.transfer(
        this.universe,
        planner,
        ctx.executionContractBalance.get(token),
        token,
        this.universe.execAddress
      )
    }

    planner.add(emitIdContract.emitId(this.zapId))

    const tx = encodeProgramToZapERC20Params(
      planner,
      innerDag.config.userInput[0],
      innerDag.config.userOutput[0].token.wei,
      [...allTokens]
    )
    const data = encodeCalldata(tx)
    let value = 0n
    if (innerDag.config.userInput[0].token === this.universe.nativeToken) {
      value = innerDag.config.userInput[0].amount
    }
    console.log(`Out program:`)
    console.log(printPlan(planner, this.universe).join('\n'))

    console.log(`Simulating...`)
    const simulationPayload = {
      to: this.universe.config.addresses.zapperAddress.address,
      from: signer.address,
      data,
      value,
      setup: {
        inputTokenAddress: innerDag.config.userInput[0].token.address.address,
        userBalanceAndApprovalRequirements: innerDag.config.userInput[0].amount,
      },
    }
    console.log(
      JSON.stringify(
        {
          to: this.universe.config.addresses.zapperAddress.address,
          from: signer.address,
          data,
          value: value.toString(),
          setup: {
            inputTokenAddress:
              innerDag.config.userInput[0].token.address.address,
            userBalanceAndApprovalRequirements:
              innerDag.config.userInput[0].amount.toString(),
          },
        },
        null,
        2
      )
    )
    const simulation = await this.universe.simulateZapFn(
      simulationPayload,
      this.universe
    )
    console.log(`Simulation result:`)
    console.log(simulation)
  }
}
