import { Universe } from '../Universe'
import { BaseAction, ONE } from '../action/Action'
import { DefaultMap } from '../base/DefaultMap'
import { Token, TokenQuantity } from '../entities/Token'
import { mintPath1To1, shortestPath } from '../exchange-graph/BFS'
import { Queue } from './Queue'
import { unwrapAction, wrapAction } from './TradeAction'
import { optimiseTrades } from './optimiseTrades'
import { Address } from '../base/Address'
import {
  ILoggerType,
  SearcherOptions,
} from '../configuration/ChainConfiguration'
import { DeployFolioConfig } from '../action/DeployFolioConfig'
import { ChainIds } from '../configuration/ReserveAddresses'

export class NodeProxy {
  private version: number

  public constructor(
    private readonly graph: TokenFlowGraph,
    public readonly id: number
  ) {
    this.version = graph.getVersion(id)
  }
  public get isStartNode() {
    return this.id === this.graph.start.id
  }
  public get isEndNode() {
    return this.id === this.graph.end.id
  }

  public get receivesInput() {
    if (this.isStartNode) {
      return true
    }
    return this.incomingEdges().some((i) => i.proportion > 0)
  }

  public get isDustOptimisable() {
    this.checkVersion()
    if (
      this.graph._outgoingEdges[this.id] == null ||
      this.graph._outgoingEdges[this.id]!.edges.length === 0
    ) {
      return false
    }
    return (
      (this.nodeType === NodeType.Both ||
        this.nodeType === NodeType.SplitWithDust) &&
      this.recipients.length > 1
    )
  }

  public hasOutflows() {
    this.checkVersion()
    return (
      this.graph._outgoingEdges[this.id]?.edges.some(
        (e) => e.parts.length > 0
      ) ?? false
    )
  }

  public *decendents(): Iterable<NodeProxy> {
    this.checkVersion()
    const visited = new Set<number>()
    visited.add(this.id)
    const queue = new Queue<NodeProxy>()
    queue.push(this)
    while (queue.isNotEmpty) {
      const node = queue.pop()

      for (const outgoingEdges of node.outgoingEdges()) {
        if (visited.has(outgoingEdges.recipient.id)) {
          continue
        }
        const inEdges = [...outgoingEdges.recipient.incomingEdges()]

        if (inEdges.some((e) => !visited.has(e.source.id))) {
          continue
        }

        visited.add(outgoingEdges.recipient.id)
        queue.push(outgoingEdges.recipient)
        yield outgoingEdges.recipient
      }
    }
  }

  public get recipients() {
    this.checkVersion()
    const seen = new Set<number>()
    const out: NodeProxy[] = []
    for (const edge of this.graph._outgoingEdges[this.id]?.edges ?? []) {
      for (const recipient of edge.recipient) {
        if (seen.has(recipient)) {
          continue
        }
        seen.add(recipient)
        out.push(this.graph.getNode(recipient))
      }
    }
    return out
  }

  public get isOptimisable() {
    this.checkVersion()
    if (
      this.nodeType === NodeType.Action ||
      this.nodeType === NodeType.Fanout
    ) {
      return false
    }
    if (this.outputs.length !== 1) {
      return false
    }
    return this.recipients.length > 1
  }

  public get isUseless() {
    if (
      this.action !== null ||
      this.isStartNode ||
      this.isEndNode ||
      this.isOptimisable ||
      this.isDustOptimisable
    ) {
      return false
    }

    if (this.isFanout && this.recipients.length === 1) {
      return true
    }

    const outgoing = [...this.outgoingEdges()]
    if (outgoing.length !== 1) {
      return false
    }
    const incoming = [...this.incomingEdges()]
    if (incoming.length !== 1) {
      return false
    }

    for (const edge of incoming) {
      if (edge.source.action !== null) {
        return false
      }
      if (edge.proportion !== 1) {
        return false
      }
    }
    for (const edge of outgoing) {
      if (edge.recipient.action !== null) {
        return false
      }
      if (edge.proportion !== 1) {
        return false
      }
    }

    return true
  }

  public get isFanout() {
    this.checkVersion()
    return this.nodeType === NodeType.Fanout
  }

  public getFanoutActions() {
    if (!this.isFanout) {
      return []
    }
    const out = new Set<BaseAction>()

    const outgoing = this.outgoingEdges()
    if (outgoing.length <= 1) {
      return []
    }
    for (const edge of outgoing) {
      if (edge.recipient.action instanceof BaseAction) {
        out.add(unwrapAction(edge.recipient.action))
      } else {
        throw new Error(
          `Fanout node ${this.nodeId} has non-action recipient ${edge.recipient.action}`
        )
      }
    }
    if (out.size <= 1) {
      return []
    }
    return Array.from(out)
  }

  public inputsSatisfied(): boolean {
    if (this.isStartNode) {
      return true
    }
    const inflows = this.incomingEdges()
    const tokens = new Set(inflows.map((edge) => edge.token))
    for (const token of this.inputs) {
      if (!tokens.has(token)) {
        return false
      }
    }
    return true
  }

  public get nodeType() {
    this.checkVersion()
    return this.graph.data[this.id].nodeType
  }

  public get inlinedGraph(): InlinedGraphRef | null {
    this.checkVersion()
    return this.graph.data[this.id].inlinedGraph
  }

  public set inlinedGraph(inlinedGraph: InlinedGraphRef | null) {
    this.checkVersion()
    this.graph.data[this.id].inlinedGraph = inlinedGraph
  }

  public set nodeType(nodeType: NodeType) {
    this.checkVersion()
    this.graph.data[this.id].nodeType = nodeType
  }

  public toString() {
    return `${this.id} - ${this.name}`
  }

  public outgoingEdge(token: Token) {
    this.checkVersion()
    return this.graph._outgoingEdges[this.id]!.getEdge(token)
  }

  private checkVersion() {
    if (this.graph.getVersion(this.id) !== this.version) {
      throw new Error(`Version mismatch for node ${this.id}`)
    }
  }
  private get nodeData() {
    this.checkVersion()
    const node = this.graph.data[this.id]
    if (node == null) {
      throw new Error(`Node ${this.id} not found`)
    }
    return node
  }

  public get inputs(): ReadonlyArray<Token> {
    return this.nodeData.inputs
  }

  public addOutputs(outputs: Token[]) {
    this.nodeData.addOutputs(outputs)
  }

  public addInputs(inputs: Token[]) {
    this.nodeData.addInputs(inputs)
  }

  public get action() {
    return this.nodeData.action
  }

  public get outputs(): ReadonlyArray<Token> {
    return this.nodeData.outputs
  }

  public get name() {
    return this.nodeData.name
  }

  public get nodeId() {
    return this.nodeData.nodeId
  }

  public forward(token: Token, parts: number, to: NodeProxy) {
    if (to.id === this.id) {
      return
    }
    this.graph.forward(this.id, to.id, token, parts)
  }

  public outgoingEdges(): Readonly<EdgeProxy[]> {
    this.checkVersion()
    const outgoing = this.graph._outgoingEdges[this.id]!
    return outgoing.edges.flatMap((edge) =>
      edge.recipient.map((recipientId) =>
        this.graph.getEdge(this.id, edge.token, recipientId)
      )
    )
  }

  public incomingEdges(): Readonly<EdgeProxy[]> {
    this.checkVersion()
    const incoming = this.graph._incomingEdges[this.id]!

    return incoming.map((edge) =>
      this.graph.getEdge(edge.source, edge.token, edge.recipient)
    )
  }
}

class TokenFlowSplits {
  public version = 0
  public inner: number[] = []
  private innerSum = 0
  private numberOfEnabled = 0
  public get activeEdges() {
    return this.numberOfEnabled
  }
  private proportionsAsBigInt: bigint[] = []
  private recipientIndices: number[] = []
  private updateIndicesMap() {
    if (this.recipient.length === 0) {
      this.recipientIndices = []
      this.version += 1
      return
    }
    this.version += 1

    let max = 0
    for (const recipient of this.recipient) {
      if (recipient > max) {
        max = recipient
      }
    }
    max += 1
    for (let i = 0; i < this.recipientIndices.length; i++) {
      this.recipientIndices[i] = -1
    }

    while (this.recipientIndices.length < max) {
      this.recipientIndices.push(-1)
    }
    for (let i = 0; i < this.recipient.length; i++) {
      this.recipientIndices[this.recipient[i]] = i
    }
  }
  public get length() {
    return this.recipient.length
  }
  public normalize() {
    let s = 0
    for (let i = 0; i < this.parts.length; i++) {
      s += this.parts[i]
    }
    for (let i = 0; i < this.parts.length; i++) {
      this.parts[i] = this.parts[i] / s
    }
    this.sum = 1
    this.calculateProportionsAsBigInt()
  }

  constructor(
    public readonly token: Token,
    public sum: number,
    public readonly parts: number[],
    public readonly recipient: number[],
    public min?: number,
    public readonly dustEdge = new DefaultMap<number, Token[]>(() => [])
  ) {
    this.calculateProportionsAsBigInt()
    this.updateIndicesMap()
  }

  public add(paramIndex: number, size: number) {
    if (isNaN(size) || !isFinite(size)) {
      throw new Error(`Invalid size ${size}`)
    }
    this.parts[paramIndex] += size
    this.sum += size
    this.calculateProportionsAsBigInt()
  }

  public get size() {
    if (this.recipient.length === 0) {
      return 1
    }
    return this.min ?? Math.min(1 / 30, 1 / this.parts.length / 2)
  }

  public calculateProportionsAsBigInt() {
    let s = 0
    this.numberOfEnabled = 0
    for (let i = 0; i < this.parts.length; i++) {
      if (isNaN(this.parts[i]) || !isFinite(this.parts[i])) {
        throw new Error(`Invalid part ${this.parts[i]}`)
      }
      const min = this.size

      const f = this.parts[i] / this.sum
      if (f < min) {
        this.inner[i] = 0
      } else {
        this.inner[i] = this.parts[i]
        s += this.inner[i]
        this.numberOfEnabled += 1
      }
    }
    this.innerSum = s

    let sumBn = 0n
    for (let i = 0; i < this.parts.length; i++) {
      if (s === 0) {
        this.proportionsAsBigInt[i] = 0n
        continue
      }
      this.proportionsAsBigInt[i] = BigInt(
        Math.floor((this.inner[i] / this.innerSum) * 1e18)
      )
      sumBn += this.proportionsAsBigInt[i]
    }
    if (sumBn > ONE) {
      const diff = sumBn - ONE
      for (let i = 0; i < this.parts.length; i++) {
        if (this.proportionsAsBigInt[i] === 0n) {
          continue
        }
        if (this.proportionsAsBigInt[i] < diff) {
          continue
        }
        this.proportionsAsBigInt[i] -= diff
        break
      }
    }
    if (sumBn < ONE) {
      const diff = ONE - sumBn
      for (let i = 0; i < this.parts.length; i++) {
        if (this.proportionsAsBigInt[i] === 0n) {
          continue
        }
        if (this.proportionsAsBigInt[i] + diff > ONE) {
          continue
        }
        this.proportionsAsBigInt[i] += diff
        break
      }
    }
  }
  public innerWeight(index: number) {
    return this.inner[index] / this.innerSum
  }

  public weightBn(index: number) {
    return this.proportionsAsBigInt[index]
  }

  public getWeight(recipient: number) {
    for (let i = 0; i < this.recipient.length; i++) {
      if (this.recipient[i] === recipient) {
        return this.inner[i]
      }
    }
    throw new Error(`Recipeint not found`)
  }

  public setParts(parts: number[]) {
    if (parts.length !== this.parts.length) {
      throw new Error(`Invalid parts length`)
    }
    this.sum = 0
    for (let i = 0; i < parts.length; i++) {
      this.parts[i] = parts[i]
      this.sum += parts[i]
    }
    this.calculateProportionsAsBigInt()
  }

  public getRecipientIndex(recipient: number) {
    if (recipient === -1) {
      throw new Error('Invalid recipient')
    }
    const idx = this.recipientIndices[recipient] ?? -1
    return idx
  }

  public forward(parts: number, recipient: number) {
    let idx = this.getRecipientIndex(recipient)
    if (idx === -1) {
      idx = this.recipient.length
      this.recipient.push(recipient)
      this.parts.push(parts)
      this.inner.push(0)
      this.sum += parts
      this.proportionsAsBigInt.push(0n)
    } else {
      this.sum = this.sum - this.parts[idx] + parts
      this.parts[idx] = parts
    }

    this.updateIndicesMap()

    this.calculateProportionsAsBigInt()
  }

