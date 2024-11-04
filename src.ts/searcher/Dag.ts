import { consumers } from 'stream'
import { Address } from '../base/Address'
import { DefaultMap } from '../base/DefaultMap'
import { Token, TokenQuantity } from '../entities/Token'
import { TokenAmounts } from '../entities/TokenAmounts'
import { Value, Planner } from '../tx-gen/Planner'
import { SwapPlan } from './Swap'
import { Universe } from '..'

class EvalContext {
  public readonly balances: TokenAmounts = new TokenAmounts()
  constructor(public readonly dag: Dag) { }
}
class PlanContext extends EvalContext {
  public readonly values: Map<Token, Value> = new Map()
  public readonly planner: Planner = new Planner()
}
abstract class DagNode {
  private static nextId = 0
  public proportionOfOutput: number = 0
  public readonly id: number = DagNode.nextId++
  public readonly dependencies: DagNode[] = []
  public readonly consumers = new DefaultMap<Token, DagNode[]>(() => [])

  constructor(
    public readonly inputs: [number, Token][],
    public readonly outputs: [number, Token][]
  ) { }

  public forward(token: Token, next: DagNode) {
    console.log(
      `Forwarding ${token} from ${this.dotNode()} to ${next.dotNode()}`
    )
    this.consumers.get(token).push(next)
    next.dependencies.push(this)
  }

  public dotNode() {
    return `node_${this.id} [label="${this.toString()}"]`
  }

  public dotId() {
    return `node_${this.id}`
  }

