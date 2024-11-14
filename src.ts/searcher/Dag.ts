import { Logger } from 'winston'
import { Universe } from '../Universe'
import { Address } from '../base/Address'
import { DefaultMap } from '../base/DefaultMap'
import { PricedTokenQuantity, Token, TokenQuantity } from '../entities/Token'
import { TokenAmounts } from '../entities/TokenAmounts'
import { Planner, Value } from '../tx-gen/Planner'
import { SwapPlan } from './Swap'
import { isAbstractAction, TradeAction, WrappedAction } from './TradeAction'
import { BaseAction } from '../action/Action'

class DagEvalContext {
  public gasUsed: bigint = 0n
  public tradesUsed = new Set<Token | Address>()
  public get universe() {
    return this.dag.universe
  }
  public readonly balances: TokenAmounts = new TokenAmounts()
  constructor(public readonly dag: DagBuilder) {}
}
class DagPlanContext extends DagEvalContext {
  public readonly values: Map<Token, Value> = new Map()
  public readonly planner: Planner = new Planner()
}
const resolution = 10000
const stepSize = 1 / resolution
const normalizeVector = (vec: number[]) => {
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

abstract class DagNode {
  private static nextId = 0
  public get gasEstimate() {
    return 0n
  }

  public readonly id: number = DagNode.nextId++

  constructor(
    protected _inputs: [number, Token][],
    protected _outputs: [number, Token][]
  ) {}

  public get inputs() {
    return this._inputs
  }
  public get outputs() {
    return this._outputs
  }

  public dotNode() {
    return `node_${this.id} [label="${this.toString()}"]`
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
    inputs: Value[],
    destination: Address,
    predictedInputs: TokenQuantity[]
  ): Promise<Value | null> {
    throw new Error('Method not implemented.')
  }
}
class RootNode extends DagNode {
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
}
const copyVectors = (from: number[][], to: number[][]) => {
  for (let i = 0; i < from.length; i++) {
    for (let j = 0; j < from[i].length; j++) {
      to[i][j] = from[i][j]
    }
  }
}
class BalanceNode extends DagNode {
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

class OutputNode extends DagNode {
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
}

class ActionNode extends DagNode {
  constructor(
    public readonly inputProportions: [number, Token][],
    public readonly actions: SwapPlan,
    public readonly outputProportions: [number, Token][]
  ) {
    super(inputProportions, outputProportions)
  }

  toString() {
    return this.actions.steps.map((i) => i.toString()).join(' -> ')
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
    const path = await this.actions.quote(inputs)

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
  }
}
class SplitNode extends DagNode {
  public get outputs() {
    return this.splits_.map(
      (split) => [split, this.inputToken] as [number, Token]
    )
  }
  constructor(
    public readonly inputToken: Token,
    public splits_: number[],
    public readonly splitNodeIndex: number
  ) {
    super([[1, inputToken]], [])

    if (splits_.some((i) => isNaN(i) || !isFinite(i))) {
      throw new Error(
        `${this.dotNode()}: Split proportions must be finite numbers. Got ${splits_.join(
          ', '
        )}`
      )
    }
  }

  public getOutputProportion(token: Token, index: number) {
    if (token !== this.inputToken) {
      throw new Error(
        `${this.dotNode()}: Expected ${this.inputToken}, got ${token}`
      )
    }
    return this.splits_[index]
  }

  public dotEdges(
    dag: DagBuilder,
    outgoingEdges: [Token, DagNode[]][]
  ): string[] {
    const splits = dag.splitNodes[this.splitNodeIndex]
    return this.outputs.map(([, token], index) => {
      const consumers = outgoingEdges.find(([tok]) => tok === token)
      if (consumers == null) {
        console.log(
          `${this.dotNode()}: No consumers for ${token} from ${this.dotNode()}, ${outgoingEdges
            .map(([tok]) => tok.symbol)
            .join(', ')}`
        )
        throw new Error(`No consumers for ${token}`)
      }
      const split = splits[index]
      return `${this.dotId()} -> ${consumers[1]![index].dotId()} [label="${(
        split * 100
      ).toFixed(2)}% ${token}"]`
    })
  }

  toString() {
    return `Split`
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
    const input = inputs.reduce((l, r) => l.add(r), inputs[0].token.zero)
    const outEdge = outgoingEdges.find(([token]) => token === input.token) as
      | null
      | [Token, DagNode[]]
    if (outEdge == null) {
      throw new Error(`No consumers for ${input.token}`)
    }
    const [, consumers] = outEdge
    const splits = ctx.dag.splitNodes[this.splitNodeIndex]

    if (consumers.length !== splits.length) {
      throw new Error(
        `SplitNode must have as many consumers as splits. Consumers: ${consumers.map(
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
}

export class DagBuilderConfig {
  public readonly outputTokenSet: Set<Token>
  constructor(
    public readonly universe: Universe,
    public readonly logger: Logger,
    public readonly userInput: TokenQuantity[],
    public readonly userInputProportions: number[],
    public readonly userOutput: TokenQuantity[],
    public readonly userOutputProportions: number[]
  ) {
    this.outputTokenSet = new Set(userOutput.map((i) => i.token))
  }
}

class EvaluatedNode {
  public constructor(
    public readonly node: DagNode,
    public readonly inputs: TokenQuantity[],
    public readonly outputs: [DagNode, TokenQuantity][]
  ) {}

  public get price() {
    if (!(this.node instanceof ActionNode)) {
      return 0
    }
    if (
      this.node.actions.steps[0].inputToken.length !== 1 &&
      this.node.actions.steps[0].outputToken.length !== 1
    ) {
      return 0
    }
    const input = this.inputs[0]
    const output = this.outputs[0][1]
    return output.asNumber() / input.asNumber()
  }

  public get hasPrice() {
    return (
      this.node instanceof ActionNode &&
      this.node.actions.steps[0].inputToken.length === 1 &&
      this.node.actions.steps[0].outputToken.length === 1
    )
  }

  public abstractAction(): {
    action: TradeAction | WrappedAction
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

interface PricedTokenQuantities {
  readonly sum: number
  readonly prices: number[]
  readonly quantities: TokenQuantity[]
}
export class EvaluatedDag {
  public constructor(
    public readonly dag: DagBuilder,
    public readonly evaluated: EvaluatedNode[],
    private readonly inputs: PricedTokenQuantities,
    private readonly allOutputs_: PricedTokenQuantities,
    private readonly outputs_: PricedTokenQuantities,
    private readonly dust_: PricedTokenQuantities,
    public readonly txFee: PricedTokenQuantity
  ) {}

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
        if (val < 0.0001) {
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

type ObjectiveFunction = (dag: EvaluatedDag) => number

export class DagBuilder {
  private startNode!: DagNode
  private outputNode!: OutputNode

  private readonly edges = new DefaultMap<
    DagNode,
    DefaultMap<Token, DagNode[]>
  >(() => new DefaultMap<Token, DagNode[]>(() => []))
  private readonly dependencies = new DefaultMap<DagNode, DagNode[]>(() => [])

  private balanceNodeTip = new DefaultMap<Token, DagNode>((token) => {
    if (!this.balanceNodeStart.has(token)) {
      return this.outputNode
    }
    return new BalanceNode(token)
  })
  private proportionOfOutput = new Map<DagNode, number>()
  private proportionOfInput = new Map<DagNode, number>()
  private balanceNodeStart = new Map<Token, DagNode>()
  private _sorted: DagNode[] = []

  public splitNodes: number[][] = []
  private openTokenSet = new Map<
    Token,
    {
      proportion: number
      readonly consumers: {
        readonly proportion: number
        readonly consumer: DagNode
      }[]
    }
  >()

  // Clones the DAGBuilder such that the constant state is preserved, while the mutable state is copied
  public clone() {
    const self = new DagBuilder(this.universe, this.config)
    self.startNode = this.startNode
    self.outputNode = this.outputNode

    self.splitNodes = [...this.splitNodes.map((i) => [...i])]
    self.proportionOfInput = new Map(this.proportionOfInput)
    self.proportionOfOutput = new Map(this.proportionOfOutput)
    self._sorted = [...this._sorted]

    for (const [fromNode, outEdges] of this.edges.entries()) {
      for (const [token, nodes] of outEdges.entries()) {
        self.edges.get(fromNode).set(token, [...nodes])
      }
    }
    for (const [token, nodes] of this.dependencies.entries()) {
      self.dependencies.set(token, [...nodes])
    }
    for (const [token, node] of this.balanceNodeTip.entries()) {
      self.balanceNodeTip.set(token, node)
    }
    for (const [token, node] of this.balanceNodeStart.entries()) {
      self.balanceNodeStart.set(token, node)
    }
    for (const [token, consumers] of this.openTokenSet.entries()) {
      self.openTokenSet.set(token, {
        proportion: consumers.proportion,
        consumers: consumers.consumers.map((v) => {
          return {
            proportion: v.proportion,
            consumer: v.consumer,
          }
        }),
      })
    }
    return self
  }

  public get isDagConstructed() {
    return this.openTokenSet.size === 0
  }

  public toDot() {
    const sorted = this.getSorted()

    let out = 'digraph G {\n'
    for (const node of sorted) {
      out += '  ' + node.dotNode() + '\n'
    }
    for (const node of sorted) {
      const outgoing = [...this.edges.get(node).entries()]
      for (const s of node.dotEdges(this, outgoing)) {
        out += '  ' + s + '\n'
      }
    }
    out += '\n}'
    return out
  }

  public getBalanceStartNode(token: Token) {
    return this.balanceNodeStart.get(token)
  }
  public unspentInputTokens() {
    const outs = [...this.balanceNodeTip.entries()]
      .filter(
        ([i, n]) =>
          this.balanceNodeStart.has(i) &&
          (this.proportionOfInput.get(n) ?? 0) != 0
      )
      .map(
        ([t, n]) => [this.proportionOfInput.get(n) ?? 0, t] as [number, Token]
      )
    outs.sort((l, r) => r[0] - l[0])
    return outs.map(([_, t]) => t)
  }

  public get openTokens() {
    return [...this.openTokenSet.keys()]
  }
  private get nextTokenToMatch(): Token | null {
    for (const token of this.openTokenSet.keys()) {
      if (
        this.balanceNodeTip.has(token) &&
        this.balanceNodeTip.get(token) !== this.outputNode
      ) {
        return token
      }
    }
    return null
  }
  public static async create(universe: Universe, config: DagBuilderConfig) {
    const self = new DagBuilder(universe, config)

    self.startNode = new RootNode(
      config.userInputProportions.map((prop, index) => [
        prop,
        config.userInput[index].token,
      ])
    )
    self.outputNode = new OutputNode(
      config.userOutputProportions.map((prop, index) => [
        prop,
        config.userOutput[index].token,
      ])
    )

    self.proportionOfInput.set(self.startNode, 1.0)

    for (let i = 0; i < config.userInput.length; i++) {
      const proportion = config.userInputProportions[i]
      const token = config.userInput[i].token
      const inputBalanceNode = new BalanceNode(token)
      self.balanceNodeTip.set(token, inputBalanceNode)
      self.balanceNodeStart.set(token, inputBalanceNode)
      self.forward(self.startNode, token, inputBalanceNode)
      self.proportionOfInput.set(inputBalanceNode, proportion)
    }
    for (const qty of config.userOutput) {
      self.balanceNodeTip.set(qty.token, self.outputNode)
      self.proportionOfOutput.set(self.outputNode, qty.asNumber())
      self.openTokenSet.set(qty.token, {
        proportion: qty.asNumber(),
        consumers: [
          {
            proportion: 1.0,
            consumer: self.outputNode,
          },
        ],
      })
    }
    return self
  }

  private forward(from: DagNode, token: Token, next: DagNode) {
    if (from === next) {
      this.config.logger.warn(`Forwarding ${from} -> ${next} is a no-op`)
      return
    }
    const consumers = this.edges.get(from).get(token)
    const index = consumers.length
    consumers.push(next)
    const deps = this.dependencies.get(next)
    deps.push(from)

    const props = next.inputs
      .map(
        ([, token]) =>
          deps
            .filter(
              (dep) => dep.outputs.find(([_, tok]) => tok === token) != null
            )
            .map(
              (dep) =>
                (this.proportionOfInput.get(dep) ?? 0) *
                dep.getOutputProportion(token, index)
            )
            .reduce((l, r) => l + r, 0) * next.getInputProportion(token)
      )
      .reduce((l, r) => l + r, 0)

    this.proportionOfInput.set(next, props)
  }
  private constructor(
    public readonly universe: Universe,
    public readonly config: DagBuilderConfig
  ) {}

  public getUnspent() {
    const unspentInputs: [number, Token][] = []
    for (const [token, node] of this.balanceNodeTip.entries()) {
      const proportionOfInput = this.proportionOfInput.get(node) ?? 0

      if (proportionOfInput > 0.001) {
        unspentInputs.push([proportionOfInput, token])
      }
    }
    unspentInputs.sort((l, r) => r[0] - l[0])
    return unspentInputs.map(([_, token]) => token)
  }

  public spendInput(path: SwapPlan) {
    const inputNode = this.balanceNodeTip.get(path.inputs[0])
    const outputNode = this.balanceNodeStart.get(path.outputs[0])
    if (inputNode == null || outputNode == null) {
      throw new Error('Panic! Missing start node for ' + path.inputs[0])
    }
    const actNode = new ActionNode([[1, path.inputs[0]]], path, [
      [1, path.outputs[0]],
    ])

    this.forward(inputNode, path.inputs[0], actNode)
    this.forward(actNode, path.outputs[0], outputNode)
    this.balanceNodeTip.delete(path.inputs[0])
  }

  private normalizeOpenSet() {
    if (this.openTokenSet.size === 0) {
      return
    }
    let sum = 0.0
    for (const [token, { proportion }] of [...this.openTokenSet.entries()]) {
      if (proportion === 0.0) {
        this.openTokenSet.delete(token)
        continue
      }
      sum += proportion
    }
    if (sum > 1.01) {
      throw new Error(`Proportions sum is too high: ${sum} expected <= 1.0`)
    }

    if (sum === 0.0) {
      throw new Error('Sum is 0')
    }
    this.config.logger.debug(`Open tokens set:`)
    for (const [token, prop] of this.openTokenSet.entries()) {
      prop.proportion /= sum
      this.config.logger.debug(`  ${token}: ${prop.proportion}`)
      for (const consumer of prop.consumers) {
        this.config.logger.debug(
          `    ${consumer.consumer.dotId()}: ${consumer.proportion}`
        )
      }
    }
  }

  /** Connects up a balance node with the output derivation side.
   **/
  public matchBalances() {
    for (let i = 0; i < 50; i++) {
      const balanceToken = this.nextTokenToMatch
      if (balanceToken == null) {
        break
      }
      this.matchBalance(balanceToken)
    }
  }
  private matchBalance(token: Token) {
    if (!this.balanceNodeTip.has(token)) {
      throw new Error(`matchBalance: No balance node for ${token}`)
    }
    const previousNode = this.balanceNodeTip.get(token)
    if (previousNode === this.outputNode) {
      return
    }
    const { proportion: tokenOutputProportion, consumers } =
      this.takeOpenSet(token)

    // If there is more than one consumer, we need to split the current balance between all of them
    // and forward the remainder to the balance node

    if (this.openTokenSet.size !== 0) {
      let splits = [
        ...consumers.map(
          (consumer) => consumer.proportion * tokenOutputProportion
        ),
      ]
      const sum = splits.reduce((l, r) => l + r, 0)
      splits.push(1.0 - sum)
      normalizeVector(splits)
      const balanceNode = new BalanceNode(token)

      const splitNode = new SplitNode(token, splits, this.splitNodes.length)
      this.proportionOfInput.set(splitNode, tokenOutputProportion)
      this.splitNodes.push(splits)
      for (const consumer of [
        ...consumers.map((consumer) => consumer.consumer),
        balanceNode,
      ]) {
        this.forward(splitNode, token, consumer)
      }
      this.forward(previousNode, token, splitNode)

      this.balanceNodeTip.set(token, balanceNode)
    } else {
      this.balanceNodeTip.delete(token)
      if (consumers.length === 1) {
        this.forward(previousNode, token, consumers[0].consumer)
      } else {
        if (
          consumers.some((i) => isNaN(i.proportion) || !isFinite(i.proportion))
        ) {
          throw new Error(
            `Failed to match balance for ${token}: Consumer proportions must be finite numbers. Got ${consumers
              .map((i) => i.proportion)
              .join(', ')}`
          )
        }
        const splits = normalizeVector(
          consumers.map((consumer) => consumer.proportion)
        )
        const splitNode = new SplitNode(token, splits, this.splitNodes.length)
        this.forward(previousNode, token, splitNode)
        this.splitNodes.push(splits)
        for (const { consumer } of consumers) {
          this.forward(splitNode, token, consumer)
        }
      }
    }
  }

  private takeOpenSet(token: Token) {
    const outputProportion = this.openTokenSet.get(token)
    if (outputProportion == null) {
      throw new Error('No balance for token ' + token.toString())
    }
    this.openTokenSet.delete(token)
    this.normalizeOpenSet()
    return outputProportion
  }

  /**
   * Adds a new layer of nodes to the dag connecting it up to the open set.
   * A plan is a valid input IFF all output tokens are in the open set. Two plans may not produce the same output tokens.
   * The union of all outputs must be exactly the open set.
   *
   * The DAG is modified in the following way:
   *  At least one producer is added pr open set token
   *  IF there is more than one consumer pr open set token, a split node is added between producer and consumer
   */
  public async replaceOpenSet(tokenDerivations: SwapPlan[]) {
    const producers = new DefaultMap<Token, DagNode[]>(() => [])
    const consumers = new DefaultMap<Token, DagNode[]>(() => [])

    const newOpenTokenSet: Set<Token> = new Set()
    const plans = new Set<SwapPlan>()
    const nodeArrayToDagNode = (nodes: DagNode[]) => {
      return nodes.map((i) => ({
        proportion: 1.0 / nodes.length,
        consumer: i,
      }))
    }
    const maybeSplit = (
      token: Token,
      consumers: { proportion: number; consumer: DagNode }[]
    ) => {
      if (consumers.length === 1) {
        return consumers[0].consumer
      } else {
        const rates = consumers.map((i) => i.proportion)
        const splitNode = new SplitNode(token, rates, this.splitNodes.length)
        this.splitNodes.push(rates)
        for (const consumer of consumers) {
          this.forward(splitNode, token, consumer.consumer)
        }
        return splitNode
      }
    }
    for (const [token, prop] of this.openTokenSet.entries()) {
      const consumer = maybeSplit(token, prop.consumers)
      consumers.get(token).push(consumer)
    }
    const merged = new DefaultMap<BaseAction, SwapPlan>(
      (action) => new SwapPlan(this.universe, [action])
    )
    for (const plan of tokenDerivations) {
      for (const step of plan.steps) {
        const singleStepAction = merged.get(step)
        plans.add(singleStepAction)
      }
      for (const token of plan.inputs) {
        newOpenTokenSet.add(token)
      }
    }
    const newProducers: DagNode[] = []
    const tokenWeights: DefaultMap<Token, number> = new DefaultMap(() => 0)
    for (const plan of plans) {
      const actionNode = new ActionNode(
        (await plan.inputProportions()).map((i) => [i.asNumber(), i.token]),
        plan,
        (await plan.outputProportions()).map((i) => [i.asNumber(), i.token])
      )
      newProducers.push(actionNode)
      for (const [, token] of actionNode.outputs) {
        producers.get(token).push(actionNode)
      }
      for (const [proportion, token] of actionNode.inputs) {
        tokenWeights.set(token, tokenWeights.get(token) + proportion)
        consumers.get(token).push(actionNode)
      }

      for (const dust of plan.dustTokens) {
        this.forward(actionNode, dust, this.outputNode)
      }
    }
    for (const node of newProducers) {
      for (const [, token] of node.outputs) {
        const nodes = consumers.get(token)
        const consumer = maybeSplit(token, nodeArrayToDagNode(nodes))
        consumers.set(token, [consumer])
        this.forward(node, token, consumer)
      }
    }
    this.openTokenSet.clear()
    const sum = [...newOpenTokenSet]
      .map((i) => tokenWeights.get(i))
      .reduce((l, r) => l + r, 0)
    for (const [token, consumer] of consumers.entries()) {
      if (!newOpenTokenSet.has(token)) {
        continue
      }

      const inputNode = maybeSplit(token, nodeArrayToDagNode(consumer))
      const weight = tokenWeights.get(token) / sum
      this.openTokenSet.set(token, {
        proportion: weight,
        consumers: [{ proportion: 1.0, consumer: inputNode }],
      })
    }

    this.normalizeOpenSet()
  }

  public getSorted() {
    if (this.openTokenSet.size !== 0) {
      throw new Error('Cannot get sorted graph, graph is not built')
    }
    if (this.balanceNodeTip.size !== 0) {
      throw new Error('Cannot get sorted graph, graph is not finalized')
    }
    if (this._sorted.length !== 0) {
      return this._sorted
    }
    const sorted: DagNode[] = []
    const openSet: DagNode[] = []
    const seen: Set<DagNode> = new Set()
    const all = new Set<DagNode>()

    openSet.push(this.startNode)
    seen.add(this.outputNode)
    all.add(this.outputNode)
    while (openSet.length !== 0) {
      const node = openSet.pop()!
      sorted.push(node)
      seen.add(node)
      all.add(node)
      const consumers = [...this.edges.get(node).entries()].flatMap(
        ([_, nodes]) => nodes
      )
      for (const consumer of consumers) {
        all.add(consumer)
        if (seen.has(consumer)) {
          continue
        }
        const dependencies = this.dependencies.get(consumer)
        for (const dep of dependencies) {
          all.add(dep)
        }
        if (dependencies.every((i) => seen.has(i))) {
          openSet.push(consumer)
        }
      }
    }
    sorted.push(this.outputNode)
    // if (all.size !== sorted.length) {
    //   for (const node of all) {
    //     if (!sorted.includes(node)) {
    //       this.config.logger.error(`Missing node: ${node}`)
    //       sorted.push(node)
    //     }
    //   }
    // }
    this._sorted = sorted
    return sorted
  }

  // Routes all unspent dust to the output
  public finalize() {
    for (const [t, node] of this.balanceNodeTip.entries()) {
      if (node === this.outputNode) {
        continue
      }
      this.forward(node, t, this.outputNode)
    }
    this.balanceNodeTip.clear()

    this.simplify()
  }

  public async evaluate(inputs: TokenQuantity[] = this.config.userInput) {
    const inputTokenBag = TokenAmounts.fromQuantities(inputs)

    for (const { token } of this.config.userInput) {
      if (inputTokenBag.get(token).isZero) {
        throw new Error(
          `Missing input: DAG constructed with the assumption of non-zero input token ${token}, but evaluated with 0`
        )
      }
    }
    const inputTokenSet = new Set(this.config.userInput.map((i) => i.token))
    inputs = inputTokenBag.toTokenQuantities()
    inputTokenBag.toTokenQuantities().forEach((i) => {
      if (!inputTokenSet.has(i.token)) {
        throw new Error(
          `Invalid input: DAG expected inputs of ${this.config.userInput
            .map((i) => i.token)
            .join(', ')} but got ${i.token}`
        )
      }
    })
    const ctx = new DagEvalContext(this)
    const sorted = this.getSorted()
    const evaluated: EvaluatedNode[] = []
    const nodeInputs = new DefaultMap<DagNode, TokenAmounts>(
      () => new TokenAmounts()
    )
    nodeInputs.set(
      this.startNode,
      TokenAmounts.fromQuantities(this.config.userInput)
    )

    const inputsPriced = await Promise.all(
      inputs.map((i) => i.price().then((i) => i.asNumber()))
    )
    const valueOfInput = inputsPriced.reduce((l, r) => l + r, 0)
    const inputs_ = {
      sum: valueOfInput,
      quantities: inputs,
      prices: inputsPriced,
    }

    const evaluating = new Map<DagNode, Promise<void>>()

    const INTERPOLATION_THRESHOLD = 0.08
    for (const node of sorted) {
      if (node === this.outputNode) {
        continue
      }
      const deps = this.dependencies.get(node)
      await Promise.all(deps.map((dep) => evaluating.get(dep)))
      const inputTokenAmts = nodeInputs.get(node)

      const inputs = node.inputs.map((i) => inputTokenAmts.get(i[1]))
      const inputsValues = await Promise.all(
        inputs.map((i) => i.price().then((i) => i.asNumber()))
      )
      const nodeInputValue = inputsValues.reduce((l, r) => l + r, 0)
      const proportionOfInput = Math.min(nodeInputValue / valueOfInput, 1)
      const consumers = [...this.edges.get(node).entries()]

      // Since we're using gradient optimisation it is important to keep the objective function smooth,
      // so we should interpolate the output value and gasEstimate when the input value is nears 0
      //

      evaluating.set(
        node,
        node.evaluate(ctx, consumers, inputs).then((out) => {
          let outputResult = out
          let gasResult = node.gasEstimate

          if (proportionOfInput < INTERPOLATION_THRESHOLD) {
            const interpValue = 1 - proportionOfInput / INTERPOLATION_THRESHOLD
            gasResult = BigInt(Math.floor(Number(gasResult) * interpValue))
            // outputResult = outputResult.map((i) => [
            //   i[0],
            //   i[1].mul(i[1].token.from(interpValue)),
            // ])
          }

          evaluated.push(new EvaluatedNode(node, inputs, outputResult))
          if (nodeInputValue !== 0) {
            ctx.gasUsed += gasResult
          }

          if (out.length === 0 || out.every((i) => i[1].isZero)) {
            for (const qty of inputs) {
              nodeInputs.get(this.outputNode).add(qty)
            }
          }

          for (const [consumer, qty] of out) {
            nodeInputs.get(consumer).add(qty)
          }
        })
      )
    }
    await Promise.all(evaluating.values())

    const allOutputs = nodeInputs.get(this.outputNode).toTokenQuantities()
    const pricedAllOutputs = await Promise.all(
      allOutputs.map(
        async (i) =>
          [i.token, await i.price().then((i) => i.asNumber())] as const
      )
    )

    const allOutputs_: PricedTokenQuantities = {
      sum: pricedAllOutputs.reduce((l, r) => l + r[1], 0),
      quantities: allOutputs,
      prices: pricedAllOutputs.map((i) => i[1]),
    }

    const pricedOutputs = pricedAllOutputs.filter((i) =>
      this.config.outputTokenSet.has(i[0])
    )
    const outputs_: PricedTokenQuantities = {
      sum: pricedOutputs.reduce(
        (l, r) => l + (this.config.outputTokenSet.has(r[0]) ? r[1] : 0),
        0
      ),
      quantities: allOutputs.filter((i) =>
        this.config.outputTokenSet.has(i.token)
      ),
      prices: pricedOutputs
        .filter((i) => this.config.outputTokenSet.has(i[0]))
        .map((i) => i[1]),
    }
    const dust_: PricedTokenQuantities = {
      sum: allOutputs_.sum - outputs_.sum,
      quantities: allOutputs_.quantities.filter(
        (i) => !this.config.outputTokenSet.has(i.token)
      ),
      prices: pricedAllOutputs
        .filter((i) => !this.config.outputTokenSet.has(i[0]))
        .map((i) => i[1]),
    }

    const txFee = this.universe.nativeToken.from(
      this.universe.gasPrice * ctx.gasUsed
    )

    return new EvaluatedDag(
      this,
      evaluated,
      inputs_,
      allOutputs_,
      outputs_,
      dust_,
      new PricedTokenQuantity(txFee, await txFee.price())
    )
  }

  public replaceNode(previous: DagNode, replacement: DagNode) {
    for (const [token, prop] of [...this.openTokenSet.entries()]) {
      if (!prop.consumers.some((i) => i.consumer === previous)) {
        continue
      }
      this.openTokenSet.set(token, {
        ...prop,
        consumers: prop.consumers.map((i) => {
          if (i.consumer === previous) {
            return { proportion: i.proportion, consumer: replacement }
          }
          return i
        }),
      })
    }
    const replacementEdges = this.edges.get(replacement)
    for (const [token, nodes] of this.edges.get(previous)!) {
      replacementEdges.set(token, [...nodes])
    }
    const deps = this.dependencies.get(previous)!
    for (const dep of deps) {
      this.dependencies.get(replacement)!.push(dep)
    }
    for (const [token, node] of [...this.balanceNodeTip.entries()]) {
      if (node === previous) {
        this.balanceNodeTip.set(token, replacement)
      }
    }
    for (const [token, node] of [...this.balanceNodeStart.entries()]) {
      if (node === previous) {
        this.balanceNodeStart.set(token, replacement)
      }
    }
    for (const [node, prop] of [...this.proportionOfOutput.entries()]) {
      if (node === previous) {
        this.proportionOfOutput.set(node, prop)
      }
    }
    for (const [node, prop] of [...this.proportionOfInput.entries()]) {
      if (node === previous) {
        this.proportionOfInput.set(node, prop)
      }
    }
    this._sorted = this._sorted.map((i) => {
      if (i === previous) {
        return replacement
      }
      return i
    })
    this.dependencies.delete(previous)
    this.edges.delete(previous)
  }

  private async derivative(
    clones: DagBuilder[][],
    currentValue: number,
    objectiveFn: ObjectiveFunction,
    derivative: number[][]
  ) {
    const eps = 0.00001

    let magnitude = 0
    await Promise.all(
      clones.map(async (nodes, i) => {
        let mag = 0.0
        await Promise.all(
          nodes.map(async (dag, j) => {
            dag.splitNodes[i][j] += eps
            normalizeVector(dag.splitNodes[i])
            const newValue = objectiveFn(await dag.evaluate())

            const dimensionGradient = (newValue - currentValue) / eps
            derivative[i][j] = dimensionGradient
            mag += dimensionGradient * dimensionGradient
            for (let k = 0; k < this.splitNodes[i].length; k++) {
              dag.splitNodes[i][k] = this.splitNodes[i][k]
            }
          })
        )
        mag = Math.sqrt(mag)
        if (mag === 0) {
          return
        }
        magnitude += 1

        if (mag === 0) {
          return
        }
        for (let j = 0; j < derivative[i].length; j++) {
          derivative[i][j] = derivative[i][j] / mag
        }
      })
    )
    magnitude = Math.sqrt(magnitude)
    // console.log(magnitude)
    for (let i = 0; i < derivative.length; i++) {
      for (let j = 0; j < derivative[i].length; j++) {
        derivative[i][j] = derivative[i][j] / magnitude
      }
    }
    return magnitude
  }

  public get dustCanBeOptimised() {
    return this.splitNodes.length > 0
  }

  public mergeActionNodes(parent: SplitNode, mergeableNodes: ActionNode[]) {
    // Merge all the nodes in the parent
    const nodeA = mergeableNodes[0]
    const parentEdges = this.edges.get(parent).get(parent.inputToken)!
    const parentSplits = parent.splits_
    const removedNodes = new Set<DagNode>(mergeableNodes)
    const newParentEdges: DagNode[] = []
    const newSplits: number[] = []

    let totalWeight = 0
    for (let i = 0; i < parentEdges.length; i++) {
      const node = parentEdges[i]
      const split = parentSplits[i]
      if (removedNodes.has(node)) {
        totalWeight += split
      } else {
        newParentEdges.push(node)
        newSplits.push(split)
      }
    }
    newParentEdges.push(nodeA)
    newSplits.push(totalWeight)
    normalizeVector(newSplits)
    parent.splits_ = newSplits
    this.edges.get(parent).set(parent.inputToken, newParentEdges)
    this.splitNodes[parent.splitNodeIndex] = newSplits

    const allOutgoingEdges = new DefaultMap<Token, DagNode[]>(() => [])
    const allDependencies = new Set<DagNode>()
    for (const node of mergeableNodes) {
      for (const [token, nodes] of this.edges.get(node)!) {
        allOutgoingEdges.get(token).push(...nodes)
      }
      for (const dep of this.dependencies.get(node)!) {
        allDependencies.add(dep)
      }
      this.dependencies.delete(node)
      this.edges.delete(node)
    }

    // Created new merged node
    const newDeps = [...allDependencies]
    this.dependencies.set(nodeA, newDeps)
    const nodeAOutgoingEdges = this.edges.get(nodeA)

    for (const outputToken of nodeA.actions.outputs) {
      const outputNodes = allOutgoingEdges.get(outputToken)

      const splitNodeIndex = this.splitNodes.length
      const splits = outputNodes.map(() => 1 / outputNodes.length)
      const outputNode = new SplitNode(outputToken, splits, splitNodeIndex)

      this.splitNodes.push(splits)
      nodeAOutgoingEdges.set(outputToken, [outputNode])
      this.dependencies.get(outputNode).push(nodeA)
      for (const outNode of outputNodes) {
        const deps = this.dependencies.get(outNode)!
        for (let i = 0; i < deps.length; i++) {
          if (removedNodes.has(deps[i])) {
            deps[i] = outputNode
          }
        }
        this.edges.get(outputNode).get(outputToken).push(outNode)
      }
    }
  }
  public simplify() {
    if (!this.isDagConstructed) {
      throw new Error('Cannot simplify DAG, DAG is not constructed')
    }
    this._sorted = []
    const balanceNodes: BalanceNode[] = []

    // Step 1: Remove all balance nodes
    for (const node of this.edges.keys()) {
      if (node instanceof BalanceNode) {
        balanceNodes.push(node)
      }
    }
    for (const node of balanceNodes) {
      this.removeBalanceNode(node)
    }

    while (true) {
      const mergableSplitNodes: { parent: SplitNode; child: SplitNode }[] = []
      for (const childSplitNode of this.edges.keys()) {
        if (childSplitNode instanceof SplitNode) {
          const parentSplitNodes = this.dependencies
            .get(childSplitNode)
            .filter((i) => i instanceof SplitNode)
          if (parentSplitNodes.length === 0) {
            continue
          }
          mergableSplitNodes.push({
            parent: parentSplitNodes[0],
            child: childSplitNode,
          })
          break
        }
      }
      if (mergableSplitNodes.length === 0) {
        break
      }
      for (const { parent, child } of mergableSplitNodes) {
        this.mergeSplits(parent, child)
        const actNodeConsumers = this.edges
          .get(parent)
          .get(parent.inputToken)
          .filter((i) => i instanceof ActionNode)
        const consumersByAction = new DefaultMap<BaseAction, ActionNode[]>(
          () => []
        )
        for (const consumer of actNodeConsumers) {
          if (consumer.inputs.length !== 1) {
            continue
          }
          consumersByAction.get(consumer.actions.steps[0]).push(consumer)
        }
        for (const consumers of consumersByAction.values()) {
          if (consumers.length <= 1) {
            continue
          }
          this.mergeActionNodes(parent, consumers)
        }
        // Only merge one split pr iteration
        break
      }
    }
    this._sorted = []
  }

  public removeBalanceNode(node: BalanceNode) {
    const edges = this.edges.get(node)
    const deps = this.dependencies.get(node)

    const consumer = edges.get(node.token)[0]

    const consumerDeps = this.dependencies.get(consumer)!
    consumerDeps.splice(consumerDeps.indexOf(node), 1)
    for (const dep of deps) {
      consumerDeps.push(dep)
      for (const [_, nodes] of this.edges.get(dep)!) {
        nodes[nodes.indexOf(node)] = consumer
      }
    }

    this.edges.delete(node)
  }

  public mergeSplits(parent: SplitNode, child: SplitNode) {
    if (parent.inputToken !== child.inputToken) {
      throw new Error('Cannot merge splits, they are not the same')
    }
    if (parent.splitNodeIndex === child.splitNodeIndex) {
      return
    }
    const parentEdges = this.edges.get(parent).get(parent.inputToken)
    const childIndex = parentEdges.indexOf(child)
    const parentSplits = this.splitNodes[parent.splitNodeIndex]
    if (childIndex === -1) {
      throw new Error('Cannot merge splits, child is not a consumer of parent')
    }
    parentEdges.splice(childIndex, 1)
    parentSplits.splice(childIndex, 1)

    const childEdges = this.edges.get(child).get(child.inputToken)
    for (const edge of childEdges) {
      parentEdges.push(edge)
      const deps = this.dependencies.get(edge)!
      if (deps.length !== 0) {
        const childIndex = deps.indexOf(child)
        deps[childIndex] = parent
      }
    }
    const childSplits = this.splitNodes[child.splitNodeIndex]
    this.splitNodes[child.splitNodeIndex] = []
    parentSplits.push(...childSplits)
    parent.splits_ = parentSplits
    this.splitNodes[parent.splitNodeIndex] = parentSplits
    this.edges.delete(child)

    // Replace all references to the child with the parent
    // If node is a Split, edit the splitNodeIndex if it is greater than the child's
    for (const [_, outgoingEdges] of this.edges.entries()) {
      for (const [_, nodes] of outgoingEdges.entries()) {
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i]
          if (node === child) {
            nodes[i] = parent
          }
        }
      }
    }
    const newEdges = this.edges.get(parent).get(parent.inputToken)
    if (newEdges.includes(parent)) {
      const index = newEdges.indexOf(parent)
      newEdges.splice(index, 1)
      parent.splits_.splice(index, 1)
      this.splitNodes[parent.splitNodeIndex] = parent.splits_
    }
  }

  async mergeNodes() {
    if (!this.isDagConstructed) {
      throw new Error('Cannot get nodes, DAG is not constructed')
    }
  }

  async optimiseReduceDust(iterations: number) {
    if (this.splitNodes.length === 0) {
      return [await this.evaluate(), this] as const
    }

    if (!this.isDagConstructed) {
      throw new Error('Cannot optimise DAG, DAG is not constructed')
    }
    const copies = this.splitNodes.map((vect) => vect.map(() => this.clone()))
    const toReset = copies.map((i) => i.map((ii) => ii.splitNodes)).flat(1)

    let output = await this.evaluate()
    if (output.dustValue < 0.01) {
      return [output, this as DagBuilder] as const
    }
    const initialOutput = output

    // Minimize dust:
    // By giving dust a negative weight, we should minimize it.
    // But we should also try to minimize the imbalance between the dust qtys,
    // As it can be easy to find a local minima otherwise

    const valueFn: ObjectiveFunction = (value) => {
      return (
        value.outputsValue + value.totalValue - value.txFee.price.asNumber()
      )
    }

    let currentObjectiveValue = valueFn(initialOutput)
    if (isNaN(currentObjectiveValue)) {
      throw new Error('Initial value is NaN')
    }
    if (!isFinite(currentObjectiveValue)) {
      return [initialOutput, this as DagBuilder] as const
    }

    let derivative = this.splitNodes.map((vect) => vect.map(() => 0))

    let bestSoFar = {
      output: currentObjectiveValue,
      out: output,
      dag: this.clone(),
    }

    let worseCount = 0
    for (let iteration = 0; iteration < iterations; iteration++) {
      await this.derivative(copies, currentObjectiveValue, valueFn, derivative)
      let learningRate = 1 - iteration / iterations + 0.00001
      let nextRate = learningRate * 0.5
      for (let step = 0; step < 10; step++) {
        for (let i = 0; i < this.splitNodes.length; i++) {
          for (let j = 0; j < this.splitNodes[i].length; j++) {
            let newValue =
              this.splitNodes[i][j] + derivative[i][j] * learningRate

            this.splitNodes[i][j] =
              newValue < 0.01 && derivative[i][j] < 0 ? 0 : newValue
          }
          normalizeVector(this.splitNodes[i])
        }
        learningRate = nextRate
        nextRate *= 0.95

        const newOut = await this.evaluate()
        const newObjValue = valueFn(newOut)

        const worseResult = newObjValue < currentObjectiveValue

        const smallChange = 1 - newObjValue / currentObjectiveValue < 0.001

        if (newObjValue > bestSoFar.output) {
          console.log(
            `new best: ${newOut.outputs.join(', ')}, fee: ${
              newOut.txFee.quantity
            }, dust: ${newOut.dust.join(', ')}`
          )
          bestSoFar = {
            output: newObjValue,
            out: newOut,
            dag: this.clone(),
          }
        }

        output = newOut
        currentObjectiveValue = newObjValue

        for (let k = 0; k < toReset.length; k++) {
          copyVectors(this.splitNodes, toReset[k])
        }

        if (smallChange) {
          worseCount += 1
        } else {
          worseCount = 0
        }

        if (worseResult) {
          break
        }
      }

      if (worseCount > 25) {
        console.log('Reset')
        copyVectors(bestSoFar.dag.splitNodes, this.splitNodes)
        for (let k = 0; k < toReset.length; k++) {
          copyVectors(this.splitNodes, toReset[k])
        }
        currentObjectiveValue = bestSoFar.output
        worseCount = 0
      }
    }

    return [bestSoFar.out, bestSoFar.dag] as const
  }
}

export const isActionNode = (node: DagNode): node is ActionNode => {
  return node instanceof ActionNode
}