  public *[Symbol.iterator]() {
    this.calculateProportionsAsBigInt()
    for (let i = 0; i < this.parts.length; i++) {
      yield {
        recipient: this.recipient[i],
        proportion: this.inner[i] / this.innerSum,
        proportionBn: this.proportionsAsBigInt[i],
      }
    }
  }

  public clone(min?: number) {
    return new TokenFlowSplits(
      this.token,
      this.sum,
      [...this.parts],
      [...this.recipient],
      this.min ?? min,
      this.dustEdge
    )
  }
}

class OutgoingTokens {
  private edgeMap = new DefaultMap<Token, number>((token) =>
    this.edges.findIndex((edge) => edge.token === token)
  )
  private recipientMap = new DefaultMap<number, Set<Token>>(() => new Set())
  public edges: TokenFlowSplits[] = []

  public hasEdge(token: Token, recipient: number) {
    if (!this.edgeMap.has(token)) {
      return false
    }
    const idx = this.edgeMap.get(token)!
    if (idx === -1) {
      const iidx = this.edges.findIndex((e) => e.token === token)
      if (iidx === -1) {
        return false
      }
      this.edgeMap.set(token, iidx)
    }
    return (
      this.edges[this.edgeMap.get(token)].getRecipientIndex(recipient) !== -1
    )
  }
  public version = 0

  public forward(token: Token, parts: number, recipient: number) {
    this.getEdge(token).forward(parts, recipient)
    this.recipientMap.get(recipient).add(token)
    this.version += 1
  }

  public getEdge(token: Token) {
    if (!this.edgeMap.has(token)) {
      const edge = new TokenFlowSplits(token, 0, [], [], this.min)
      this.edges.push(edge)
      this.edgeMap.set(
        token,
        this.edges.findIndex((e) => e.token === token)
      )
      return edge
    }
    const idx = this.edgeMap.get(token)
    if (idx === -1) {
      const edge = new TokenFlowSplits(token, 0, [], [], this.min)
      this.edges.push(edge)
      this.edgeMap.set(
        token,
        this.edges.findIndex((e) => e.token === token)
      )
      return edge
    }
    return this.edges[idx]
  }

  public addEdge(edge: TokenFlowSplits) {
    this.version += 1
    for (const recipient of edge.recipient) {
      this.recipientMap.get(recipient).add(edge.token)
    }
    this.edges.push(edge)
    this.edgeMap.set(edge.token, this.edges.indexOf(edge))
  }

  public constructor(
    public readonly nodeId: number,
    edges: TokenFlowSplits[],
    public min?: number
  ) {
    for (const edge of edges) {
      this.addEdge(edge)
    }
  }
  public clone() {
    return new OutgoingTokens(
      this.nodeId,
      this.edges.map((edge) => edge.clone(this.min)),
      this.min
    )
  }

  public *[Symbol.iterator]() {
    for (const edge of this.edges) {
      for (const split of edge) {
        yield {
          token: edge.token,
          proportion: split.proportion,
          proportionBn: split.proportionBn,
          recipient: split.recipient,
        }
      }
    }
  }
}

let nodeCounter = 0
enum NodeType {
  Split,
  SplitWithDust,
  Action,

  Optimisation,
  Fanout,
  Both,
}
class InlinedGraphRef {
  public constructor(
    public readonly graph: TokenFlowGraph,
    public readonly nodeId: number
  ) {}
}
class Node {
  public readonly name: string
  public readonly nodeId: string = `node_${nodeCounter++}`

  private inputs_: Token[] = []
  private outputs_: Token[] = []
  public get inputs() {
    return this.inputs_
  }
  public get outputs() {
    return this.outputs_
  }
  public addOutputs(tokens: Token[]) {
    for (const token of tokens) {
      if (this.outputs_.includes(token)) {
        continue
      }
      this.outputs_.push(token)
    }
  }
  public addInputs(tokens: Token[]) {
    for (const token of tokens) {
      if (this.inputs_.includes(token)) {
        continue
      }
      this.inputs_.push(token)
    }
  }
  public constructor(
    inputs: Token[] = [],
    public readonly action: TokenFlowGraph | BaseAction | null = null,
    outputs: Token[] = [],
    public nodeType: NodeType = NodeType.Action,
    name: string = '',
    public inlinedGraph: InlinedGraphRef | null = null
  ) {
    this.addInputs(inputs)
    this.addOutputs(outputs)
    this.name = name
    if (name.length === 0) {
      if (action != null) {
        if (action instanceof TokenFlowGraph) {
          this.name = `graph ${action.inputs.join(
            ' '
          )} into ${action.outputs.join(' ')}`
        } else {
          if (action.isTrade) {
            this.name = `${action.protocol} ${action.address.toShortString()}`
          } else {
            if (action.inputToken.length !== 1) {
              this.name = `${action.protocol}.${action.actionName}`
            } else if (action.outputToken.length !== 1) {
              this.name = `${action.protocol}.${action.actionName}`
            } else {
              this.name = action.protocol
            }
          }
        }
      }
    }
  }

  public clone() {
    return new Node(
      [...this.inputs],
      this.action,
      [...this.outputs],
      this.nodeType,
      this.name,
      this.inlinedGraph
    )
  }
}

const getInputsAndOutputs = (action: TokenFlowGraph | BaseAction | null) => {
  if (action && action instanceof TokenFlowGraph) {
    return {
      inputs: action.start.inputs,
      outputs: action.end.outputs,
    }
  }
  if (action && action instanceof BaseAction) {
    return {
      inputs: action.inputToken,
      outputs: action.dustTokens,
    }
  }
  return {
    inputs: [],
    outputs: [],
  }
}
class Edge {
  public constructor(
    public readonly source: number,
    public readonly token: Token,
    public readonly recipient: number
  ) {}
}

class EdgeProxy {
  private readonly outgoingEdge: TokenFlowSplits
  private get edgeRecipientIndex(): number {
    return this.outgoingEdge.getRecipientIndex(this.edge.recipient)
  }
  public readonly token: Token

  public get proportion() {
    this.checkEdgeExists()
    return this.outgoingEdge.innerWeight(this.edgeRecipientIndex)
  }
  public get proportionBn() {
    this.checkEdgeExists()
    return this.outgoingEdge.weightBn(this.edgeRecipientIndex)
  }
  public get recipient() {
    return this.graph.getNode(this.edge.recipient)
  }
  public get source() {
    return this.graph.getNode(this.edge.source)
  }
  private checkEdgeExists() {
    const outgoing = this.graph._outgoingEdges[this.edge.source]
    if (
      this.graph.data[this.edge.source] == null ||
      this.graph.data[this.edge.recipient] == null ||
      outgoing == null ||
      !outgoing.hasEdge(this.edge.token, this.edge.recipient)
    ) {
      throw new Error(
        `${this.source.name} -${this.token}> ${this.recipient.nodeId} edge not found`
      )
    }
  }

  get dustTokens() {
    return this.outgoingEdge.dustEdge.get(this.edgeRecipientIndex)
  }

  public constructor(
    public readonly graph: TokenFlowGraph,
    private readonly edge: Edge
  ) {
    this.outgoingEdge = this.source.outgoingEdge(this.edge.token)
    this.token = this.edge.token
  }
}

let graphId = 0

const createResult = async (
  universe: Universe,
  inputs: TokenQuantity[],
  outputs: TokenQuantity[],
  gasUnits: bigint,
  outputToken: Token
) => {
  try {
    const txFee = universe.nativeToken.from(gasUnits * universe.gasPrice)

    const [inputPrices, outputPrices, gasPrice] = await Promise.all([
      Promise.all(inputs.map((i) => i.price())),
      Promise.all(outputs.map((o) => o.price().then((i) => i.asNumber()))),
      txFee.price(),
    ])
    let outputTokenValue = 0
    let inputQuantity = 0
    let outputQuantity = 0

    let output = outputToken.zero

    const inputSum = inputPrices.reduce((acc, i) => acc + i.asNumber(), 0)
    const outputSum = outputPrices.reduce((acc, o) => acc + o, 0)

    for (let i = 0; i < outputs.length; i++) {
      if (outputs[i].token === outputToken) {
        outputTokenValue = outputPrices[i]
        outputQuantity = outputs[i].asNumber()
        output = outputs[i]
        break
      }
    }
    inputQuantity = inputs[0].asNumber()

    const price = outputTokenValue / (inputSum + gasPrice.asNumber())

    return {
      inputs,
      outputs,
      dust: outputs.filter((o) => o.token !== output.token && o.amount >= 1n),
      price,
      output,
      txFee,
      txFeeValue: txFee.asNumber(),
      inputQuantity,
      outputQuantity,
      inputValue: inputSum,
      totalValue: outputSum,
      dustValue: outputSum - outputTokenValue,
      outputValue: outputTokenValue,
      gas: gasUnits,
    }
  } catch (e) {
    console.log(e)
    console.log(
      JSON.stringify(
        {
          inputs: inputs.join(', '),
          outputs: outputs.join(', '),
          gasUnits: gasUnits.toString(),
          outputToken: outputToken.toString(),
        },
        null,
        2
      )
    )
    throw e
  }
}

type NodeResult = Awaited<ReturnType<typeof createResult>>

const evaluateNode = async (
  universe: Universe,
  graph: TokenFlowGraph,
  nodeId: number,
  allNodeInputs: bigint[][],
  allNodeOutputs: bigint[][],
  beforeEvaluate?: (node: NodeProxy, inputs: TokenQuantity[]) => Promise<void>
) => {
  let gasUsage = 0n
  const nodeInput = allNodeInputs[nodeId]
  const node = graph.getNode(nodeId)
  const nodeOutput = allNodeOutputs[nodeId]

  const action = graph.data[nodeId].action

  let actionOutputs: TokenQuantity[] = []

  let actionInputs: TokenQuantity[] = []

  if (action !== null) {
    const inouts = getInputsAndOutputs(node.action)
    const inputTokens = inouts.inputs

    let gas = 0n
    if (action instanceof TokenFlowGraph) {
      actionInputs = inputTokens.map((tok) => {
        const idx = graph.getTokenId(tok)!
        const qty = nodeInput[idx]
        return tok.from(qty)
      })

      const out = await action.evaluate(universe, actionInputs, beforeEvaluate)
      gas = out.result.gas

      for (const o of out.result.outputs) {
        actionOutputs.push(o)
      }
    } else {
      actionInputs = action.inputToken.map((tok) => {
        const idx = graph.getTokenId(tok)!
        const qty = nodeInput[idx]
        return tok.from(qty)
      })
      gas = action.gasEstimate()

      try {
        if (action.dustTokens.length !== 0) {
          const out = await action.quoteWithDust(actionInputs)
          for (const o of out.output) {
            actionOutputs.push(o)
          }
          for (const d of out.dust) {
            if (d.amount === 0n) {
              continue
            }
            actionOutputs.push(d)
          }
        } else {
          for (const o of await action.quote(actionInputs)) {
            actionOutputs.push(o)
          }
        }
      } catch (e) {
        const outputs = action.outputToken.map((i) => i.zero)
        return await createResult(
          universe,
          actionInputs,
          outputs,
          0n,
          action.outputToken[0]
        )
      }
    }

    if (
      actionOutputs.length !== 0 &&
      actionOutputs.every((i) => i.amount > 0n)
    ) {
      gasUsage += gas
    }

    for (const out of actionOutputs) {
      if (out.amount === 0n) {
        continue
      }
      nodeOutput[graph.getTokenId(out.token)] = out.amount
    }
  } else {
    const tokens = graph.getTokens()
    actionInputs = nodeInput.map((size, idx) => tokens[idx].from(size))
    actionOutputs = [...actionInputs]
    for (let i = 0; i < nodeInput.length; i++) {
      nodeOutput[i] = nodeInput[i]
    }
  }

  const edges = graph._outgoingEdges[nodeId]
  if (edges == null || edges.edges.length === 0) {
    if (!node.isEndNode) {
      // console.log(node.nodeId + ' has no edges')
    }
    return await createResult(
      universe,
      actionInputs,
      actionInputs,
      gasUsage,
      node.outputs[0] ?? node.inputs[0]
    )
  }

  if (
    beforeEvaluate != null &&
    action === null &&
    edges.edges.some((e) => e.recipient.length !== 0)
  ) {
    await beforeEvaluate(node, actionInputs)
  }
  for (const edge of edges.edges) {
    edge.calculateProportionsAsBigInt()
    const token = edge.token

    const tokenIdx = graph.getTokenId(token)!

    const output = nodeOutput[tokenIdx]
    if (output === 0n) {
      continue
    }
    let amtLeft = output
    for (
      let recipientIndex = 0;
      recipientIndex < edge.recipient.length;
      recipientIndex++
    ) {
      const recipientNodeId = edge.recipient[recipientIndex]
      const proportionBn = edge.weightBn(recipientIndex)
      if (proportionBn === 0n) {
        continue
      }

      if (proportionBn >= ONE) {
        if (amtLeft !== output) {
          console.log(node.nodeId + ' amtLeft !== output')
        }
        allNodeInputs[recipientNodeId][tokenIdx] += output
        amtLeft = 0n
      } else {
        const qty = (output * proportionBn) / ONE
        if (amtLeft < qty) {
          console.log(node.nodeId + ' amtLeft < qty')
          allNodeInputs[recipientNodeId][tokenIdx] += qty
          amtLeft = 0n
        } else {
          allNodeInputs[recipientNodeId][tokenIdx] += qty
          amtLeft -= qty
        }
      }
    }
  }

  return await createResult(
    universe,
    actionInputs,
    actionOutputs,
    gasUsage,
    graph._nodes[nodeId].outputs[0]
  )
}

