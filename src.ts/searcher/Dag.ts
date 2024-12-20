import { Logger } from 'winston'
import { Universe } from '..'
import { Address } from '../base/Address'
import { DefaultMap } from '../base/DefaultMap'
import { Token, TokenQuantity, PricedTokenQuantity } from '../entities/Token'
import { TokenAmounts } from '../entities/TokenAmounts'
import { Value, Planner, Contract } from '../tx-gen/Planner'
import { DagBuilder } from './DagBuilder'
import { SwapPath, SwapPlan } from './Swap'
import { isAbstractAction, TradeAction, WrappedAction } from './TradeAction'
import { BaseAction, ONE, plannerUtils } from '../action/Action'
import { Approval } from '../base/Approval'
import { IERC20__factory } from '../contracts'
import { constants } from 'ethers'
import { BlockCache } from '../base/BlockBasedCache'

export class DagEvalContext {
  public gasUsed: bigint = 0n
  public get universe() {
    return this.dag.universe
  }
  public readonly balances: TokenAmounts = new TokenAmounts()
  constructor(public readonly dag: DagBuilder) {}
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
    public readonly dag: EvaluatedDag,
    public readonly planner: Planner,
    public readonly outputRecipient: Address,
    public readonly dustRecipient: Address = outputRecipient
  ) {}
  public get universe() {
    return this.dag.dag.universe
  }
  public readonly values: Map<Token, Value> = new Map()
}
export const normalizeVector = (vec: number[]) => {
  if (vec.some((i) => isNaN(i))) {
    throw new Error(`NaN in vector: ${vec.join(', ')}`)
  }
  if (vec.length < 1) {
    return vec
  }
  if (vec.length === 1) {
    vec[0] = 1.0
    return vec
  }
  let sum = 0.0
  let min = 10
  for (let i = 0; i < vec.length; i++) {
    if (vec[i] < min) {
      min = vec[i]
    }
  }
  const offset = min < 0 ? -min : 0
  for (let i = 0; i < vec.length; i++) {
    if (offset !== 0) {
      vec[i] += offset
    }

    // Sum up total
    sum += vec[i]
  }
  if (sum === 0) {
    return vec
  }

  // let total = 0
  for (let i = 0; i < vec.length; i++) {
    vec[i] = vec[i] / sum
  }
  // if (tot
  return vec
}
export abstract class DagNode {
  private static nextId = 0
  public get gasEstimate() {
    return 0n
  }

  public get supportsDynamicInput() {
    return true
  }

  public readonly id: number = DagNode.nextId++

  constructor(
    protected readonly _inputs: [number, Token][],
    protected readonly _outputs: [number, Token][]
  ) {}

  public get inputs() {
    return this._inputs
  }
  public get outputs() {
    return this._outputs
  }

  public dotNode() {
    return `node_${this.id} [label="${this.id}: ${this.toString()}"]`
  }

  public dotId() {
    return `node_${this.id}`
  }

  public dotEdges(dag: DagBuilder, consumers: [Token, DagNode[]][]) {
    return consumers
      .map(([token, nodes]) => {
        const propValue =
          this.outputs.find(([_, tok]) => tok === token)?.[0] ?? 0

        const label =
          propValue === 0
            ? `~${token}`
            : propValue === 1
            ? token.symbol
            : `${(propValue * 100).toFixed(2)}% ${token}`
        return nodes.map(
          (node) => `${this.dotId()} -> ${node.dotId()} [label="${label}"]`
        )
      })
      .flat()
  }

  public getInputProportion(token: Token) {
    for (const [prop, tok] of this.inputs) {
      if (tok === token) {
        return prop
      }
    }
    throw new Error(
      `${this.dotNode()}: Failed to find input proportion for ${token}`
    )
  }

  public getOutputProportion(token: Token, index: number) {
    for (const [prop, tok] of this.outputs) {
      if (tok === token) {
        return prop
      }
    }
    throw new Error(
      `${this.dotNode()}: Failed to find output proportion for ${token}`
    )
  }

  public async evaluate(
    context: DagEvalContext,
    consumers: [Token, DagNode[]][],
    inputs: TokenQuantity[]
  ): Promise<[DagNode, TokenQuantity][]> {
    throw new Error('Method not implemented.')
  }