  public dotEdges() {
    return [...this.consumers.entries()]
      .map(([token, nodes]) => {
        return nodes.map(
          (node) => `${this.dotId()} -> ${node.dotId()} [label="${token}"]`
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
    throw new Error(`Failed to find input proportion for ${token}`)
  }

  public getOutputProportion(token: Token, consumer?: DagNode) {
    for (const [prop, tok] of this.outputs) {
      if (tok === token) {
        return prop
      }
    }
    return 0.0
  }

  public async evaluate(
    context: EvalContext,
    inputs: TokenQuantity[]
  ): Promise<[DagNode, TokenQuantity][]> {
    throw new Error('Method not implemented.')
  }

  public async plan(
    context: PlanContext,
    inputs: Value[],
    destination: Address,
    predictedInputs: TokenQuantity[]
  ): Promise<Value | null> {
    throw new Error('Method not implemented.')
  }
}
class EffectNode extends DagNode {
  constructor(
    private readonly effect: (
      consumers: DagNode[],
      context: EvalContext,
      inputs: TokenQuantity[]
    ) => Promise<[DagNode, TokenQuantity][]>,
    inputToken: Token,
    outputToken: Token,
    private readonly _toString?: () => string
  ) {
    super([[1, inputToken]], [[1, outputToken]])
  }
  toString() {
    return this._toString
      ? this._toString()
      : `EffectNode(id=${this.id}, deps=${this.dependencies})`
  }

  static balanceNode(token: Token) {
    return new EffectNode(
      async (consumers, context, inputs) => {
        if (consumers.length !== 1) {
          throw new Error('BalanceNode must have exactly one consumer')
        }
        for (const input of inputs) {
          context.balances.add(input)
        }
        const out = context.balances.get(token)
        context.balances.tokenBalances.delete(token)
        return [[consumers[0], out]]
      },
      token,
      token,
      () => `bal_${token}`
    )
  }

  public async evaluate(context: EvalContext, inputs: TokenQuantity[]) {
    return await this.effect(
      [...this.consumers.values()].map((i) => i[0]),
      context,
      inputs
    )
  }
}

class OutputNode extends DagNode {
  constructor() {
    super([], [])
  }
  public dotNode() {
    return 'output'
  }
  public dotId() {
    return 'output'
  }
  public async evaluate(context: EvalContext, inputs: TokenQuantity[]) {
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
    return `Act(${this.actions.steps.map((i) => i.protocol).join(' -> ')})`
  }

  public async evaluate(_: EvalContext, inputs: TokenQuantity[]) {
    const path = await this.actions.quote(inputs)

    for (const output of path.outputs) {
      const consumers = this.consumers.get(output.token)
      if (consumers.length !== 1) {
        throw new Error(
          `Each output token must have exactly one consumer. Got ${consumers.length} for ${output.token}`
        )
      }
    }

    return [...path.outputs, ...path.dust].map(
      (qty) =>
        [this.consumers.get(qty.token)![0], qty] as [DagNode, TokenQuantity]
    )
  }
}
class SplitNode extends DagNode {
  constructor(
    public readonly inputToken: Token,
    public readonly splits: number[]
  ) {
    super(
      [[1, inputToken]],
      splits.map((split) => [split, inputToken])
    )
    const sum = splits.reduce((l, r) => l + r)
    const diffFromOne = Math.abs(1 - sum)
    if (diffFromOne > 0.001) {
      throw new Error('SplitNode must sum to 1')
    }
  }

  public getOutputProportion(token: Token, consumer?: DagNode) {
    if (consumer == null) {
      return super.getOutputProportion(token)
    }
    const idx = this.consumers.get(token).findIndex((i) => i === consumer)
    if (idx === -1) {
      throw new Error('Panic! Missing consumer')
    }
    return this.splits[idx]
  }
  public dotEdges(): string[] {
    return this.outputs.map(
      ([split, token], index) =>
        `${this.dotId()} -> ${this.consumers
          .get(token)!
        [index].dotId()} [label="${(split * 100).toFixed(2)}% ${token}"]`
    )
  }
  toString() {
    return `Split`
  }
  public async evaluate(_: EvalContext, inputs: TokenQuantity[]) {
    if (inputs.length === 0) {
      throw new Error('SplitNode must have at least one input')
    }
    if (inputs.every((i) => i.token !== inputs[0].token)) {
      throw new Error('SplitNode must have same token as input')
    }
    const input = inputs.reduce((l, r) => l.add(r), inputs[0].token.zero)
    const consumers = this.consumers.get(input.token)
    if (consumers.length !== this.splits.length) {
      throw new Error('SplitNode must have as many consumers as splits')
    }
    const splitQtys = this.splits.map((split, index) => {
      return [consumers[index], input.mul(input.token.from(split))] as [
        DagNode,
        TokenQuantity
      ]
    })
    return splitQtys
  }
}
export class SearchContextConfig {
  constructor(
    public readonly userInput: TokenQuantity[],
    public readonly userOutput: TokenQuantity[]
  ) { }
}

class EvaluatedNode {
  public constructor(
    public readonly node: DagNode,
    public readonly inputs: TokenQuantity[],
    public readonly outputs: [DagNode, TokenQuantity][]
  ) { }
}

class EvaluatedDag {
  public constructor(
    public readonly dag: Dag,
    public readonly evaluated: EvaluatedNode[],
    public readonly outputs: TokenQuantity[]
  ) { }

  public toDot() {
    let out = 'digraph G {\n'
    for (const node of this.evaluated) {
      out += '  ' + node.node.dotNode() + '\n'
    }
    for (const node of this.evaluated) {
      for (const [consumer, qty] of node.outputs) {
        const val = qty.asNumber()
        if (val < 0.0001) {
          continue
        }
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
          `${digits}${qty.token.symbol}` +
          '"]\n'
      }
    }
    out += '\n}'
    return out
  }
}
export class Dag {
  public readonly root: DagNode
  public readonly outputs: DagNode
  private balanceNodeTip = new DefaultMap<Token, DagNode>((token) => {
    if (!this.balanceNodeStart.has(token)) {
      return this.outputs
    }
    return EffectNode.balanceNode(token)
  })
  private balanceNodeStart = new Map<Token, DagNode>()
  private sorted: DagNode[] = []
  private splitNodes: SplitNode[] = []

  private openTokenSet = new Map<
    Token,
    {
      proportion: number
      consumers: { proportion: number; consumer: DagNode }[]
    }
  >()

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
      for (const s of node.dotEdges()) {
        out += '  ' + s + '\n'
      }
    }
    out += '\n}'
    return out
  }

  public getBalanceStartNode(token: Token) {
    return this.balanceNodeStart.get(token)
  }

  public get openTokens() {
    return [...this.openTokenSet.keys()]
  }
  public get nextTokenToMatch(): Token | null {
    for (const token of this.openTokenSet.keys()) {
      if (
        this.balanceNodeTip.has(token) &&
        this.balanceNodeTip.get(token) !== this.outputs
      ) {
        return token
      }
    }
    return null
  }
  public static async create(universe: Universe, config: SearchContextConfig) {
    return new Dag(config)
  }
  private constructor(private readonly config: SearchContextConfig) {
    this.outputs = new OutputNode()
    this.root = new (class extends DagNode {
      constructor() {
        super(
          config.userInput.map((i) => [1, i.token]),
          config.userOutput.map((i) => [1, i.token])
        )
      }
      public async evaluate(context: EvalContext, inputs: TokenQuantity[]) {
        for (const input of inputs) {
          context.balances.add(input)
        }
        const outputs: [DagNode, TokenQuantity][] = []
        for (const [token, consumers] of this.consumers.entries()) {
          if (consumers.length !== 1) {
            throw new Error('Root must have exactly one consumer pr input')
          }
          outputs.push([consumers[0], context.balances.get(token)!])
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
    })()

    for (const { token } of config.userInput) {
      const inputBalanceNode = EffectNode.balanceNode(token)
      this.balanceNodeTip.set(token, inputBalanceNode)
      this.balanceNodeStart.set(token, inputBalanceNode)
      this.root.forward(token, inputBalanceNode)
    }
    for (const qty of config.userOutput) {
      this.balanceNodeTip.set(qty.token, this.outputs)
      this.outputs.proportionOfOutput = qty.asNumber()
      this.openTokenSet.set(qty.token, {
        proportion: this.outputs.proportionOfOutput,
        consumers: [
          {
            proportion: 1.0,
            consumer: this.outputs,
          },
        ],
      })
    }
  }

  public getUnspent() {
    const unspentInputs: Token[] = []
    const dust: Token[] = []
    for (const [token, node] of this.balanceNodeTip.entries()) {
      if (this.balanceNodeStart.has(token)) {
        if (this.balanceNodeStart.get(token) === node) {
          unspentInputs.push(token)
        } else {
          dust.push(token)
        }
      }
    }
    return {
      input: unspentInputs,
      dust,
    }
  }

  public spendInput(path: SwapPlan) {
    const inputNode = this.balanceNodeStart.get(path.inputs[0])
    const outputNode = this.balanceNodeStart.get(path.outputs[0])
    if (inputNode == null || outputNode == null) {
      throw new Error('Panic! Missing start node for ' + path.inputs[0])
    }
    const actNode = new ActionNode([[1, path.inputs[0]]], path, [
      [1, path.outputs[0]],
    ])

    inputNode.forward(path.inputs[0], actNode)
    actNode.forward(path.outputs[0], outputNode)
    this.balanceNodeTip.delete(path.inputs[0])
  }

  private normalizeProportions() {
    if (this.openTokenSet.size === 0) {
      return
    }
    let sum = 0.0
    for (const [_, { proportion }] of this.openTokenSet.entries()) {
      sum += proportion
    }
    if (sum > 1.0) {
      throw new Error('Proportions must sum less than 1')
    }
    for (const prop of this.openTokenSet.values()) {
      if (sum === 0.0) {
        throw new Error('Sum is 0')
      }
      prop.proportion /= sum
    }
    console.log('Normalized proportions')
    for (const [token, prop] of this.openTokenSet.entries()) {
      console.log(`  ${token}: ${prop.proportion}`)
    }
  }

  /** Matches a balance node with an open set token,
   *  this will create splits as neccessary and connect up balance nodes to the output nodes */
  public matchBalance(token: Token) {
    const previousNode = this.balanceNodeTip.get(token)
    if (previousNode == null) {
      throw new Error('No balance for token ' + token.toString())
    }
    if (previousNode === this.outputs) {
      return
    }
    console.log(`Matching balance for ${token}: ${previousNode}`)
    const { outputProportion: prop } = this.takeOpenSet(token)
    if (this.openTokenSet.size !== 0) {
      const propToSpend = prop.proportion

      const splits = [
        ...prop.consumers.map((consumer) => propToSpend * consumer.proportion),
        1.0 - propToSpend,
      ]
      if (splits.length <= 1) {
        throw new Error('No splits for token ' + token.toString())
      }
      const balanceNode = EffectNode.balanceNode(token)
      const consumers = [
        ...prop.consumers.map((consumer) => consumer.consumer),
        balanceNode,
      ]

      const splitNode = new SplitNode(token, splits)
      this.splitNodes.push(splitNode)
      for (const consumer of consumers) {
        splitNode.forward(token, consumer)
      }
      previousNode.forward(token, splitNode)

      this.balanceNodeTip.set(token, balanceNode)
      console.log(`Splits: ${splits.join(', ')}`)

      return splits.at(-1)!
    }
    this.balanceNodeTip.delete(token)
    if (prop.consumers.length === 1) {
      previousNode.forward(token, prop.consumers[0].consumer)
      return 0
    }

    let splits = prop.consumers.map((consumer) => consumer.proportion)
    const sum = splits.reduce((l, r) => l + r)

    splits = splits.map((split) => split / sum)

    const splitNode = new SplitNode(token, splits)
    previousNode.forward(token, splitNode)
    this.splitNodes.push(splitNode)
    for (const { consumer } of prop.consumers) {
      splitNode.forward(token, consumer)
    }

    return 0
  }

  private takeOpenSet(token: Token) {
    const prop = this.openTokenSet.get(token)
    if (prop == null) {
      throw new Error('No balance for token ' + token.toString())
    }
    this.openTokenSet.delete(token)
    this.normalizeProportions()
    return {
      outputProportion: prop,
    }
  }

  /**
   * Replace underived set:
   * A plan is a valid input IFF all output tokens are in the open set. Two plans may not produce the same output tokens.
   * The union of all outputs must be exactly the open set.
   *
   * The DAG is modified in the following way:
   *  At least one producer is added pr open set token
   *  IF there is more than one consumer pr open set token, a split node is added between producer and consumer
   */
  public async replaceOpenSet(tokenDerivations: SwapPlan[]) {
    console.log(`Replacing with ${tokenDerivations.join(', ')}`)
    const openSet = this.openTokenSet
    this.openTokenSet = new Map()

    const tokensToConsume = new Set<Token>()
    for (const token of openSet.keys()) {
      tokensToConsume.add(token)
    }

    const producers = new Map<Token, ActionNode>()
    const newOpenSetConsumers = new DefaultMap<Token, [number, DagNode][]>(
      () => []
    )

    const outputNodes = new DefaultMap<Token, [number, DagNode]>((token) => {
      const consumers = openSet.get(token)
      if (consumers == null) {
        throw new Error(`Panic! Missing consumers for ${token}`)
      }

      if (consumers.consumers.length === 1) {
        return [consumers.proportion, consumers.consumers[0].consumer] as const
      }
      const splits = consumers.consumers.map((consumer) => consumer.proportion)
      const sum = splits.reduce((l, r) => l + r)
      const splitNode = new SplitNode(
        token,
        splits.map((split) => split / sum)
      )
      this.splitNodes.push(splitNode)
      for (const { consumer } of consumers.consumers) {
        splitNode.forward(token, consumer)
      }

      return [consumers.proportion, splitNode] as const
    })
    for (const action of tokenDerivations) {
      if (!action.outputs.some((tok) => openSet.has(tok))) {
        throw new Error(
          `Cannot replace set: Invalid action ${action} does not produce any of the open set tokens`
        )
      }
      console.log('adding production for ' + action.toString())
      const inputs = await action
        .inputProportions()
        .then((i) =>
          i.map((qty) => [qty.asNumber(), qty.token] as [number, Token])
        )
      const outputs = await action
        .outputProportions()
        .then((i) =>
          i.map((qty) => [qty.asNumber(), qty.token] as [number, Token])
        )
      const actionNode = new ActionNode(inputs, action, outputs)
      for (const outputToken of action.outputs) {
        if (!openSet.has(outputToken)) {
          throw new Error(
            `Cannot replace set: token ${outputToken} is not in the open set`
          )
        }
        if (!tokensToConsume.has(outputToken)) {
          throw new Error(`Input token consumed`)
        }
        console.log(`Consuming ${outputToken}`)
        tokensToConsume.delete(outputToken)
        producers.set(outputToken, actionNode)
      }
      for (const dustToken of action.dustTokens) {
        actionNode.forward(dustToken, this.outputs)
      }

      for (const [proportion, inputToken] of inputs) {
        newOpenSetConsumers.get(inputToken).push([proportion, actionNode])
      }
    }

    if (tokensToConsume.size !== 0) {
      throw new Error(
        `Cannot replace set: Every token in open set consumed; ${[
          ...tokensToConsume,
        ].join(', ')} missing productions`
      )
    }

    const nodeWeights = new DefaultMap<DagNode, number>(() => 0)
    const inputConsumers = new DefaultMap<Token, DagNode[]>(() => [])

    for (const [outputToken, node] of producers.entries()) {
      const [proportion, forwardNode] = outputNodes.get(outputToken)!
      const currentWeight = nodeWeights.get(node)
      node.forward(outputToken, forwardNode)
      const weight = currentWeight + proportion
      nodeWeights.set(node, weight)
      node.proportionOfOutput = weight
      for (const [_, inputToken] of node.inputs) {
        inputConsumers.get(inputToken).push(node)
      }
    }

    for (const [inputToken, nodes] of inputConsumers.entries()) {
      let sum = 0.0
      const consumers: { proportion: number; consumer: DagNode }[] = []
      for (const node of nodes) {
        const nodeWeight = nodeWeights.get(node)

        sum += node.getInputProportion(inputToken) * nodeWeight
        consumers.push({ proportion: nodeWeight, consumer: node })
      }
      this.openTokenSet.set(inputToken, {
        proportion: sum,
        consumers,
      })
    }

    this.normalizeProportions()
  }
  public getSorted() {
    if (this.sorted.length !== 0) {
      return this.sorted
    }
    const sorted: DagNode[] = []
    const S: DagNode[] = []
    S.push(this.root)
    const seen: Set<DagNode> = new Set()
    seen.add(this.outputs)
    while (S.length !== 0) {
      const node = S.pop()!
      sorted.push(node)
      seen.add(node)

      for (const consumers of node.consumers.values()) {
        for (const consumer of consumers) {
          if (seen.has(consumer)) {
            continue
          }
          if (consumer.dependencies.every((i) => seen.has(i))) {
            S.push(consumer)
          }
        }
      }
    }
    this.sorted = sorted
    return sorted
  }

  public finialize() {
    for (const [t, node] of this.balanceNodeTip.entries()) {
      node.forward(t, this.outputs)
    }
    this.balanceNodeTip.clear()
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
    const ctx = new EvalContext(this)
    const sorted = this.getSorted()
    const evaluated: EvaluatedNode[] = []
    const nodeInputs = new DefaultMap<DagNode, TokenAmounts>(
      () => new TokenAmounts()
    )
    nodeInputs.set(
      this.root,
      TokenAmounts.fromQuantities(this.config.userInput)
    )

    for (const node of sorted) {
      const inputs = nodeInputs.get(node).toTokenQuantities()
      console.log(`Evaluating ${inputs} => ${node.dotId()}`)
      const out = await node.evaluate(ctx, inputs)
      evaluated.push(new EvaluatedNode(node, inputs, out))

      console.log(`${node.dotId()}:`)
      for (const [consumer, qty] of out) {
        console.log(`  - ${qty} => ${consumer.dotId()}`)
        nodeInputs.get(consumer).add(qty)
      }
    }
    return new EvaluatedDag(
      this,
      evaluated,
      nodeInputs.get(this.outputs)!.toTokenQuantities()
    )
  }
}