export class TFGResult {
  public constructor(
    public readonly result: NodeResult,
    public readonly nodeResults: { node: NodeProxy; result: NodeResult }[],
    public readonly graph: TokenFlowGraph
  ) {}
}

export class TokenFlowGraph {
  [Symbol.toStringTag]: string = 'TokenFlowGraph'

  public toString() {
    return `${this[Symbol.toStringTag]}(${this.name})`
  }

  public *nodes() {
    for (let i = 0; i < this._nodes.length; i++) {
      if (this._nodes[i] != null) {
        yield this.getNode(i)
      }
    }
  }

  public getEdge(sourceId: number, token: Token, recipientId: number) {
    if (sourceId === recipientId) {
      throw new Error('sourceId cannot be the graph id')
    }
    return new EdgeProxy(this, new Edge(sourceId, token, recipientId))
  }

  public static createNullGraph(inputs: Token[]) {
    const graph = new TokenFlowGraph(`NOP`, inputs, inputs)
    for (const input of inputs) {
      graph.start.forward(input, 1, graph.end)
      graph.end.forward(input, 1, graph.start)
    }
    return graph
  }

  private tokens = new Map<Token, number>()
  public getTokens() {
    return [...this.tokens.keys()]
  }

  public getDustTokens() {
    return this.getTokens().filter((t) => t !== this.outputs[0])
  }
  public getTokenId(token: Token) {
    if (!this.tokens.has(token)) {
      this.tokens.set(token, this.tokens.size)
    }
    return this.tokens.get(token)!
  }
  private graphId = graphId++
  private subgraphs = 0
  public name: string = `graph_${this.graphId}`
  private freeList: number[] = []
  _outgoingEdges: (OutgoingTokens | null)[] = []
  _incomingEdges: Edge[][] = []
  _incomingEdgeVersion: number[] = []
  _nodes: Node[] = []

  public get data() {
    return this._nodes
  }
  private nodeVersions: number[] = []
  _startIndex: number
  _endIndex: number
  public get start() {
    return this.getNode(this._startIndex)
  }
  public get end() {
    return this.getNode(this._endIndex)
  }

  public get inputs() {
    return this._nodes[this._startIndex].inputs
  }

  public get outputs() {
    return this._nodes[this._endIndex].outputs
  }

  public get containsSubgraphs() {
    return this.subgraphs !== 0
  }

  public async evaluate(
    universe: Universe,
    inputs: TokenQuantity[],
    beforeEvaluate?: (node: NodeProxy, inputs: TokenQuantity[]) => Promise<void>
  ): Promise<TFGResult> {
    let gasUnits = 0n
    for (const token of inputs) {
      this.getTokenId(token.token)
    }
    const tokens = [...this.tokens.keys()]
    const revMap: Token[] = tokens.map((tok) => tok)
    for (const tok of tokens) {
      const idx = this.getTokenId(tok)!
      revMap[idx] = tok
    }

    const allNodeInputs = this._nodes.map(() => tokens.map(() => 0n))
    const allNodeOutputs = this._nodes.map(() => tokens.map(() => 0n))
    for (const input of inputs) {
      allNodeInputs[this._startIndex][this.getTokenId(input.token)!] =
        input.amount
    }

    const resolvers: ((x: NodeProxy) => void)[] = this._nodes.map(
      () => () => {}
    )
    const resolved = this._nodes.map(() => false)

    const awaiting: Promise<any>[] = this._nodes.map((_, nodeId) => {
      return new Promise((resolve) => {
        resolvers[nodeId] = (node) => {
          resolved[nodeId] = true
          resolve(node)
        }
      })
    })
    const sorted = this.sort()

    const tasks: Promise<NodeResult | null>[] = []

    const task = async (node: NodeProxy) => {
      const dependencies = this._incomingEdges[node.id].map(
        (edge) => awaiting[edge.source]
      )
      await Promise.all(dependencies)
      if (allNodeInputs[node.id].every((i) => i === 0n)) {
        return null
      } else {
        const res = await evaluateNode(
          universe,
          this,
          node.id,
          allNodeInputs,
          allNodeOutputs,
          beforeEvaluate
        )

        // console.log(
        //   `${res.inputs.filter((t) => t.amount !== 0n).join(', ')} -> ${
        //     node.nodeId
        //   } -> ${res.outputs.filter((i) => i.amount !== 0n).join(', ')}`
        // )

        gasUnits += res.gas
        return res
      }
    }
    for (const node of sorted) {
      const promise = task(node)
        .then((result) => {
          resolvers[node.id](node)
          return result
        })
        .catch((e) => {
          console.log(e)
          return null
        })
      tasks.push(promise)
    }
    const nodeResults = (await Promise.all(tasks))
      .map((i, index) => {
        if (i == null) {
          return null
        }
        return {
          node: sorted[index],
          result: i,
        }
      })
      .filter((i) => i != null)

    const endOutputs = allNodeOutputs[this._endIndex]
    const out = await createResult(
      universe,
      inputs,
      endOutputs.map((qty, idx) => revMap[idx].from(qty)),
      gasUnits,
      this.outputs[0]
    )
    return new TFGResult(out, nodeResults, this)
  }

  public clone() {
    const graph = new TokenFlowGraph(this.name)
    graph._nodes = [...this._nodes]
    graph.subgraphs = this.subgraphs
    graph.start.addInputs(this.inputs)
    graph.end.addOutputs(this.outputs)
    graph.tokens = new Map([...this.tokens])
    graph._outgoingEdges = this._outgoingEdges.map(
      (edge) => edge?.clone() ?? null
    )
    graph._incomingEdges = this._incomingEdges.map((e) => e.map((e) => e))
    graph.nodeVersions = [...this.nodeVersions]
    graph._incomingEdgeVersion = [...this._incomingEdgeVersion]
    graph._startIndex = this._startIndex
    graph._endIndex = this._endIndex
    for (const id of this.freeList) {
      graph.freeList.push(id)
    }
    return graph
  }

  public toDot(top: boolean = true): string[] {
    const lines: string[] = []
    let indent = ''
    const moveIndent = (chrs: number) => {
      if (chrs > 0) {
        indent = indent + ' '.repeat(chrs)
      } else {
        indent = indent.slice(0, indent.length - 2)
      }
    }
    const begin = (chr: string) => {
      emit(chr)
      moveIndent(2)
    }
    const end = (chr: string) => {
      moveIndent(-2)
      emit(chr)
    }
    const emit = (s: string) => {
      lines.push(`${indent}${s}`)
    }
    if (top) {
      begin('digraph G {')
      begin('graph [')
      emit('splines = false')
      emit('center = 1')
      emit('newrank = true')
      end(']')
      emit('node [fontname="Helvetica,Arial,sans-serif"]')
      emit('edge [fontname="Helvetica,Arial,sans-serif"]')
    }

    begin(`subgraph cluster_${this.graphId} {`)
    emit(`style=dotted;`)
    emit(`color=black;`)
    emit(`label = "${this.name}"`)

    for (const node of this._nodes) {
      if (node == null) {
        continue
      }
      if (node.action && node.action instanceof TokenFlowGraph) {
        const lines = node.action.toDot(false)

        begin(lines[0])
        for (let i = 1; i < lines.length - 1; i++) {
          emit(lines[i])
        }
        end(lines[lines.length - 1])

        emit(
          `${node.nodeId} [label = "${node.nodeId}: ${node.name} (${node.nodeType})"]`
        )
        const label = node.action.end.outputs.join(', ')
        emit(`${node.action.end.nodeId} -> ${node.nodeId} [label = "${label}"]`)
      } else {
        emit(
          `${node.nodeId} [label = "${node.nodeId}: ${node.name} (${node.nodeType})"]`
        )
      }
    }

    for (const edge of this.edges()) {
      const sourceNodeId = edge.from
      const recipientNodeId = edge.to
      const sourceNode = this.getNode(sourceNodeId)
      const recipientNode = this.getNode(recipientNodeId)

      const proportion = edge.weight
      let propStr = `${(proportion * 100).toFixed(2)}% ${edge.token}`
      let edgeStyle = 'solid'
      let weight = 1
      if (proportion === 0) {
        edgeStyle = 'dashed'
        weight = 0
      }
      if (proportion === 1) {
        propStr = edge.token.symbol
        weight = 2
      }

      const attrs = `[label="${propStr}", style=${edgeStyle}, weight=${weight}]`

      if (recipientNode.action instanceof TokenFlowGraph) {
        emit(
          `${sourceNode.nodeId} -> ${recipientNode.action.start.nodeId} ${attrs}`
        )
      } else {
        emit(`${sourceNode.nodeId} -> ${recipientNode.nodeId} ${attrs}`)
      }
    }
    if (top) {
      end('}')
    }
    end('}')
    return lines
  }

  public getVersion(nodeId: number) {
    this.checkNodeExists(nodeId)
    return this.nodeVersions[nodeId]
  }

  public newNode(
    action: TokenFlowGraph | BaseAction | null = null,
    nodeType: NodeType = action == null ? NodeType.Split : NodeType.Action,
    name: string = '',
    inputs: Token[] = [],
    outputs: Token[] = [],
    min?: number,
    inlinedGraph: InlinedGraphRef | null = null
  ) {
    inputs = [...inputs]
    outputs = [...outputs]
    if (action instanceof TokenFlowGraph) {
      this.subgraphs++
    }
    if (action != null && (inputs.length === 0 || outputs.length === 0)) {
      const { inputs: inps, outputs: outs } = getInputsAndOutputs(action)
      inputs.push(...inps)
      outputs.push(...outs)
    }

    for (const token of inputs) {
      this.getTokenId(token)
    }
    for (const token of outputs) {
      this.getTokenId(token)
    }

    if (this.freeList.length > 0) {
      const id = this.freeList.pop()!
      this.nodeVersions[id] += 1
      this._nodes[id] = new Node(
        inputs,
        action,
        outputs,
        nodeType,
        name,
        inlinedGraph
      )
      this._outgoingEdges[id] = new OutgoingTokens(id, [], min)
      this._incomingEdges[id] = []
      this._incomingEdgeVersion[id] = 0
      return new NodeProxy(this, id)
    }
    const id = this._nodes.length
    this._nodes.push(
      new Node(inputs, action, outputs, nodeType, name, inlinedGraph)
    )
    this._outgoingEdges.push(new OutgoingTokens(id, [], min))
    this._incomingEdges.push([])
    this.nodeVersions.push(0)
    this._incomingEdgeVersion.push(0)
    return new NodeProxy(this, id)
  }

  private checkNodeExists(id: number) {
    if (id >= this._nodes.length) {
      throw new Error(`Node ${id} does not exist`)
    }
  }

  public getNode(id: number) {
    this.checkNodeExists(id)
    return new NodeProxy(this, id)
  }