  public async plan(
    context: DagPlanContext,
    consumers: [Token, DagNode[]][],
    inputs: [Token, Value, TokenQuantity][]
  ): Promise<[Token, DagNode, Value][]> {
    throw new Error('Method not implemented.')
  }
}
export class RootNode extends DagNode {
  constructor(inputs: [number, Token][]) {
    super(inputs, inputs)
  }

  public async evaluate(
    context: DagEvalContext,
    outgoingEdges: [Token, DagNode[]][],
    inputs: TokenQuantity[]
  ) {
    for (const input of inputs) {
      context.balances.add(input)
    }
    const outputs: [DagNode, TokenQuantity][] = []
    for (const [token, consumers] of outgoingEdges) {
      if (consumers.length !== 1) {
        throw new Error('Root must have exactly one consumer pr input')
      }
      outputs.push([consumers[0], context.balances.get(token)])
      context.balances.tokenBalances.delete(token)
    }
    return outputs
  }
  public dotNode(): string {
    return 'root'
  }
  public dotId(): string {
    return 'root'
  }

  toString() {
    return `Root${this.inputs.map((i) => i[1]).join(', ')})`
  }

  public async plan(
    _: DagPlanContext,
    consumers: [Token, DagNode[]][],
    inputs: [Token, Value, TokenQuantity][]
  ) {
    return inputs.map(
      ([token, value], index) =>
        [token, consumers[index][1][0], value] as [Token, DagNode, Value]
    )
  }
}
export const copyVectors = (from: number[][], to: number[][]) => {
  for (let i = 0; i < from.length; i++) {
    for (let j = 0; j < from[i].length; j++) {
      to[i][j] = from[i][j]
    }
  }
}
/**
 * A temporary node to hold balances
 */
export class BalanceNode extends DagNode {
  constructor(public readonly token: Token) {
    super([[1, token]], [[1, token]])
  }

  public async evaluate(
    context: DagEvalContext,
    outgoingEdges: [Token, DagNode[]][],
    inputs: TokenQuantity[]
  ): Promise<[DagNode, TokenQuantity][]> {
    for (const input of inputs) {
      context.balances.add(input)
    }
    return outgoingEdges.map(([token, consumers]) => {
      if (consumers.length !== 1) {
        throw new Error(
          `BalanceNode must have exactly one consumer, got ${
            consumers.length
          } for ${token}, ${consumers.map((i) => i.toString())}`
        )
      }
      const bal = context.balances.get(token)
      context.balances.tokenBalances.delete(token)
      return [consumers[0], bal]
    })
  }

  toString() {
    return `bal_${this.token}`
  }
}
export class OutputNode extends DagNode {
  constructor(outputs: [number, Token][]) {
    super([], outputs)
  }
  public dotNode() {
    return 'output'
  }
  public dotId() {
    return 'output'
  }

  public async evaluate(
    context: DagEvalContext,
    outgoingEdges: [Token, DagNode[]][],
    inputs: TokenQuantity[]
  ) {
    return Promise.resolve(
      inputs.map((i) => [this, i] as [DagNode, TokenQuantity])
    )
  }
  toString() {
    return `OutputNode`
  }

  public async plan(
    context: DagPlanContext,
    consumers: [Token, DagNode[]][],
    inputs: [Token, Value, TokenQuantity][]
  ): Promise<[Token, DagNode, Value][]> {
    return []
  }
}
export class ActionNode extends DagNode {
  private readonly cachedResults: BlockCache<TokenQuantity[], SwapPath, string>
  constructor(
    public readonly inputProportions: [number, Token][],
    public actions: SwapPlan,
    public readonly outputProportions: [number, Token][]
  ) {
    super(inputProportions, outputProportions)
    this.cachedResults = actions.universe.createCache<
      TokenQuantity[],
      SwapPath,
      string
    >(
      async (input) => {
        const out = await this.actions.quote(input)
        // console.log(
        //   `${this.dotNode()}: ${this.inputs.join(', ')} => ${out.outputs.join(
        //     ', '
        //   )}`
        // )
        return out
      },
      12000,
      (input) => input.join(',')
    )
  }

  public get supportsDynamicInput() {
    return this.actions.steps[0].supportsDynamicInput
  }