  public forward(
    sourceId: number,
    recipientId: number,
    token: Token,
    parts: number
  ) {
    if (sourceId === recipientId) {
      throw new Error('Cannot forward to self')
    }
    if (sourceId === this._endIndex) {
      throw new Error('Cannot forward from end node')
    }
    if (!this.tokens.has(token)) {
      this.tokens.set(token, this.tokens.size)
    }
    this.checkNodeExists(sourceId)
    this.checkNodeExists(recipientId)
    const fromNode = this._nodes[sourceId]!
    fromNode.addOutputs([token])

    const toNode = this._nodes[recipientId]!
    toNode.addInputs([token])
    if (recipientId === this._endIndex) {
      for (const token of this.data[recipientId].inputs) {
        this.data[recipientId].addOutputs([token])
      }
    }

    const outgoing = this._outgoingEdges[sourceId]!
    outgoing.forward(token, parts, recipientId)

    const e = new Edge(sourceId, token, recipientId)

    for (const edge of this._incomingEdges[recipientId]!) {
      if (
        edge.source === sourceId &&
        edge.token === token &&
        edge.recipient === recipientId
      ) {
        return
      }
    }
    this._incomingEdges[recipientId].push(e)
    this._incomingEdgeVersion[recipientId] += 1
  }
  public sort() {
    const sorted: number[] = []
    const openSet = new Queue<number>()
    const seen = this._nodes.map((i) => false)
    openSet.push(this._startIndex)
    while (openSet.isNotEmpty) {
      const node = openSet.pop()
      if (seen[node]) {
        continue
      }
      if (node == null) {
        throw new Error(`PANIC! Got null node in sort()`)
      }
      const incomingEdges = this._incomingEdges[node]
      let everyDepSeen = true
      for (const edge of incomingEdges) {
        if (!seen[edge.source]) {
          everyDepSeen = false
          break
        }
      }
      if (!everyDepSeen) {
        continue
      }
      sorted.push(node)
      seen[node] = true
      const edge = this._outgoingEdges[node]
      if (edge == null) {
        throw new Error(`Missing edge for ${node}`)
      }
      for (const { recipient } of edge) {
        openSet.push(recipient)
      }
    }
    return sorted.map((i) => this.getNode(i))
  }

  public *edges() {
    for (const edge of this._outgoingEdges) {
      if (edge == null) {
        continue
      }

      for (const splits of edge.edges) {
        splits.calculateProportionsAsBigInt()
        const token = splits.token
        for (let i = 0; i < splits.recipient.length; i++) {
          const recipient = splits.recipient[i]
          if (recipient === -1) {
            throw new Error('Invalid recipient')
          }
          const parts = splits.parts[i]
          yield {
            from: edge.nodeId,
            to: recipient,
            sum: splits.sum,
            token,
            parts,
            weight: splits.innerWeight(i),
            dustToken: splits.dustEdge.get(i),
          }
        }
      }
    }
  }

  public constructor(
    name: string = this.name,
    inputs: Token[] = [],
    outputs: Token[] = []
  ) {
    this.name = name
    this._startIndex = this.newNode(null, NodeType.Split, 'start').id
    this._endIndex = this.newNode(null, NodeType.Split, 'output').id

    for (const input of inputs) {
      this.getTokenId(input)
    }
    for (const output of outputs) {
      this.getTokenId(output)
    }
    this.start.addInputs(inputs)
    this.end.addOutputs(outputs)
  }
}

export class TokenFlowGraphBuilder {
  public graph: TokenFlowGraph
  public parentInputs = new Set<Token>()
  private tokenBalanceNodes = new DefaultMap<Token, number>(
    (token) =>
      this.graph.newNode(
        null,
        NodeType.Split,
        `${token.symbol}`,
        [token],
        [token]
      ).id
  )

  public tradeNodes = new DefaultMap<Token, DefaultMap<Token, number>>(
    (token) => new DefaultMap<Token, number>((output) => -1)
  )
  public tradeNodeExists(input: Token, output: Token) {
    if (input === output) {
      return true
    }
    return this.tradeNodes.get(input).get(output) !== -1
  }

  public addTradeNode(
    input: Token,
    output: Token,
    actions: BaseAction[],
    name: string,
    inputNode?: NodeProxy,
    outputNode?: NodeProxy
  ) {
    if (this.tradeNodeExists(input, output)) {
      return
    }

    const graph = TokenFlowGraphBuilder.createSingleStep(
      this.universe,
      input.one,
      actions,
      name
    )
    inputNode = inputNode ?? this.getTokenNode(input)
    const extraNode = this.graph.newNode(
      null,
      NodeType.Split,
      name,
      [input],
      [input]
    )
    inputNode.forward(input, 1, extraNode)
    outputNode = outputNode ?? this.getTokenNode(output)
    const node = this.addSubgraphNode(graph, name)
    this.tradeNodes.get(input).set(output, extraNode.id)

    extraNode.forward(input, 1, node)
    node.forward(output, 1, outputNode)
    this.addParentInputs(new Set([output]))

    return extraNode
  }

  public clone() {
    const out = new TokenFlowGraphBuilder(
      this.universe,
      [...this.inputs],
      [...this.outputs],
      this.name
    )
    out.addParentInputs(this.parentInputs)
    out.graph = this.graph.clone()

    for (const [token, id] of this.tokenBalanceNodes.entries()) {
      out.tokenBalanceNodes.set(token, id)
    }
    return out
  }

  public static nullGraph(universe: Universe, tokens: Token[]) {
    return new TokenFlowGraphBuilder(universe, tokens, tokens)
  }

  public toDot(): string[] {
    return this.graph.toDot(true)
  }

  public get outputs(): ReadonlyArray<Token> {
    return this.graph._nodes[this.graph._endIndex]!.outputs
  }
  public get inputs(): ReadonlyArray<Token> {
    return this.graph._nodes[this.graph._startIndex]!.inputs
  }
  public isTokenDerived(token: Token) {
    if (this.parentInputs.has(token)) {
      return true
    }
    if (this.inputs.includes(token)) {
      return true
    }
    if (!this.tokenBalanceNodes.has(token)) {
      return false
    }
    return this.getTokenNode(token).inputsSatisfied()
  }

  public addInputTokens(tokens: Token[]) {
    for (const token of tokens) {
      if (!this.graph.start.inputs.includes(token)) {
        this.graph.start.addInputs([token])
        const node = this.getTokenNode(token)
        this.graph.start.forward(token, 1, node)
      }
    }
  }

  public addOutputTokens(tokens: Token[]) {
    for (const token of tokens) {
      if (!this.graph.end.outputs.includes(token)) {
        this.graph.end.addOutputs([token])
        const node = this.getTokenNode(token)
        node.forward(token, 1, this.graph.end)
      }
    }
  }

  public addParentInputs(tokens: Set<Token>) {
    for (const token of tokens) {
      this.parentInputs.add(token)
    }
  }

  public readonly inputProportion = new DefaultMap<Token, number>(() => 0)
  public readonly inputCausesDust = new DefaultMap<Token, Token[]>(() => [])
  public addInputProportion(token: Token, proportion: number) {
    this.inputProportion.set(
      token,
      this.inputProportion.get(token) + proportion
    )
  }

  public constructor(
    private readonly universe: Universe,
    inputs: Token[],
    outputs: Token[],
    name: string = `graph_${graphId++}`
  ) {
    this.graph = new TokenFlowGraph(name)
    this.addInputTokens(inputs)
    this.addOutputTokens(outputs)
  }

  public addSplittingNode(
    token: Token,
    parent: NodeProxy = this.getTokenNode(token),
    nodeType: NodeType = NodeType.Optimisation,
    name: string = `${token} -> ${token}`
  ) {
    const node = this.graph.newNode(null, nodeType, name, [token], [token])
    parent.forward(token, 1, node)
    return node
  }

  public addAction(action: BaseAction, outputs: Token[] = action.outputToken) {
    action = wrapAction(this.universe, action)
    return this.graph.newNode(
      action,
      NodeType.Action,
      `${action.protocol}.${action.actionName}`,
      action.inputToken,
      outputs
    )
  }

  public get name() {
    return this.graph.name
  }

  public addSubgraphNode(
    graph: TokenFlowGraph | TokenFlowGraphBuilder,
    nodeName: string = graph.name
  ) {
    if (graph instanceof TokenFlowGraphBuilder) {
      for (const [tokenFrom, toMap] of graph.tradeNodes.entries()) {
        for (const [tokenTo, id] of toMap.entries()) {
          if (id !== -1) {
            this.tradeNodes.get(tokenFrom).set(tokenTo, 100)
          }
        }
      }
      graph = graph.graph
    }
    return this.graph.newNode(
      graph,
      NodeType.Action,
      nodeName,
      graph.inputs,
      graph.outputs
    )
  }

  public getTokenNode(token: Token) {
    return this.graph.getNode(this.tokenBalanceNodes.get(token))
  }

  public static createSingleStep(
    universe: Universe,
    input: TokenQuantity,
    actions: BaseAction[],
    name?: string
  ) {
    if (actions.length === 0) {
      throw new Error('No actions provided')
    }
    if (
      !actions.every(
        (action) =>
          action.is1to1 &&
          action.inputToken[0] === input.token &&
          action.outputToken[0] === actions[0].outputToken[0]
      )
    ) {
      throw new Error('Invalid trade actions')
    }
    const builder = new TokenFlowGraphBuilder(
      universe,
      [input.token],
      [actions[0].outputToken[0]],
      name
    )

    const inputNode = builder.getTokenNode(input.token)
    inputNode.nodeType = NodeType.Fanout
    const edge = builder.graph._outgoingEdges[inputNode.id]!
    edge.min = 1 / 10

    for (const action of actions) {
      const actionNode = builder.addAction(action)
      for (const input of action.inputToken) {
        inputNode.forward(input, 1, actionNode)
      }
      for (const output of action.outputToken) {
        actionNode.forward(output, 1, builder.getTokenNode(output))
      }
    }

    return builder
  }

  public static create1To1(
    universe: Universe,
    input: TokenQuantity,
    output: Token,
    name: string = `graph_${graphId++}_${input.token}->${output}`
  ): TokenFlowGraphBuilder {
    const builder = new TokenFlowGraphBuilder(
      universe,
      [input.token],
      [output],
      name
    )
    return builder
  }
}

const getKey = (input: TokenQuantity) => {
  const k = input.asNumber()
  const rounded = Math.round(k * 10) / 10
  return input.token.from(rounded).toString()
}
export class TokenFlowGraphRegistry {
  private readonly db = new DefaultMap<
    string,
    Map<
      Token,
      {
        graph: TokenFlowGraph
        timestamp: number
      }
    >
  >(() => new Map())

  public purgeResult(input: TokenQuantity, output: Token) {
    console.log(`Purging result for key=${getKey(input)}`)
    const key = getKey(input)
    this.db.get(key).delete(output)
  }

  constructor(private readonly universe: Universe) {}

  public define(input: TokenQuantity, output: Token, graph: TokenFlowGraph) {
    const key = getKey(input)
    console.log(`Saving graph for later: key=${key}`)
    this.db.get(key).set(output, { graph, timestamp: Date.now() })
  }

  public find(input: TokenQuantity, output: Token) {
    const key = getKey(input)
    const out = this.db.get(key).get(output)
    if (out != null) {
      if (Date.now() - out.timestamp > this.universe.config.tfgCacheTTL) {
        this.db.get(key).delete(output)
      }
      console.log(`Found previous result for key=${key}, reusing it as a base`)
      return out.graph.clone()
    }
    return null
  }
}

const concatGraphs = (
  universe: Universe,
  parts: TokenFlowGraphBuilder[],
  name: string = `${parts.map((p) => p.graph.name).join(' then ')}`
) => {
  if (parts.length === 1) {
    return parts[0]
  }
  const builder = new TokenFlowGraphBuilder(
    universe,
    parts[0].graph.inputs,
    parts[parts.length - 1].graph.outputs,
    name
  )

  for (let i = 0; i < parts.length; i++) {
    const stepGraph = parts[i].graph
    const node = builder.addSubgraphNode(stepGraph, stepGraph.name + '_port')
    for (const input of stepGraph.inputs) {
      builder.getTokenNode(input).forward(input, 1, node)
    }
    for (const output of stepGraph.outputs) {
      const out = builder.getTokenNode(output)
      node.forward(output, 1, out)
    }
  }

  return builder
}

const fanOutGraphs = (
  universe: Universe,
  graphs: TokenFlowGraphBuilder[],
  name: string = `${graphs.map((g) => g.graph.name).join(' or ')}`
) => {
  if (graphs.length === 1) {
    return graphs[0]
  }
  if (graphs.length === 0) {
    throw new Error('No graphs to fan out')
  }
  const inputTokenSet = new Set(graphs.flatMap((g) => g.graph.inputs))
  const inputTokens = [...inputTokenSet]
  const outputTokens = [
    ...new Set(
      graphs
        .flatMap((g) => g.graph.outputs)
        .filter((i) => !inputTokenSet.has(i))
    ),
  ]

  const builder = new TokenFlowGraphBuilder(
    universe,
    inputTokens,
    outputTokens,
    name
  )

  const outputTokenSet = new Set(outputTokens)

  for (const graph of graphs) {
    const node = builder.addSubgraphNode(
      graph.graph,
      graph.graph.name + '_port'
    )

    for (const input of graph.graph.inputs) {
      const inputTokenNode = builder.getTokenNode(input)
      inputTokenNode.nodeType = NodeType.Optimisation
      inputTokenNode.forward(input, 1, node)
    }
    for (const output of graph.graph.outputs) {
      if (inputTokenSet.has(output) || !outputTokenSet.has(output)) {
        node.forward(output, 1, builder.graph.end)
        continue
      }
      node.forward(output, 1, builder.getTokenNode(output))
    }
  }

  return builder
}

const inlineTFGs = (
  graph: TokenFlowGraph,
  name: string = graph.name
): TokenFlowGraph => {
  if (!graph.containsSubgraphs) {
    return graph
  }
  const out = new TokenFlowGraph(name, graph.inputs, graph.outputs)

  const remappedNodesOut: { start: number; end: number }[] = graph.data.map(
    () => null as any
  )

  remappedNodesOut[graph._startIndex] = {
    start: out._startIndex,
    end: out._startIndex,
  }
  remappedNodesOut[graph._endIndex] = {
    start: out._endIndex,
    end: out._endIndex,
  }

  for (let nodeId = 0; nodeId < graph.data.length; nodeId++) {
    if (remappedNodesOut[nodeId] != null) {
      continue
    }
    const node = graph.data[nodeId]
    let newNodeId: number

    if (node.action instanceof TokenFlowGraph) {
      const subgraph = inlineTFGs(node.action)
      const remappedSubgraphNodes: number[] = subgraph.data.map(() => -1)

      for (let i = 0; i < subgraph.data.length; i++) {
        const subgrapNode = subgraph.data[i]
        const newNode = out.newNode(
          subgrapNode.action,
          subgrapNode.nodeType,
          subgrapNode.name,
          subgrapNode.inputs,
          subgrapNode.outputs,
          subgraph._outgoingEdges[i]!.min,
          new InlinedGraphRef(subgraph, i)
        )
        remappedSubgraphNodes[i] = newNode.id
      }
      for (const edge of subgraph.edges()) {
        const nodeFrom = remappedSubgraphNodes[edge.from]
        const nodeTo = remappedSubgraphNodes[edge.to]
        if (nodeFrom == -1 || nodeTo == -1) {
          throw new Error('PANIC: Invalid subgraph')
        }
        out.forward(nodeFrom, nodeTo, edge.token, edge.parts)

        if (edge.dustToken.length !== 0) {
          const splits = out._outgoingEdges[nodeFrom]!.getEdge(edge.token)
          splits.dustEdge
            .get(splits.getRecipientIndex(nodeTo))
            .push(...edge.dustToken)
        }
      }

      remappedNodesOut[nodeId] = {
        start: remappedSubgraphNodes[subgraph._startIndex],
        end: remappedSubgraphNodes[subgraph._endIndex],
      }
    } else {
      const newNode = out.newNode(
        node.action,
        node.nodeType,
        node.name,
        node.inputs,
        node.outputs,
        graph._outgoingEdges[nodeId]!.min,
        node.inlinedGraph
      )
      newNodeId = newNode.id
      remappedNodesOut[nodeId] = {
        start: newNodeId,
        end: newNodeId,
      }
    }
  }
  for (const edge of graph.edges()) {
    const from = remappedNodesOut[edge.from]
    const to = remappedNodesOut[edge.to]
    if (from == null || to == null) {
      throw new Error('PANIC: Invalid subgraph')
    }
    out.forward(from.end, to.start, edge.token, edge.parts)
    if (edge.dustToken.length !== 0) {
      const splits = out._outgoingEdges[from.end]!.getEdge(edge.token)
      splits.dustEdge
        .get(splits.getRecipientIndex(to.start))
        .push(...edge.dustToken)
    }
  }
  return out
}

const removeUselessNodes = (graph: TokenFlowGraph): TokenFlowGraph => {
  const uselessNodes = new Set<number>()
  for (const node of graph.nodes()) {
    if (node.isUseless) {
      uselessNodes.add(node.id)
    }
  }
  if (uselessNodes.size === 0) {
    return graph
  }

  const out = new TokenFlowGraph(graph.name, graph.inputs, graph.outputs)
  const remappedNodes: number[] = graph.data.map(() => -1)
  remappedNodes[graph._startIndex] = out._startIndex
  remappedNodes[graph._endIndex] = out._endIndex

  for (const node of graph.nodes()) {
    if (uselessNodes.has(node.id) || remappedNodes[node.id] !== -1) {
      continue
    }
    const newNode = out.newNode(
      node.action,
      node.nodeType,
      node.name,
      [...node.inputs],
      [...node.outputs],
      graph._outgoingEdges[node.id]?.min,
      node.inlinedGraph
    )
    remappedNodes[node.id] = newNode.id
  }

  let edges = [...graph.edges()]
  while (edges.length > 0) {
    const newEdges: typeof edges[number][] = []
    for (const edge of edges) {
      if (remappedNodes[edge.from] !== -1 && remappedNodes[edge.to] !== -1) {
        if (remappedNodes[edge.from] === remappedNodes[edge.to]) {
          continue
        }
        out.forward(
          remappedNodes[edge.from],
          remappedNodes[edge.to],
          edge.token,
          edge.parts
        )
        if (edge.dustToken.length !== 0) {
          const splits = out._outgoingEdges[remappedNodes[edge.from]]!.getEdge(
            edge.token
          )
          splits.dustEdge
            .get(splits.getRecipientIndex(remappedNodes[edge.to]))
            .push(...edge.dustToken)
        }
      } else if (remappedNodes[edge.from] === -1) {
        remappedNodes[edge.from] = remappedNodes[edge.to]
        newEdges.push(edge)
      } else if (remappedNodes[edge.to] === -1) {
        remappedNodes[edge.to] = remappedNodes[edge.from]
        newEdges.push(edge)
      }
    }
    edges = newEdges
  }

  return out
}

const removeNodes = (graph: TokenFlowGraph, unusedNodes: NodeProxy[]) => {
  if (unusedNodes.length === 0) {
    return graph
  }
  const out = new TokenFlowGraph(graph.name, graph.inputs, graph.outputs)
  const unused = new Set([...unusedNodes.map((n) => n.id)])
  const remappedNodes: number[] = graph.data.map(() => -1)
  remappedNodes[graph._startIndex] = out._startIndex
  remappedNodes[graph._endIndex] = out._endIndex

  for (const node of graph.nodes()) {
    if (unused.has(node.id) || remappedNodes[node.id] !== -1) {
      continue
    }
    const newNode = out.newNode(
      node.action,
      node.nodeType,
      node.name,
      [...node.inputs],
      [...node.outputs],
      graph._outgoingEdges[node.id]?.min,
      node.inlinedGraph
    )
    remappedNodes[node.id] = newNode.id
  }
  for (const edge of graph.edges()) {
    if (remappedNodes[edge.from] !== -1 && remappedNodes[edge.to] !== -1) {
      if (remappedNodes[edge.from] === remappedNodes[edge.to]) {
        continue
      }
      out.forward(
        remappedNodes[edge.from],
        remappedNodes[edge.to],
        edge.token,
        edge.parts
      )
      if (edge.dustToken.length !== 0) {
        const splits = out._outgoingEdges[remappedNodes[edge.from]]!.getEdge(
          edge.token
        )
        splits.dustEdge
          .get(splits.getRecipientIndex(remappedNodes[edge.to]))
          .push(...edge.dustToken)
      }
      continue
    }
  }

  return out
}

const evaluationOptimiser = (universe: Universe, g: TokenFlowGraph) => {
  let previousInputSizes: number[] = g.data.map(() => -1)
  let fanoutNodes = [...g.nodes()].map((node) => node.getFanoutActions())

  const inUse = new Set<Address>()

  for (const node of g.nodes()) {
    if (node.action instanceof BaseAction) {
      for (const incoming of node.incomingEdges()) {
        if (fanoutNodes[incoming.source.id].length !== 0) {
          continue
        }
        for (const a of node.action.addressesInUse) {
          inUse.add(a)
        }
      }
    }
  }

  let inUseThisIteration = new Set<Address>()
  const findTradeSplits = async (node: NodeProxy, inputs: TokenQuantity[]) => {
    const actions = fanoutNodes[node.id]
    if (actions.length === 0) {
      return
    }

    if (inputs.length > 1) {
      inputs = inputs.filter((i) =>
        actions.some((a) => a.inputToken[0] === i.token)
      )
    }
    if (inputs.length === 0) {
      console.log(node.nodeId + ' has no inputs')
      return
    }
    if (previousInputSizes[node.id] !== -1) {
      const percentageDiff =
        Math.abs(previousInputSizes[node.id] - inputs[0].asNumber()) /
        previousInputSizes[node.id]

      if (percentageDiff < 0.05) {
        return
      }
    }

    const acts: [BaseAction, number][] = []
    for (let i = 0; i < actions.length; i++) {
      const action = actions[i]
      if (action.oneUsePrZap) {
        let conflict = false
        for (const addr of action.addressesInUse) {
          if (inUse.has(addr) || inUseThisIteration.has(addr)) {
            conflict = true
            break
          }
        }
        if (conflict) {
          continue
        }
        for (const addr of action.addressesInUse) {
          inUseThisIteration.add(addr)
        }
        acts.push([action, i])
      }
    }

    const outEdges = g._outgoingEdges[node.id]
    if (outEdges == null) {
      throw new Error('No outgoing edges')
    }

    const splits = outEdges.getEdge(actions[0].inputToken[0])

    if (
      acts.length !== 0 &&
      acts.length !== actions.length &&
      acts.length > 1
    ) {
      const nodeSplits = await optimiseTrades(
        universe,
        inputs[0],
        acts.map((a) => a[0]),
        Infinity,
        20
      )
      const parts = splits.parts.map(() => 0)
      for (let i = 0; i < nodeSplits.inputs.length; i++) {
        parts[acts[i][1]] = nodeSplits.inputs[i]
      }

      if (parts.every((i) => i === 0)) {
        console.log('No splits found')
        return
      }

      splits.setParts(parts)
    } else {
      const nodeSplits = await optimiseTrades(
        universe,
        inputs[0],
        actions,
        Infinity,
        20
      )
      if (nodeSplits.inputs.every((i) => i === 0)) {
        console.log('No splits found')
        return
      }
      splits.setParts(nodeSplits.inputs)
    }
    splits.normalize()
  }

  const preevaluationHandler = async (
    node: NodeProxy,
    inputs: TokenQuantity[]
  ) => {
    if (fanoutNodes[node.id].length !== 0) {
      await findTradeSplits(node, inputs)
    }

    const inputAsNumber = inputs[0].asNumber()
    previousInputSizes[node.id] = inputAsNumber
  }

  return {
    graph: g,
    evaluate: async (inputs: TokenQuantity[]) => {
      inUseThisIteration.clear()
      return await g.evaluate(universe, inputs, preevaluationHandler)
    },
  }
}