  toString() {
    return `${
      this.actions.steps[0].protocol
    }.${this.actions.steps[0].address.toShortString()}`
  }

  public get abstractActions() {
    return this.actions.steps.filter((i) => isAbstractAction(i))
  }
  public get gasEstimate() {
    return this.actions.gasEstimate
  }
  public async evaluate(
    ctx: DagEvalContext,
    outgoingEdges: [Token, DagNode[]][],
    inputs: TokenQuantity[]
  ) {
    if (inputs.every((i) => i.isZero)) {
      return []
    }
    try {
      const totalInputSize = (
        await Promise.all(inputs.map(async (i) => (await i.price()).asNumber()))
      ).reduce((l, r) => l + r, 0)
      if (totalInputSize < 0.001) {
        console.log(
          `${this.actions}: small input?!, input=${inputs.join(', ')} ${inputs
            .map((i) => i.token.decimals)
            .join(', ')}`
        )
        return []
      }
      const path = await this.cachedResults.get(inputs)

      const out: [DagNode, TokenQuantity][] = []
      for (const output of [...path.outputs, ...path.dust]) {
        const edges = outgoingEdges.find(([token]) => token === output.token)

        if (edges == null || edges[1].length !== 1) {
          throw new Error(
            `${this.dotNode()}: Each output token must have exactly one consumer. Got ${
              edges == null ? 0 : edges[1].length
            } for ${output.token}`
          )
        }
        out.push([edges[1][0], output])
      }
      return out
    } catch (e) {
      console.log(`${this.actions}: Failed, input=${inputs.join(', ')}`)
      return []
    }
  }

  public async plan(
    ctx: DagPlanContext,
    consumers: [Token, DagNode[]][],
    inputs: [Token, Value, TokenQuantity][]
  ) {
    const predictedInputs: TokenQuantity[] = []
    const values: Value[] = []
    for (const input of inputs) {
      const val = inputs.find((t) => t[0] === input[0])
      if (val == null) {
        throw new Error(`No input for ${input[0]}`)
      }
      predictedInputs.push(val[2])
      values.push(input[1])
    }
    const execAddresss = ctx.universe.execAddress
    const recipeint = ctx.outputRecipient
    let destination = execAddresss
    if (
      consumers.every(([_, nodes]) =>
        nodes.every((i) => i === ctx.dag.dag.outputNode)
      )
    ) {
      destination = recipeint
    }

    const action = this.actions.steps[0]
    await ctx.setupApprovals(
      action.approvals.map((approval) => [
        approval.token.from(
          constants.MaxInt256.sub(constants.MaxInt256.div(4))
        ),
        approval,
      ])
    )
    const result = await action.plan(
      ctx.planner,
      values,
      destination,
      predictedInputs
    )
    if (result == null) {
      return []
    }
    return result.map(
      (v, index) => [this.outputs[index][1], this, v] as [Token, DagNode, Value]
    )
  }
}
export class SplitNode extends DagNode {
  constructor(
    public readonly inputToken: Token,
    public readonly splitNodeIndex: number
  ) {
    super([[1, inputToken]], [[1, inputToken]])
  }

  public dotEdges(
    dag: DagBuilder,
    outgoingEdges: [Token, DagNode[]][]
  ): string[] {
    if (outgoingEdges.length !== 1) {
      throw new Error(
        `${this.dotNode()}: SplitNode must have exactly one outgoing edge, got ${
          outgoingEdges.length
        }`
      )
    }
    const splits = dag.splitNodes[this.splitNodeIndex]
    const newValue = splits.map((split, index) => {
      const token = this.inputToken
      const consumers = outgoingEdges.find(([tok]) => tok === token)
      if (consumers == null) {
        throw new Error(`No consumers for ${token}`)
      }
      if (consumers[1][index] == null) {
        throw new Error(
          `${this.dotNode()}: No consumer for ${token} at index ${index}`
        )
      }
      return `${this.dotId()} -> ${consumers[1][index].dotId()} [label="${(
        split * 100
      ).toFixed(2)}% ${token}"]`
    })
    return newValue
  }