const minimizeDust = async (
  g: TokenFlowGraph,
  evaluate: () => Promise<TFGResult>,
  currentResult: TFGResult,
  nodesToOptimise: NodeProxy[],
  qtyOutMatters: boolean = true,
  steps: number = 20,
  initialScale: number = 1
) => {
  const nodesToProcess = nodesToOptimise

  const dustTokens: Token[] = []
  if (nodesToProcess.length === 0) {
    return currentResult
  }

  const nodes = nodesToProcess
    .map((node) => {
      const splits = g._outgoingEdges[node.id]!.edges[0]
      const tokenToSplitMap = new Map<Token, number>()
      const splitsToTokens = new DefaultMap<number, Token[]>(() => [])
      for (let i = 0; i < splits.recipient.length; i++) {
        const tokens = splits.dustEdge.get(i)
        if (tokens.length === 0) {
          continue
        }
        for (const token of tokens) {
          if (!dustTokens.includes(token)) {
            dustTokens.push(token)
          }
          tokenToSplitMap.set(token, i)
          splitsToTokens.get(i).push(token)
          if (splitsToTokens.get(i).length > 1) {
            tokenToSplitMap.delete(token)
          }
        }
      }
      return {
        node,
        tokenToSplitMap,
        splits,
      }
    })
    .filter((node) => node.splits.parts.length > 1)

  if (nodes.length === 0) {
    console.log('Minimise dust: No nodes to process')
    return currentResult
  }

  const optimialValueOut =
    currentResult.result.inputValue - currentResult.result.inputValue * 0.005

  for (let iter = 0; iter < steps; ) {
    if (
      currentResult.result.outputValue > currentResult.result.inputValue &&
      currentResult.result.dustValue < 10
    ) {
      iter += 3
    } else if (currentResult.result.outputValue > optimialValueOut) {
      iter += 2
    } else {
      iter += 1
    }
    const progression = iter / steps
    const scale = (1 - progression) * initialScale
    for (let i = 0; i < nodes.length; i++) {
      if (
        currentResult.result.dustValue < 10 &&
        currentResult.result.dustValue / currentResult.result.totalValue <
          0.00001
      ) {
        return currentResult
      }
      const node = nodes[i]
      if (!dustTokens.find((d) => node.tokenToSplitMap.has(d))) {
        continue
      }
      const before = [...node.splits.parts]
      const dustValues = (
        await Promise.all(
          dustTokens.map(async (token) => {
            const qty = currentResult.result.dust.find((d) => d.token === token)
            if (qty == null) {
              return {
                splitIndex: null,
                value: 0,
                asFraction: 0,
                token: token,
              }
            }
            const value = (await qty.price()).asNumber()
            const asFraction = value / currentResult.result.totalValue
            const split = node.tokenToSplitMap.get(qty.token)
            if (node.splits.parts[split!] === node.splits.sum) {
              return {
                splitIndex: null,
                value: 0,
                asFraction: 0,
                token: qty.token,
              }
            }

            return {
              splitIndex: split!,
              value,
              asFraction: asFraction,
              token: qty.token,
            }
          })
        )
      ).filter((d) => d.splitIndex != null)
      if (dustValues.length === 0) {
        continue
      }

      dustValues.sort((a, b) => a.value - b.value)
      const higestDustQty = dustValues[dustValues.length - 1]
      const lowestDustQty = dustValues.find(
        (d) => d.splitIndex !== higestDustQty.splitIndex
      )
      const fraction = 1 - higestDustQty.asFraction * scale
      const prev = node.splits.parts[higestDustQty.splitIndex]
      node.splits.parts[higestDustQty.splitIndex] *= fraction
      const removed = prev - node.splits.parts[higestDustQty.splitIndex]

      if (lowestDustQty) {
        node.splits.parts[lowestDustQty.splitIndex] += removed * 0.5
      }

      node.splits.calculateProportionsAsBigInt()

      const newRes = await evaluate()
      if (
        (qtyOutMatters &&
          newRes.result.outputQuantity < currentResult.result.outputQuantity) ||
        newRes.result.dustValue > currentResult.result.dustValue
      ) {
        node.splits.setParts(before)
      } else {
        currentResult = newRes
      }
    }

    if (currentResult.result.dustValue <= 1) {
      console.log('Minimise dust: Breaking out, dust value  <= 1')
      break
    }
  }
  return currentResult
}

const optimiseGlobal = async (
  g: TokenFlowGraph,
  universe: Universe,
  inputs: TokenQuantity[],
  optimisationSteps: number = 15,
  bestSoFar: TFGResult,
  logger: ILoggerType,
  startSize: number = 1
) => {
  const isResultBetter = (
    previous: TFGResult,
    newResult: TFGResult,
    i: number
  ) => {
    return newResult.result.price > previous.result.price
  }
  const nodesSorted = g.sort().reverse()
  let optimisationNodes = nodesSorted.filter(
    (n) => (n.isOptimisable || n.isDustOptimisable) && n.recipients.length > 1
  )
  if (optimisationNodes.length > 7) {
    optimisationNodes = nodesSorted.filter((n) => n.isOptimisable)
  }
  console.log(`optimization nodes: ${optimisationNodes.length}`)

  if (optimisationNodes.length === 0) {
    console.log('Optimise global: No optimisation nodes')
    return bestSoFar
  }

  const optimialValueOut =
    bestSoFar.result.inputValue - bestSoFar.result.inputValue * 0.05

  const tmp = optimisationNodes.map((node) =>
    g._outgoingEdges[node.id]!.edges[0].parts.map(() => 0)
  )
  for (let nodeIndex = 0; nodeIndex < optimisationNodes.length; nodeIndex++) {
    const node = optimisationNodes[nodeIndex]
    const edge = g._outgoingEdges[node.id]!.edges[0]
    edge.normalize()
  }
  const MAX_SCALE = startSize
  for (let i = 0; i < optimisationSteps; ) {
    const size = MAX_SCALE * (1 - i ** 1.1 / optimisationSteps)

    if (
      bestSoFar.result.outputValue > bestSoFar.result.inputValue &&
      bestSoFar.result.dustValue < 10
    ) {
      i += 3
    } else if (bestSoFar.result.outputValue > optimialValueOut) {
      i += 2
    } else {
      i += 1
    }

    let bestThisIteration = bestSoFar
    let bestNodeToChange = -1
    for (
      let optimisationNodeIndex = 0;
      optimisationNodeIndex < optimisationNodes.length;
      optimisationNodeIndex++
    ) {
      const node = optimisationNodes[optimisationNodeIndex]
      const nodeId = node.id
      if (!bestSoFar.nodeResults.find((r) => r.node.id === nodeId)) {
        continue
      }
      const edge = g._outgoingEdges[nodeId]!.edges[0]
      if (edge.parts.length === 0) {
        continue
      }

      edge.normalize()
      let before = [...edge.parts]
      const tmpNode = tmp[optimisationNodeIndex]
      for (let i = 0; i < tmpNode.length; i++) {
        tmpNode[i] = edge.parts[i]
      }

      for (let paramIndex = 0; paramIndex < edge.parts.length; paramIndex++) {
        const prev = edge.inner[paramIndex]

        let change = size

        edge.add(paramIndex, change)
        edge.normalize()

        if (prev === 0 && edge.inner[paramIndex] === 0) {
          edge.setParts(before)
          continue
        }

        const res = await g.evaluate(universe, inputs)

        if (
          isFinite(res.result.price) &&
          isResultBetter(bestThisIteration, res, size)
        ) {
          bestThisIteration = res
          bestNodeToChange = optimisationNodeIndex
          for (let i = 0; i < edge.parts.length; i++) {
            tmpNode[i] = edge.inner[i]
          }
        }
        edge.setParts(before)
      }
    }
    if (bestNodeToChange !== -1) {
      bestSoFar = bestThisIteration
      g._outgoingEdges[
        optimisationNodes[bestNodeToChange].id
      ]!.edges[0].setParts(tmp[bestNodeToChange])
    }
  }
  return bestSoFar
}
const removeRedundantSplits = (g: TokenFlowGraph) => {
  const nodes = [...g.nodes()]
  const potentiallyMergableNodes = new DefaultMap<string, number[]>(() => [])
  const weights = new DefaultMap<string, number>(() => 0)

  const mergedDustTokens = new DefaultMap<number, DefaultMap<number, Token[]>>(
    () => new DefaultMap<number, Token[]>(() => [])
  )
  const dustTokens = new DefaultMap<number, DefaultMap<number, Token[]>>(
    () => new DefaultMap<number, Token[]>(() => [])
  )
  for (const node of nodes) {
    for (const edge01 of node.outgoingEdges()) {
      const numberOfOutgoingEdges = edge01.recipient.recipients.length
      const numberOfIncomingEdges = edge01.recipient.incomingEdges().length
      if (numberOfOutgoingEdges !== 1 || numberOfIncomingEdges !== 1) {
        continue
      }
      const parent = edge01.source
      const child = edge01.recipient
      const grandChild = [...edge01.recipient.outgoingEdges()][0].recipient
      const key = `${parent.id}-${grandChild.id}`
      weights.mut(key, (v) => v + edge01.proportion)
      mergedDustTokens
        .get(parent.id)
        .get(child.id)
        .push(...edge01.dustTokens)
      potentiallyMergableNodes.get(key).push(child.id)
    }
  }

  const graph = g
  const outGraph = new TokenFlowGraph(graph.name, graph.inputs, graph.outputs)
  const remappedNodes: number[] = graph.data.map(() => -1)
  remappedNodes[graph._startIndex] = outGraph._startIndex
  remappedNodes[graph._endIndex] = outGraph._endIndex

  const edgeWeights = new DefaultMap<number, DefaultMap<number, number>>(
    () => new DefaultMap<number, number>(() => 0)
  )
  let nodesRemoved = 0
  const mergeableNodes = [...potentiallyMergableNodes.entries()]
    .filter(([_, l]) => l.length >= 2)
    .map(([k, l]) => {
      const [a, b] = k.split('-')
      const parentId = parseInt(a, 10)
      const grandChildId = parseInt(b, 10)
      const prevNode = g.getNode(l[0])
      remappedNodes[l[0]] = outGraph.newNode(
        prevNode.action,
        prevNode.nodeType,
        prevNode.name,
        [...prevNode.inputs],
        [...prevNode.outputs],
        0,
        prevNode.inlinedGraph
      ).id
      nodesRemoved += l.length - 1
      const toks = mergedDustTokens.get(parentId).get(grandChildId)
      dustTokens.get(parentId).set(l[0], toks)
      edgeWeights.get(parentId).set(l[0], weights.get(k))
      for (let i = 1; i < l.length; i++) {
        remappedNodes[l[i]] = remappedNodes[l[0]]
      }
    })

  if (mergeableNodes.length == 0) {
    return g
  }

  for (const node of graph.nodes()) {
    if (remappedNodes[node.id] !== -1) {
      continue
    }
    const newNode = outGraph.newNode(
      node.action,
      node.nodeType,
      node.name,
      [...node.inputs],
      [...node.outputs],
      graph._outgoingEdges[node.id]?.min,
      node.inlinedGraph
    )
    remappedNodes[node.id] = newNode.id
  }
  for (const edge of graph.edges()) {
    if (remappedNodes[edge.from] !== -1 && remappedNodes[edge.to] !== -1) {
      if (remappedNodes[edge.from] === remappedNodes[edge.to]) {
        continue
      }
      const mergedWeight = edgeWeights.get(edge.from).get(edge.to)
      const mergedDustTokens = dustTokens.get(edge.from).get(edge.to)

      outGraph.forward(
        remappedNodes[edge.from],
        remappedNodes[edge.to],
        edge.token,
        mergedWeight === 0 ? edge.parts : mergedWeight
      )
      const allDustTokens = [
        ...new Set([...mergedDustTokens, ...edge.dustToken]),
      ]
      if (allDustTokens.length !== 0) {
        const splits = outGraph._outgoingEdges[
          remappedNodes[edge.from]
        ]!.getEdge(edge.token)
        splits.dustEdge
          .get(splits.getRecipientIndex(remappedNodes[edge.to]))
          .push(...allDustTokens)
      }
      continue
    }
  }

  console.log(`Removed ${nodesRemoved} nodes. New TFG:`)
  console.log(outGraph.toDot().join('\n'))

  return outGraph
}

function* iterDecendents(node: NodeProxy): IterableIterator<NodeProxy> {
  for (const edge of node.outgoingEdges()) {
    yield edge.recipient
    for (const decendent of iterDecendents(edge.recipient)) {
      yield decendent
    }
  }
}

const inferDustProducingNodes = (g: TokenFlowGraph) => {
  const nodes = [...g.nodes()]

  for (const node of nodes) {
    const outgoing = g._outgoingEdges[node.id]!
    if (outgoing?.edges.length !== 1) {
      continue
    }
    const mainSplits = outgoing.edges[0]
    if (mainSplits.recipient.length <= 1) {
      continue
    }
    if (mainSplits.dustEdge.size !== 0) {
      continue
    }

    for (const edge of node.outgoingEdges()) {
      const tokensProduced = new Set<Token>()
      const splitIndex = mainSplits.getRecipientIndex(edge.recipient.id)
      const dustProduced = new Set<Token>()
      const onDecendent = (decendent: NodeProxy) => {
        if (!(decendent.action instanceof BaseAction)) {
          return
        }
        if (decendent.action.dustTokens.length === 0) {
          for (const output of decendent.action.outputToken) {
            tokensProduced.add(output)
          }
        } else {
          for (const potentialDustTokenProducedByNode of decendent.action
            .dustTokens) {
            if (tokensProduced.has(potentialDustTokenProducedByNode)) {
              dustProduced.add(potentialDustTokenProducedByNode)
            }
          }
        }
      }

      onDecendent(edge.recipient)

      for (const decendent of iterDecendents(edge.recipient)) {
        onDecendent(decendent)
      }
      if (dustProduced.size !== 0) {
        console.log(
          `found dust produced by ${node.nodeId}[${splitIndex}] => ${[
            ...dustProduced,
          ].join(', ')}`
        )
        mainSplits.dustEdge.set(splitIndex, [...dustProduced])
        node.nodeType = NodeType.SplitWithDust
      }
    }
  }
}
const optimise = async (
  universe: Universe,
  graph: TokenFlowGraphBuilder | TokenFlowGraph,
  inputs: TokenQuantity[],
  outputs: Token[],
  opts?: {
    optsDustPhase1Steps?: number
    optsDustPhase2Steps?: number
    optimisationSteps?: number
  }
) => {
  const logger = universe.logger.child({
    prefix: `optimiser ${inputs.join(', ')} -> ${outputs.join(', ')}`,
  })

  const optimisationSteps = opts?.optimisationSteps ?? 15
  const minimiseDustPhase1Steps = opts?.optsDustPhase1Steps ?? 15
  const minimiseDustPhase2Steps = opts?.optsDustPhase2Steps ?? 5

  let g: TokenFlowGraph
  if (graph instanceof TokenFlowGraphBuilder) {
    const inlined = inlineTFGs(graph.graph)
    g = removeUselessNodes(inlined)
  } else {
    g = graph
  }

  // let g = inlined
  const findNodesWithoutSources = (g: TokenFlowGraph) => {
    const out = new Set<number>()
    for (const node of g.nodes()) {
      if (out.has(node.id)) {
        continue
      }
      if (node.receivesInput || node.isStartNode || node.isEndNode) {
        continue
      }
      out.add(node.id)
      for (const dep of node.decendents()) {
        out.add(dep.id)
      }
    }
    return [...out].map((id) => g.getNode(id))
  }

  let bestSoFar = await evaluationOptimiser(universe, g).evaluate(inputs)

  if (bestSoFar.result.outputValue === 0) {
    throw new Error('No output value')
  }
  if (!isFinite(bestSoFar.result.price)) {
    throw new Error('Bad graph')
  }

  g = removeNodes(g, findNodesWithoutSources(g))
  g = removeUselessNodes(removeRedundantSplits(g))
  inferDustProducingNodes(g)

  bestSoFar = await minimizeDust(
    g,
    () => g.evaluate(universe, inputs),
    bestSoFar,
    g
      .sort()
      .reverse()
      .filter((n) => n.isDustOptimisable),
    true,
    minimiseDustPhase1Steps
  )
  bestSoFar = await evaluationOptimiser(universe, g).evaluate(inputs)

  bestSoFar = await optimiseGlobal(
    g,
    universe,
    inputs,
    optimisationSteps,
    bestSoFar,
    logger,
    1
  )
  bestSoFar = await evaluationOptimiser(universe, g).evaluate(inputs)

  logger.info(
    `Result after global optimisation: ${bestSoFar.result.outputs
      .filter((i) => i.amount > 10n)
      .join(', ')}`
  )

  const start = Date.now()

  const maxPhase2TimeRefinementTime =
    universe.config.maxPhase2TimeRefinementTime
  const maxValueSlippage = universe.config.zapMaxValueLoss / 100
  const maxDustFraction = universe.config.zapMaxDustProduced / 100

  // Iteratively try and improve result until it would pass checks or we run out of time
  let scaleMultiplier = 1
  let refinementSteps = 0
  while (
    bestSoFar.result.dustValue / bestSoFar.result.totalValue >
      maxDustFraction ||
    bestSoFar.result.totalValue / bestSoFar.result.inputValue <
      1 - maxValueSlippage
  ) {
    logger.info(
      `Running refinement. Current result ${bestSoFar.result.outputs.join(
        ', '
      )}`,
      {
        step: refinementSteps,
        scale: scaleMultiplier,
      }
    )

    bestSoFar = await minimizeDust(
      g,
      () => g.evaluate(universe, inputs),
      bestSoFar,
      g
        .sort()
        .reverse()
        .filter((n) => n.isDustOptimisable),
      true,
      minimiseDustPhase2Steps,
      0.5 * scaleMultiplier
    )
    bestSoFar = await optimiseGlobal(
      g,
      universe,
      inputs,
      optimisationSteps,
      bestSoFar,
      logger,
      0.1 * scaleMultiplier
    )
    bestSoFar = await evaluationOptimiser(universe, g).evaluate(inputs)

    logger.info(
      `Finished refinement step. New result: ${bestSoFar.result.outputs.join(
        ', '
      )}`,
      {
        step: refinementSteps,
        scale: scaleMultiplier,
      }
    )

    if (Date.now() - start > maxPhase2TimeRefinementTime) {
      break
    }
    scaleMultiplier *= 0.5
  }
  if (
    !outputs
      .map((i) => i.address)
      .includes(Address.from('0xDbC0cE2321B76D3956412B36e9c0FA9B0fD176E7'))
  ) {
    g = removeNodes(g, findNodesWithoutSources(g))
    bestSoFar = await evaluationOptimiser(universe, g).evaluate(inputs)
  }

  logger.debug(
    `Final graph for ${bestSoFar.result.inputs.join(', ')} -> ${
      bestSoFar.result.output.token
    }`
  )

  logger.debug(g.toDot().join('\n'))

  const valueSlippage =
    bestSoFar.result.totalValue / bestSoFar.result.inputValue
  if (valueSlippage < 1 - maxValueSlippage) {
    logger.info(bestSoFar.result.outputs.join(', '))
    logger.error(
      `Value slippage is too high: ${((1 - valueSlippage) * 100).toFixed(
        2
      )}% for ${bestSoFar.result.inputs.join(', ')} -> ${
        bestSoFar.result.output.token
      } - Max allowed value slippage ${universe.config.zapMaxValueLoss}%`
    )

    throw new Error('Value slippage is too high')
  }

  const dustFraction = bestSoFar.result.dustValue / bestSoFar.result.totalValue
  if (dustFraction > maxDustFraction) {
    logger.debug(bestSoFar.result.outputs.join(', '))
    logger.debug(bestSoFar.result.dustValue)
    logger.debug(bestSoFar.result.totalValue)
    logger.debug(bestSoFar.result.outputQuantity)
    logger.error(
      `Dust fraction is too high: ${(dustFraction * 100).toFixed(
        2
      )}% for ${bestSoFar.result.inputs.join(', ')} -> ${
        bestSoFar.result.output.token
      } - Max allowed dust ${(maxDustFraction * 100).toFixed(2)}%`
    )
    throw new Error('Dust fraction is too high')
  }

  return g
}

export class TokenFlowGraphSearcher {
  public constructor(
    public readonly universe: Universe,
    private readonly registry: TokenFlowGraphRegistry
  ) {}

  private async rTokenRedeemGraph(
    parent: TokenFlowGraphBuilder,
    rToken: Token
  ) {
    const a = this.universe.getRTokenDeployment(rToken)
    const redeemGraphs: TokenFlowGraphBuilder[] = []
    const proportions: TokenQuantity[] = await a.mint.inputProportions()

    const outputSet = new Set<Token>()
    for (const qty of proportions) {
      const basketToken = qty.token
      if (!this.universe.isTokenBurnable(basketToken)) {
        outputSet.add(basketToken)
        continue
      }
      const g = await this.tokenRedemptionGraph(parent, basketToken)
      for (const tok of g.graph.outputs) {
        outputSet.add(tok)
      }
      redeemGraphs.push(g)
    }
    outputSet.delete(a.rToken)
    const rTokenRedeemGraph = new TokenFlowGraphBuilder(
      this.universe,
      [a.rToken],
      [...outputSet],
      `${a.rToken} redeem`
    )

    const redeemNode = rTokenRedeemGraph.addAction(a.burn)
    const rTokenNode = rTokenRedeemGraph.getTokenNode(a.rToken)
    rTokenNode.forward(a.rToken, 1, redeemNode)

    for (const tok of a.basket) {
      const node = rTokenRedeemGraph.getTokenNode(tok)
      redeemNode.forward(tok, 1, node)
    }

    for (let i = 0; i < redeemGraphs.length; i++) {
      const graph = redeemGraphs[i].graph
      const inputToken = graph.inputs[0]
      const inputNode = rTokenRedeemGraph.getTokenNode(inputToken)

      const redeemBasketTokenGraphNode = rTokenRedeemGraph.addSubgraphNode(
        graph,
        `unwrap ${graph.inputs.join(', ')}`
      )
      inputNode.forward(inputToken, 1, redeemBasketTokenGraphNode)

      for (const outputToken of graph.outputs) {
        redeemBasketTokenGraphNode.forward(
          outputToken,
          1,
          rTokenRedeemGraph.getTokenNode(outputToken)
        )
      }
    }

    return rTokenRedeemGraph
  }

  private async tokenSourceGraph(
    graph: TokenFlowGraphBuilder,
    inputQty: TokenQuantity,
    output: Token,
    inputNode: NodeProxy
  ) {
    const inputValueSize = (await inputQty.price()).asNumber()
    const tradePathExists = await this.doesTradePathExist(
      inputQty.scalarDiv(2n),
      output
    )
    if (!tradePathExists) {
      await this.tokenMintingGraph(graph, inputValueSize, output, inputNode)
    } else {
      const splitNode = graph.addSplittingNode(
        inputQty.token,
        inputNode,
        NodeType.Optimisation,
        `Source ${output} either mint or trade`
      )
      await this.tokenMintingGraph(graph, inputValueSize, output, splitNode)
      await this.addTrades(
        graph,
        inputQty.scalarDiv(2n),
        output,
        false,
        `${output} (trade path)`,
        splitNode
      )
    }
  }

  private async tokenMintingGraph(
    graph: TokenFlowGraphBuilder,
    inputValueSize: number,
    outToken: Token,
    inputNode: NodeProxy
  ) {
    const mintAction = this.universe.getMintAction(outToken)

    const inputToken = inputNode.inputs[0]
    const mintSubgraphInputNode = graph.addSplittingNode(
      inputToken,
      inputNode,
      mintAction.dustTokens.length > 0 ? NodeType.Both : NodeType.Optimisation,
      `mint ${outToken} (main)`
    )

    const edges = graph.graph._outgoingEdges[mintSubgraphInputNode.id]!
    edges.min = 0

    const props = await mintAction.inputProportions()

    const inputQty = await inputToken.fromUSD(inputValueSize)
    const tasks: Promise<any>[] = []
    for (let i = 0; i < props.length; i++) {
      const prop = props[i]
      if (prop.token === inputToken) {
        continue
      }

      const subInputNode = graph.addSplittingNode(
        inputToken,
        mintSubgraphInputNode,
        NodeType.Split,
        `mint ${outToken} (source ${props[i].token}))`
      )
      mintSubgraphInputNode.forward(inputToken, prop.asNumber(), subInputNode)

      if (!this.universe.isTokenMintable(prop.token)) {
        const tradeExisted = graph.tradeNodeExists(inputQty.token, prop.token)
        let tradeStart = await this.addTrades(
          graph,
          inputQty,
          prop.token,
          false,
          undefined,
          subInputNode
        )

        if (tradeStart && tradeExisted) {
          subInputNode.forward(
            inputToken,
            1,
            [...tradeStart.incomingEdges()][0].source
          )
        }
      } else {
        await this.tokenSourceGraph(graph, inputQty, prop.token, subInputNode)
      }
      if (mintAction.dustTokens.includes(prop.token)) {
        const splits =
          graph.graph._outgoingEdges[mintSubgraphInputNode.id]!.getEdge(
            inputToken
          )
        const index = splits.getRecipientIndex(subInputNode.id)
        splits.dustEdge.get(index).push(prop.token)
      }
    }
    await Promise.all(tasks)
    const mintActionNode = graph.addAction(mintAction)
    for (const prop of props) {
      if (prop.token === inputToken) {
        mintSubgraphInputNode.forward(
          inputToken,
          prop.asNumber(),
          mintActionNode
        )
      } else {
        graph.getTokenNode(prop.token).forward(prop.token, 1, mintActionNode)
      }
    }
    for (const outputToken of mintAction.outputToken) {
      mintActionNode.forward(outputToken, 1, graph.getTokenNode(outputToken))
    }
    for (const dustToken of mintAction.dustTokens) {
      mintActionNode.forward(dustToken, 1, graph.graph.end)
    }
  }