  toString() {
    return `Split_${this.splitNodeIndex}`
  }
  public async evaluate(
    ctx: DagEvalContext,
    outgoingEdges: [Token, DagNode[]][],
    inputs: TokenQuantity[]
  ) {
    if (inputs.every((i) => i.isZero)) {
      const out = outgoingEdges
        .map(([token, consumers]) => {
          return consumers.map(
            (c) => [c, token.zero] as [DagNode, TokenQuantity]
          )
        })
        .flat()
      return out
    }
    if (inputs.length === 0) {
      throw new Error('SplitNode must have at least one input')
    }
    if (inputs.every((i) => i.token !== inputs[0].token)) {
      throw new Error('SplitNode must have same token as input')
    }

    const splits = ctx.dag.splitNodes[this.splitNodeIndex]
    const input = inputs.reduce((l, r) => l.add(r), inputs[0].token.zero)
    const outEdge = outgoingEdges.find(([token]) => token === input.token) as
      | null
      | [Token, DagNode[]]
    if (outEdge == null) {
      throw new Error(`No consumers for ${input.token}`)
    }
    const [, consumers] = outEdge
    if (splits.every((i) => i === 0)) {
      return []
    }

    if (splits.some((i) => isNaN(i))) {
      throw new Error(`SplitNode ${this.dotNode()} has NaN split values`)
    }

    if (consumers.length !== splits.length) {
      throw new Error(
        `${this.dotNode()}: SplitNode must have as many consumers as splits. Consumers: ${consumers.map(
          (i) => i
        )}, splits: ${splits.length}`
      )
    }
    const outputs = splits.map((split, index) => {
      return [consumers[index], input.mul(input.token.from(split))] as [
        DagNode,
        TokenQuantity
      ]
    })
    return outputs
  }
  public async plan(
    ctx: DagPlanContext,
    consumers: [Token, DagNode[]][],
    inputs: [Token, Value, TokenQuantity][]
  ) {
    const [token, value] = inputs[0]
    const [, nodes] = consumers[0]
    const splits = ctx.dag.dag.splitNodes[this.splitNodeIndex]
      .map((splitValue, index) => [splitValue, index] as [number, number])
      .filter(([splitValue]) => splitValue !== 0)
    if (splits.length === 1) {
      const [_, index] = splits[0]
      return [[token, nodes[index], value] as [Token, DagNode, Value]]
    }

    ctx.planner.addComment(
      `Splitting ${token} into ${splits
        .map(([splitValue]) => `${(splitValue * 100).toFixed(2)}%`)
        .join(', ')}`
    )

    let sum = 0n
    const splitsBigInts = splits.map(([splitValue, index]) => {
      const fractionAsBigInt = BigInt(Math.floor(10 ** 18 * splitValue))
      sum += fractionAsBigInt
      return [index, fractionAsBigInt] as [number, bigint]
    })

    if (sum !== ONE) {
      let used = 0n
      for (const splitValue of splitsBigInts) {
        let newValue = (splitValue[1] * ONE) / sum
        used += newValue
        if (used > ONE) {
          newValue -= used - ONE
          used = ONE
        }
        splitValue[1] = newValue
      }
    }

    return splitsBigInts.map(([index, splitValue]) => {
      const consumer = nodes[index]
      return [
        token,
        consumer,
        ctx.bnFraction(splitValue, value, `=> ${consumer.dotNode()}`),
      ] as [Token, DagNode, Value]
    })
  }
}

export class DagBuilderConfig {
  public readonly outputTokenSet: Set<Token>
  public readonly inputTokenSet: Set<Token>
  constructor(
    public readonly universe: Universe,
    public readonly logger: Logger,
    public readonly userInput: TokenQuantity[],
    public readonly userInputProportions: number[],
    public readonly userOutput: TokenQuantity[],
    public readonly userOutputProportions: number[]
  ) {
    this.outputTokenSet = new Set(userOutput.map((i) => i.token))
    this.inputTokenSet = new Set(userInput.map((i) => i.token))
  }
}
export class EvaluatedNode {
  public constructor(
    public readonly node: DagNode,
    public readonly inputs: TokenQuantity[],
    public readonly inputValue: number,
    public readonly outputValue: number,
    public readonly outputs: [DagNode, TokenQuantity][],
    public readonly price: number
  ) {}

  public get hasPrice() {
    return (
      this.node instanceof ActionNode &&
      this.node.actions.steps[0].inputToken.length === 1 &&
      this.node.actions.steps[0].outputToken.length === 1
    )
  }