  private async tokenRedemptionGraph(
    parent: TokenFlowGraphBuilder,
    token: Token
  ): Promise<TokenFlowGraphBuilder> {
    let out: TokenFlowGraphBuilder
    if (this.universe.rTokensInfo.tokens.has(token)) {
      out = await this.rTokenRedeemGraph(parent, token)
    } else {
      const burnAction = this.universe.getBurnAction(token)

      out = new TokenFlowGraphBuilder(
        this.universe,
        [token],
        [],
        `Redeem ${token}`
      )
      out.addParentInputs(parent.parentInputs)
      const redeemNode = out.addAction(burnAction)
      out.getTokenNode(token).forward(token, 1, redeemNode)

      for (const underlying of burnAction.outputToken) {
        const underlyingNode = out.getTokenNode(underlying)
        redeemNode.forward(underlying, 1, underlyingNode)
        if (!this.universe.isTokenBurnable(underlying)) {
          out.addOutputTokens([underlying])
          continue
        }
        const subgraph = await this.tokenRedemptionGraph(out, underlying)
        const subgraphNode = out.addSubgraphNode(
          subgraph.graph,
          `${token} -> ${underlying}`
        )
        out.addOutputTokens([...subgraphNode.outputs])

        underlyingNode.forward(underlying, 1, subgraphNode)
        for (const outputToken of subgraphNode.outputs) {
          const outputTokenNode = out.getTokenNode(outputToken)
          subgraphNode.forward(outputToken, 1, outputTokenNode)
        }
      }
    }

    return out
  }

  private doesTradePathExistCache = new Map<string, Promise<boolean>>()
  private async doesTradePathExist(inputQty: TokenQuantity, output: Token) {
    const key = `${inputQty.token}.${output}`
    let prev = this.doesTradePathExistCache.get(key)
    if (prev == null) {
      const p = (async () => {
        try {
          const path =
            await this.universe.dexLiquidtyPriceStore.getBestQuotePath(
              inputQty,
              output,
              false
            )
          return (
            path.steps.length !== 0 &&
            path.steps[path.steps.length - 1].outputToken === output
          )
        } catch (e) {
          return false
        }
      })()
      this.doesTradePathExistCache.set(key, p)
      prev = p
    }
    return await prev
  }

  private addTradesWithpath(
    graph: TokenFlowGraphBuilder,
    inputQty: TokenQuantity,
    output: Token,
    path: {
      steps: {
        actions: BaseAction[]
        outputToken: Token
        inputToken: Token
      }[]
    },
    name?: string,
    inputNode?: NodeProxy,
    outputNode?: NodeProxy
  ) {
    let tradeNode: NodeProxy | undefined
    for (const step of path.steps) {
      if (step.inputToken === step.outputToken || step.actions.length === 0) {
        continue
      }
      if (graph.tradeNodeExists(step.inputToken, step.outputToken)) {
        tradeNode =
          tradeNode ??
          graph.graph.getNode(
            graph.tradeNodes.get(step.inputToken).get(step.outputToken)!
          )
        continue
      }
      const node = graph.addTradeNode(
        step.inputToken,
        step.outputToken,
        step.actions,
        name ?? `${step.inputToken} -> ${step.outputToken}`,
        step.inputToken === inputQty.token ? inputNode : undefined,
        step.outputToken === output ? outputNode : undefined
      )
      if (tradeNode == null) {
        tradeNode = node
      }
    }
    return tradeNode
  }
  private async addTrades(
    graph: TokenFlowGraphBuilder,
    inputQty: TokenQuantity,
    output: Token,
    allowMints: boolean,
    name?: string,
    inputNode?: NodeProxy,
    outputNode?: NodeProxy
  ) {
    const path = await this.universe.dexLiquidtyPriceStore.getBestQuotePath(
      inputQty,
      output,
      allowMints
    )
    return this.addTradesWithpath(
      graph,
      inputQty,
      output,
      path,
      name,
      inputNode,
      outputNode
    )
  }

  /**
   * Searcher algorithm that constructs a TFG to do a 1 to 1 zap (one input to one output)
   */
  public async search1To1(
    input: TokenQuantity,
    output: Token,
    opts: SearcherOptions
  ) {
    const inputValue = (await input.price()).asNumber()
    let inputToken = input.token
    const prev = this.registry.find(input, output)
    if (prev != null) {
      return await optimise(this.universe, prev, [input], [output], opts)
    }

    let graph = TokenFlowGraphBuilder.create1To1(
      this.universe,
      input,
      output,
      `${input} -> ${output}`
    )

    const inTokCls = await this.universe.tokenClass.get(inputToken)
    const outTokCls = await this.universe.tokenClass.get(output)

    let inputNode = graph.getTokenNode(inputToken)

    if (this.universe.isTokenBurnable(inputToken)) {
      const redemptionGraph = await this.tokenRedemptionGraph(graph, inputToken)

      const redeemNode = graph.addSubgraphNode(
        redemptionGraph.graph,
        `${input} (redeem)`
      )
      inputNode.forward(inputToken, 1, redeemNode)

      let targetToken = outTokCls

      for (const outputToken of redeemNode.outputs) {
        const outputTokenNode = graph.getTokenNode(outputToken)
        redeemNode.forward(outputToken, 1, outputTokenNode)
        if (outputToken === output || outputToken === targetToken) {
          continue
        }

        if (graph.tradeNodeExists(outputToken, targetToken)) {
          continue
        }

        const qty = await outputToken.fromUSD(inputValue)

        await this.addTrades(
          graph,
          qty,
          targetToken,
          false,
          `sell output of redeem(${input}) = ${outputToken} for ${targetToken}`
        )
      }

      if (targetToken === output) {
        return optimise(this.universe, graph, [input], [output], opts)
      }

      inputNode = graph.getTokenNode(targetToken)
      inputToken = targetToken
    }

    const preferredInputToken = this.universe.preferredToken.get(output)
    if (preferredInputToken != null && preferredInputToken !== inputToken) {
      await this.addTrades(
        graph,
        await inputToken.fromUSD(inputValue),
        preferredInputToken,
        true,
        `trade into preferred input token ${preferredInputToken}`
      )
      inputNode = graph.getTokenNode(preferredInputToken)
      inputToken = preferredInputToken
    }

    if (this.universe.isTokenMintable(output)) {
      await this.tokenSourceGraph(
        graph,
        await inputToken.fromUSD(inputValue),
        output,
        inputNode
      )
    } else {
      if (inputToken !== output) {
        await this.addTrades(
          graph,
          await inputToken.fromUSD(inputValue),
          output,
          false
        )
      }
    }

    const res = await optimise(this.universe, graph, [input], [output], opts)
    this.registry.define(input, output, res.clone())
    return res
  }

  /**
   * Search that constructs a TFG to do a 1 to n zap (one input to multiple outputs)
   */
  private async search1ToNGraph(
    input: TokenQuantity,
    outputs: TokenQuantity[]
  ) {
    const inputValueSize = (await input.price()).asNumber()
    // const { token: basketRepresentationToken, mint } =
    //   this.universe.folioContext.getSentinelToken(outputs)

    const out = new TokenFlowGraphBuilder(
      this.universe,
      [input.token],
      outputs.map((i) => i.token),
      `${input} -> ${outputs.map((i) => i.token).join(', ')}`
    )

    out.addParentInputs(new Set([input.token]))

    let proportions = await Promise.all(
      outputs.map((i) => i.price().then((i) => i.asNumber()))
    )
    const sum = proportions.reduce((a, b) => a + b, 0)
    proportions = proportions.map((i) => i / sum)

    const inputNode = out.getTokenNode(input.token)
    const splitNode = out.addSplittingNode(
      input.token,
      inputNode,
      NodeType.SplitWithDust,
      'split'
    )
    out.graph._outgoingEdges[splitNode.id]!.min = 0
    try {
      await Promise.all(
        outputs.map(async (token, i) =>
          this.universe.dexLiquidtyPriceStore
            .getBestQuotePath(
              await input.token.fromUSD(inputValueSize * proportions[i]),
              token.token
            )
            .catch((e) => {
              console.log(`failed to get path for ${token.token}`)
            })
        )
      )
    } catch (e) {
      console.log(`Not all tokens soucable`)
    }
    for (let i = 0; i < outputs.length; i++) {
      const prop = proportions[i]

      if (out.tradeNodeExists(input.token, outputs[i].token)) {
        await this.addTrades(
          out,
          await input.token.fromUSD(inputValueSize * prop),
          outputs[i].token,
          true,
          `trade ${input} -> ${outputs[i].token} with prop ${prop}`
        )

        continue
      }
      const inner = out.addSplittingNode(
        input.token,
        splitNode,
        NodeType.Optimisation,
        `trade ${input} -> ${outputs[i].token} with prop ${prop}`
      )
      const splits = out.graph._outgoingEdges[splitNode.id]!.getEdge(
        input.token
      )
      splits.min = 0
      splits.parts[splits.getRecipientIndex(inner.id)] = prop

      const tradeStart = await this.addTrades(
        out,
        await input.token.fromUSD(inputValueSize * prop),
        outputs[i].token,
        true,
        `trade ${input} -> ${outputs[i].token} with prop ${prop}`,
        inner
      )

      if (tradeStart) {
        inner.forward(input.token, 1, tradeStart)
      }
    }

    return out
  }

  public async searchZapDeploy1ToFolio(
    input: TokenQuantity,
    config: DeployFolioConfig,
    opts: SearcherOptions
  ) {
    const representationToken =
      this.universe.folioContext.getSentinelToken(config)

    const graph = await this.searchZap1ToFolio(
      input,
      representationToken.token,
      config.basicDetails.basket,
      opts
    )

    return graph
  }

  public async searchZap1ToFolio(
    input: TokenQuantity,
    output: Token,
    basket: TokenQuantity[],
    opts: SearcherOptions
  ) {
    const out = new TokenFlowGraphBuilder(
      this.universe,
      [input.token],
      [output],
      `${input} -> ${output}`
    )
    const prev = this.registry.find(input, output)
    if (prev != null) {
      return await optimise(this.universe, prev, [input], [output], opts)
    }

    const mint = this.universe.getMintAction(output)

    const inputToBasketGraph = await this.search1ToNGraph(input, basket)
    const inputToBasketNode = out.addSubgraphNode(inputToBasketGraph.graph)
    for (const inputToken of inputToBasketNode.inputs) {
      const inputTokenNode = out.getTokenNode(inputToken)
      inputTokenNode.forward(inputToken, 1, inputToBasketNode)
    }

    for (const outputToken of inputToBasketNode.outputs) {
      const outputTokenNode = out.getTokenNode(outputToken)
      inputToBasketNode.forward(outputToken, 1, outputTokenNode)
    }

    const mintNode = out.addAction(mint)
    for (const inputToken of mint.inputToken) {
      const inputTokenNode = out.getTokenNode(inputToken)
      inputTokenNode.forward(inputToken, 1, mintNode)
    }

    for (const dustToken of mint.dustTokens) {
      mintNode.forward(dustToken, 1, out.graph.end)
    }
    mintNode.forward(output, 1, out.getTokenNode(output))
    console.log(out.toDot().join('\n'))
    const res = await optimise(this.universe, out, [input], [output], opts)
    this.registry.define(input, output, res)

    return res
  }
}