  public abstractAction(): {
    action: BaseAction
    inputs: TokenQuantity
    expectedOutputs: TokenQuantity
  } | null {
    if (this.node instanceof ActionNode) {
      if (this.inputs.length !== 1) {
        throw new Error('Expected single input')
      }
      if (this.outputs.length !== 1) {
        throw new Error('Expected single output')
      }
      const actions = this.node.abstractActions
      if (actions.length === 0) {
        return null
      }
      if (actions.length > 1) {
        throw new Error('Multiple abstract actions in a single node')
      }
      return {
        action: actions[0],
        inputs: this.inputs[0],
        expectedOutputs: this.outputs[0][1],
      }
    }
    return null
  }
}
export interface PricedTokenQuantities {
  readonly sum: number
  readonly prices: number[]
  readonly quantities: TokenQuantity[]
}
export class EvaluatedDag {
  private readonly reverseMap = new Map<DagNode, EvaluatedNode>()
  public constructor(
    public readonly dag: DagBuilder,
    public readonly evaluated: EvaluatedNode[],
    private readonly inputs: PricedTokenQuantities,
    private readonly allOutputs_: PricedTokenQuantities,
    private readonly outputs_: PricedTokenQuantities,
    private readonly dust_: PricedTokenQuantities,
    private readonly unspent_: PricedTokenQuantities,
    public readonly txFee: PricedTokenQuantity
  ) {
    for (const node of evaluated) {
      this.reverseMap.set(node.node, node)
    }
  }

  public clone() {
    return new EvaluatedDag(
      this.dag.clone(),
      [...this.evaluated],
      this.inputs,
      this.allOutputs_,
      this.outputs_,
      this.dust_,
      this.unspent_,
      this.txFee
    )
  }

  public get unspentValue() {
    return this.unspent_.sum
  }

  public getNode(node: DagNode) {
    return this.reverseMap.get(node)
  }

  public getAveragePrices() {
    const avgPrices = new DefaultMap<
      Token,
      DefaultMap<
        Token,
        {
          sum: number
          count: number
          avg: number
        }
      >
    >(() => new DefaultMap(() => ({ sum: 0, count: 0, avg: 0 })))

    for (const node of this.evaluated) {
      if (node.outputs.length === 0) {
        continue
      }
      const tokenIn = node.inputs[0].token
      const tokenOut = node.outputs[0][1].token
      const price = node.price
      if (price == 0) {
        continue
      }
      const q = avgPrices.get(tokenIn).get(tokenOut)
      q.sum += price
      q.count += 1
      q.avg = q.sum / q.count
    }
    return avgPrices
  }

  public get abstractActions() {
    return this.evaluated
      .flatMap((i) => i.abstractAction())
      .filter((act) => act != null)
  }

  public get inputsValue() {
    return this.inputs.sum
  }

  public get allOutputs() {
    return this.allOutputs_.quantities
  }
  public get outputs() {
    return this.outputs_.quantities
  }
  public get dust() {
    return this.dust_.quantities
  }
  public get dustValue() {
    return this.dust_.sum
  }
  public get outputsValue() {
    return this.outputs_.sum
  }
  public get totalValue() {
    return this.allOutputs_.sum
  }

  public toDot() {
    let out = 'digraph G {\n'
    for (const node of this.evaluated) {
      if (node.inputs.every((i) => i.isZero)) {
        continue
      }
      out += '  ' + node.node.dotNode() + '\n'
    }
    for (const node of this.evaluated) {
      for (const [consumer, qty] of node.outputs) {
        if (node.node === consumer) {
          continue
        }
        const val = qty.asNumber()
        if (val === 0) {
          continue
        }
        const price = node.hasPrice ? ', price=' + node.price : ''
        let digits = ''
        if (val === 1) {
          digits = ''
        } else if (Math.floor(val) === val) {
          digits = val.toString() + ' '
        } else {
          digits = val.toFixed(4) + ' '
        }
        out +=
          '  ' +
          node.node.dotId() +
          ' -> ' +
          consumer.dotId() +
          ' [label="' +
          `${digits}${qty.token.symbol}${price}"]\n`
      }
    }
    out += '\n}'
    return out
  }
}
