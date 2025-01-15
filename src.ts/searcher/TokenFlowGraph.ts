import { Universe } from '../Universe'
import { BaseAction, ONE } from '../action/Action'
import { DefaultMap } from '../base/DefaultMap'
import { Token, TokenQuantity } from '../entities/Token'
import { mintPath1To1, shortestPath } from '../exchange-graph/BFS'
import { Queue } from './Queue'
import { unwrapAction, wrapAction } from './TradeAction'
import { optimiseTrades } from './optimiseTrades'

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

  private recipientNodes_: number[] = []

  private sourceNodes_: number[] = []

  private recipientsMap() {
    this.checkVersion()
    const recipients = new DefaultMap<number, Token[]>(() => [])
    for (const edge of this.outgoingEdges()) {
      recipients.get(edge.recipient.id).push(edge.token)
    }
    this.recipientNodes_ = [...recipients.keys()]
  }

  private sourcesMap() {
    this.checkVersion()
    const sources = new DefaultMap<number, Token[]>(() => [])
    for (const edge of this.incomingEdges()) {
      sources.get(edge.source.id).push(edge.token)
    }
    this.sourceNodes_ = [...sources.keys()]
  }

  public get sources() {
    this.sourcesMap()
    return this.sourceNodes_
  }

  public get receivesInput() {
    if (this.isStartNode) {
      return true
    }
    return this.incomingEdges().some((i) => i.proportion > 0)
  }

  public *dependents(): Iterable<NodeProxy> {
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
    return [
      ...new Set(
        this.graph._outgoingEdges[this.id]!.edges.flatMap((e) => e.recipient)
      ),
    ].map((id) => this.graph.getNode(id))
  }

  public get isOptimisable() {
    this.checkVersion()
    if (
      this.nodeType === NodeType.Action ||
      this.nodeType === NodeType.Fanout ||
      this.nodeType === NodeType.SplitWithDust
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
      this.isFanout
    ) {
      return false
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

  public get inputs() {
    return this.nodeData.inputs
  }

  public get action() {
    return this.nodeData.action
  }

  public get outputs() {
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
    public min?: number
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
    return this.min ?? Math.min(1 / 10, 1 / this.parts.length / 2)
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
      this.min ?? min
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

  private addEdge(edge: TokenFlowSplits) {
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

  public constructor(
    public inputs: Token[] = [],
    public readonly action: TokenFlowGraph | BaseAction | null = null,
    public outputs: Token[] = [],
    public nodeType: NodeType = NodeType.Action,
    name: string = '',
    public inlinedGraph: InlinedGraphRef | null = null
  ) {
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
      this.inputs,
      this.action,
      this.outputs,
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

  const price = (inputSum + gasPrice.asNumber()) / outputTokenValue

  return {
    inputs,
    outputs,
    dust: outputs.filter((o) => o.token !== output.token),
    price,
    output,
    txFee,
    txFeeValue: txFee.asNumber(),
    inputQuantity,
    outputQuantity,
    inputValue: inputSum,
    totalValue: outputSum,
    outputValue: outputTokenValue,
    gas: gasUnits,
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
  const nodeOutput = allNodeOutputs[nodeId]

  const action = graph.data[nodeId].action

  let actionOutputs: TokenQuantity[] = []

  let actionInputs: TokenQuantity[] = []
  for (let i = 0; i < nodeInput.length; i++) {
    nodeOutput[i] = nodeInput[i]
  }
  if (action !== null) {
    const inouts = getInputsAndOutputs(graph.data[nodeId].action)
    const inputTokens = inouts.inputs

    let gas = 0n
    if (action instanceof TokenFlowGraph) {
      actionInputs = inputTokens.map((tok) => {
        const idx = graph.getTokenId(tok)!
        const qty = nodeInput[idx]
        nodeOutput[idx] = 0n
        return tok.from(qty)
      })

      if (actionInputs.some((i) => i.amount === 0n)) {
        return await createResult(
          universe,
          actionInputs,
          [],
          0n,
          graph._nodes[nodeId].outputs[0] ?? inouts.outputs[0]
        )
      }
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

      if (action.dustTokens.length !== 0) {
        const out = await action.quoteWithDust(actionInputs)
        for (const o of out.output) {
          actionOutputs.push(o)
        }
        for (const d of out.dust) {
          actionOutputs.push(d)
        }
      } else {
        for (const o of await action.quote(actionInputs)) {
          actionOutputs.push(o)
        }
      }
    }

    if (
      actionOutputs.length !== 0 &&
      actionOutputs.some((i) => i.amount > 0n)
    ) {
      gasUsage += gas
    }
  } else {
    actionInputs = graph.data[nodeId].inputs.map((tok) =>
      tok.from(nodeInput[graph.getTokenId(tok)!])
    )
    actionOutputs = graph.data[nodeId].outputs.map((tok) =>
      tok.from(nodeInput[graph.getTokenId(tok)!])
    )
  }

  for (const out of actionOutputs) {
    if (out.amount === 0n) {
      continue
    }
    nodeOutput[graph.getTokenId(out.token)] = out.amount
  }

  const edges = graph._outgoingEdges[nodeId]
  if (edges == null || edges.edges.length === 0) {
    return await createResult(
      universe,
      actionInputs,
      actionInputs,
      gasUsage,
      graph._nodes[nodeId].outputs[0] ?? graph._nodes[nodeId].inputs[0]
    )
  }

  if (
    beforeEvaluate != null &&
    action === null &&
    edges.edges.some((e) => e.recipient.length !== 0)
  ) {
    await beforeEvaluate(new NodeProxy(graph, nodeId), actionInputs)
  }
  for (const edge of edges.edges) {
    const token = edge.token
    const tokenIdx = graph.getTokenId(token)!

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
      const output = nodeOutput[tokenIdx]
      if (proportionBn >= ONE) {
        allNodeInputs[recipientNodeId][tokenIdx] += output
      } else {
        allNodeInputs[recipientNodeId][tokenIdx] +=
          (output * proportionBn) / ONE
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
      yield this.getNode(i)
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
  public getTokenId(token: Token) {
    if (!this.tokens.has(token)) {
      this.tokens.set(token, this.tokens.size)
    }
    const idx = this.tokens.get(token)
    if (idx == null) {
      throw new Error(`Token ${token} not found in graph`)
    }
    return idx
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
    // console.log(this.toDot().join('\n'))
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
      const dependencies = this._incomingEdges[node.id]
        .filter((edge) => !resolved[edge.source])
        .map((edge) => awaiting[edge.source])
      await Promise.all(dependencies)
      // console.log(`STARTING ${node.nodeId} ${deps.join(', ')}`)
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

        // console.log(`${node.nodeId} -> ${res.outputs.join(', ')}`)

        gasUnits += res.gas
        return res
      }
    }
    for (const node of sorted) {
      const promise = task(node).then((result) => {
        resolvers[node.id](node)
        return result
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
    // process.exit(0)
    return new TFGResult(out, nodeResults, this)
  }

  public clone() {
    const graph = new TokenFlowGraph(this.name)
    graph._nodes = [...this._nodes]
    graph.subgraphs = this.subgraphs
    graph.inputs.push(...this.inputs)
    graph.outputs.push(...this.outputs)
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

        emit(`${node.nodeId} [label = "${node.nodeId}: ${node.name}"]`)
        const label = node.action.end.outputs.join(', ')
        emit(`${node.action.end.nodeId} -> ${node.nodeId} [label = "${label}"]`)
      } else {
        emit(`${node.nodeId} [label = "${node.nodeId}: ${node.name}"]`)
      }
    }

    for (const edge of this.edges()) {
      const sourceNodeId = edge.from
      const recipientNodeId = edge.to
      const sourceNode = this.getNode(sourceNodeId)
      const recipientNode = this.getNode(recipientNodeId)

      const proportion = edge.weight
      let propStr = `${proportion.toFixed(2)}% ${edge.token}`
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
    if (!fromNode.outputs.includes(token)) {
      fromNode.outputs.push(token)
    }
    const toNode = this._nodes[recipientId]!
    if (!toNode.inputs.includes(token)) {
      toNode.inputs.push(token)
    }
    if (recipientId === this._endIndex) {
      this.data[recipientId].outputs = this.data[recipientId].inputs
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
    this.start.inputs.push(...inputs)
    this.end.outputs.push(...outputs)
  }
}

export class TokenFlowGraphBuilder {
  public readonly graph: TokenFlowGraph
  private readonly tokenBalanceNodes = new DefaultMap<Token, number>(
    (token) =>
      this.graph.newNode(
        null,
        NodeType.Split,
        `${token.symbol}`,
        [token],
        [token]
      ).id
  )

  public static nullGraph(universe: Universe, tokens: Token[]) {
    return new TokenFlowGraphBuilder(universe, tokens, tokens)
  }

  public toDot(): string[] {
    return this.graph.toDot(true)
  }

  public get outputs() {
    return this.graph._nodes[this.graph._endIndex]!.outputs
  }
  public get inputs() {
    return this.graph._nodes[this.graph._startIndex]!.inputs
  }
  public readonly parentInputs = new Set<Token>()
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
        this.graph.start.inputs.push(token)
        const node = this.getTokenNode(token)
        this.graph.start.forward(token, 1, node)
      }
    }
  }

  public addOutputTokens(tokens: Token[]) {
    for (const token of tokens) {
      if (!this.graph.end.outputs.includes(token)) {
        this.graph.end.outputs.push(token)
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

  public constructor(
    private readonly universe: Universe,
    inputs: Token[],
    outputs: Token[],
    name: string = `graph_${graphId++}`
  ) {
    this.graph = new TokenFlowGraph(name)
    const outs = this.graph.end.outputs
    this.addInputTokens(inputs)
    for (const token of outputs) {
      outs.push(token)
      const balanceNode = this.getTokenNode(token)
      balanceNode.forward(token, 1, this.graph.end)
    }
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

export class TokenFlowGraphRegistry {
  private readonly db = new DefaultMap<
    Token,
    Map<Token, TokenFlowGraphBuilder>
  >((token) => new Map())

  public define(input: Token, output: Token, graph: TokenFlowGraphBuilder) {
    this.db.get(input).set(output, graph)
  }

  public find(input: Token, output: Token) {
    return this.db.get(input).get(output)
  }
}

const findAllWaysToGetFromAToB = (universe: Universe, a: Token, b: Token) => {
  const weth = universe.wrappedNativeToken
  const eth = universe.nativeToken
  return [...universe.graph.vertices.get(b).incomingEdges.values()]
    .flat()
    .filter(
      (act) =>
        act.is1to1 &&
        ((weth === a &&
          (act.inputToken[0] === weth || act.inputToken[0] === eth)) ||
          act.inputToken[0] === a) &&
        act.outputToken[0] === b
    )
    .map((i) => wrapAction(universe, i))
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
  for (const output of parts[parts.length - 1].graph.end.outputs) {
    const out = builder.getTokenNode(output)
    out.forward(output, 1, builder.graph.end)
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
      ).id
      remappedNodesOut[nodeId] = {
        start: newNode,
        end: newNode,
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
      node.inputs,
      node.outputs,
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

const locateNodes = (graph: TokenFlowGraph) => {
  const optimisationNodes: number[] = []
  for (const node of graph.nodes()) {
    if (node.isOptimisable) {
      optimisationNodes.push(node.id)
    }
  }
  return optimisationNodes
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
      node.inputs,
      node.outputs,
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
      continue
    }
  }

  return out
}

const evaluationOptimiser = (universe: Universe, g: TokenFlowGraph) => {
  let previousInputSizes: number[] = g.data.map(() => -1)
  let fanoutNodes = [...g.nodes()].map((node) => node.getFanoutActions())

  const findTradeSplits = async (node: NodeProxy, inputs: TokenQuantity[]) => {
    const actions = fanoutNodes[node.id]

    const outEdges = g._outgoingEdges[node.id]
    if (outEdges == null) {
      throw new Error('No outgoing edges')
    }

    const splits = outEdges.getEdge(actions[0].inputToken[0])

    const nodeSplits = await optimiseTrades(
      universe,
      inputs[0],
      actions,
      Infinity,
      10
    )
    splits.min = 1 / 10
    splits.setParts(nodeSplits.inputs)
  }

  const preevaluationHandler = async (
    node: NodeProxy,
    inputs: TokenQuantity[]
  ) => {
    if (inputs.length > 1) {
      inputs = inputs.filter((i) => !node.inputs.includes(i.token))
    }
    if (inputs.length === 0) {
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
    if (fanoutNodes[node.id].length !== 0) {
      await findTradeSplits(node, inputs)
    }

    const inputAsNumber = inputs[0].asNumber()
    previousInputSizes[node.id] = inputAsNumber
  }

  return {
    graph: g,
    evaluate: async (inputs: TokenQuantity[]) => {
      return await g.evaluate(universe, inputs, preevaluationHandler)
    },
  }
}

const minimizeDust = async (
  g: TokenFlowGraph,
  evaluate: () => Promise<TFGResult>,
  currentResult: TFGResult,
  steps: number = 20
) => {
  const dustTokens = currentResult.result.dust
    .filter((dust) => dust.amount !== 0n)
    .map((d) => d.token)

  const nodes = [...g.nodes()]
    .filter((n) => n.nodeType === NodeType.SplitWithDust)
    .map((node) => {
      const splits = g._outgoingEdges[node.id]!.edges[0]
      splits.min = 0
      const tokenToSplitMap = new Map<Token, number>()
      for (let i = 0; i < splits.recipient.length; i++) {
        const recipient = g.getNode(splits.recipient[i])
        const deps = [...recipient.dependents()]
        for (const dep of deps) {
          for (const token of dustTokens) {
            if (dep.outputs.includes(token)) {
              tokenToSplitMap.set(token, i)
            }
          }
        }
      }
      return {
        node,
        tokenToSplitMap,
        splits,
      }
    })

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if (
      !currentResult.result.dust.find((d) => node.tokenToSplitMap.has(d.token))
    ) {
      continue
    }

    for (let iter = 0; iter < steps; iter++) {
      const dustValues = (
        await Promise.all(
          currentResult.result.dust.map(async (qty) => {
            const value = (await qty.price()).asNumber()
            const asFraction = value / currentResult.result.totalValue
            const split = node.tokenToSplitMap.get(qty.token)

            return {
              splitIndex: split!,
              value,
              asFraction,
              token: qty.token,
            }
          })
        )
      ).filter((d) => d.splitIndex != null)

      dustValues.sort((a, b) => a.value - b.value)
      const higestDustQty = dustValues[dustValues.length - 1]
      const fraction = 1 - higestDustQty.asFraction
      node.splits.parts[higestDustQty.splitIndex] *= fraction
      node.splits.normalize()
      currentResult = await evaluate()

      if (
        currentResult.result.totalValue === currentResult.result.outputValue ||
        currentResult.result.dust.filter((d) => d.amount > 1n).length === 0
      ) {
        break
      }
    }
  }
  return currentResult
}

const optimise = async (
  universe: Universe,
  graph: TokenFlowGraphBuilder,
  inputs: TokenQuantity[],
  opts?: {
    minimizeDustSteps?: number
    optimisationSteps?: number
  }
) => {
  const inlined = inlineTFGs(graph.graph)
  let g = removeUselessNodes(inlined)

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
      for (const dep of node.dependents()) {
        out.add(dep.id)
      }
    }
    return [...out].map((id) => g.getNode(id))
  }

  console.log('Running first round of optimisation')
  let bestSoFar = await evaluationOptimiser(universe, g).evaluate(inputs)
  console.log(bestSoFar.result.outputs.join(', '))
  if (bestSoFar.result.outputValue === 0) {
    throw new Error('No output value')
  }
  if (!isFinite(bestSoFar.result.price)) {
    throw new Error('Bad graph')
  }

  const DECAY = 0.99
  const steps = opts?.optimisationSteps ?? 25
  let scale = 4

  const isResultBetter = (previous: TFGResult, newResult: TFGResult) => {
    return newResult.result.price < previous.result.price
  }

  g = removeNodes(g, findNodesWithoutSources(g))
  const optimiserEvaluation = evaluationOptimiser(universe, g)

  bestSoFar = await minimizeDust(
    g,
    () => optimiserEvaluation.evaluate(inputs),
    bestSoFar,
    opts?.minimizeDustSteps ?? 20
  )

  let optimisationNodes = locateNodes(g)

  const tmp = optimisationNodes.map((nodeId) =>
    g._outgoingEdges[nodeId]!.edges[0].parts.map(() => 0)
  )
  for (let nodeId = 0; nodeId < optimisationNodes.length; nodeId++) {
    const edge = g._outgoingEdges[optimisationNodes[nodeId]]!.edges[0]
    edge.min = 1 / edge.parts.length / 2
    edge.normalize()
    console.log(g._nodes[optimisationNodes[nodeId]].nodeId)
  }
  for (let i = 0; i < steps; i++) {
    const size = scale * (1 - i / steps) ** 2

    let bestThisIteration = bestSoFar
    let bestNodeToChange = -1
    for (
      let optimisationNodeIndex = 0;
      optimisationNodeIndex < optimisationNodes.length;
      optimisationNodeIndex++
    ) {
      const nodeId = optimisationNodes[optimisationNodeIndex]
      if (!bestSoFar.nodeResults.find((r) => r.node.id === nodeId)) {
        continue
      }
      const edge = g._outgoingEdges[nodeId]!.edges[0]
      if (edge.parts.length === 0) {
        continue
      }

      edge.normalize()
      let before = [...edge.inner]
      const tmpNode = tmp[optimisationNodeIndex]
      for (let i = 0; i < tmpNode.length; i++) {
        tmpNode[i] = edge.inner[i]
      }

      for (let paramIndex = 0; paramIndex < edge.parts.length; paramIndex++) {
        if (edge.parts[paramIndex] === edge.sum) {
          continue
        }

        let change = size

        let s = 0
        edge.parts[paramIndex] += change
        for (let i = 0; i < edge.parts.length; i++) {
          s += edge.parts[i]
        }
        for (let i = 0; i < edge.parts.length; i++) {
          edge.parts[i] = edge.parts[i] / s
        }
        edge.sum = 1
        edge.calculateProportionsAsBigInt()

        const res = await g.evaluate(universe, inputs)
        if (
          isFinite(res.result.price) &&
          isResultBetter(bestThisIteration, res)
        ) {
          bestThisIteration = res
          bestNodeToChange = optimisationNodeIndex
          for (let i = 0; i < edge.parts.length; i++) {
            tmpNode[i] = edge.inner[i]
          }
        }
        edge.setParts(before)
        edge.sum = 1
      }
    }
    if (bestNodeToChange !== -1) {
      bestSoFar = bestThisIteration
      g._outgoingEdges[optimisationNodes[bestNodeToChange]]!.edges[0].setParts(
        tmp[bestNodeToChange]
      )
    } else {
      scale = scale * DECAY
    }
  }
  g = removeNodes(g, findNodesWithoutSources(g))

  console.log(g.toDot().join('\n'))
  console.log(bestSoFar.result.outputs.join(', '))

  return g
}

export class TokenFlowGraphSearcher {
  public constructor(
    public readonly universe: Universe,
    private readonly registry: TokenFlowGraphRegistry
  ) {}

  private async search1To1Graph(
    a: Token,
    b: Token,
    allowTradesOnlyPath: boolean = false
  ) {
    if (a === this.universe.nativeToken) {
      a = this.universe.wrappedNativeToken
    }
    if (b === this.universe.nativeToken) {
      b = this.universe.wrappedNativeToken
    }
    if (a === b) {
      return TokenFlowGraphBuilder.nullGraph(this.universe, [a])
    }
    let path = allowTradesOnlyPath
      ? shortestPath(this.universe, a, b, (act) => act.is1to1)
      : mintPath1To1(this.universe, a, b)

    const steps: TokenFlowGraphBuilder[] = []
    const tokenPath: Token[] = []
    for (let step = 0; step < path.length - 1; step++) {
      let input = path[step]
      let output = path[step + 1]
      if (input === this.universe.nativeToken) {
        input = this.universe.wrappedNativeToken
      }
      if (output === this.universe.nativeToken) {
        output = this.universe.wrappedNativeToken
      }
      if (input === output) {
        continue
      }
      tokenPath.push(output)
      const stepGraph =
        this.registry.find(input, output) ??
        TokenFlowGraphBuilder.createSingleStep(
          this.universe,
          input.from(1.0),
          findAllWaysToGetFromAToB(this.universe, input, output),
          `${input} -> ${output}`
        )
      this.registry.define(input, output, stepGraph)
      steps.push(stepGraph)
    }
    if (steps.length === 0) {
      const tradePaths = findAllWaysToGetFromAToB(this.universe, a, b)
      return TokenFlowGraphBuilder.createSingleStep(
        this.universe,
        a.from(1.0),
        tradePaths,
        `${a} -> ${b} (trades)`
      )
    }
    if (path.length <= 2) {
      return concatGraphs(this.universe, steps, `${a} -> ${b}`)
    }
    const name = `${a} -> ${b} (via ${tokenPath.slice(0, -1).join(', ')})`
    const mintPath = concatGraphs(this.universe, steps, name)
    if (tokenPath.length === 1) {
      return mintPath
    }

    const tradePaths = findAllWaysToGetFromAToB(this.universe, a, b)
    if (tradePaths.length === 0) {
      return mintPath
    }
    const tradeGraph = TokenFlowGraphBuilder.createSingleStep(
      this.universe,
      a.from(1.0),
      tradePaths,
      `${a} -> ${b} (trades)`
    )

    return fanOutGraphs(this.universe, [mintPath, tradeGraph], `${a} -> ${b}`)
  }

  private async lpTokenRedeemGraph(
    parent: TokenFlowGraphBuilder,
    lpToken: Token
  ) {
    const lpTokenDeployment = this.universe.lpTokens.get(lpToken)
    if (lpTokenDeployment == null) {
      throw new Error('No LP token found')
    }
    const redeemAction = this.universe.getBurnAction(lpToken)

    const proportions = await redeemAction.outputProportions()
    const g = new TokenFlowGraphBuilder(
      this.universe,
      [lpToken],
      proportions.map((i) => i.token),
      `${lpToken} redeem`
    )

    const lpRedeemNode = g.addAction(redeemAction)
    const lpTokenNode = g.getTokenNode(lpToken)
    lpTokenNode.forward(lpToken, 1, lpRedeemNode)

    for (const { token } of proportions) {
      const outputTokenNode = g.getTokenNode(token)
      lpRedeemNode.forward(token, 1, outputTokenNode)
      outputTokenNode.forward(token, 1, g.graph.end)
    }
    return g
  }

  private async rTokenIssueGraph(parent: TokenFlowGraphBuilder, rToken: Token) {
    const a = this.universe.getRTokenDeployment(rToken)

    const inputTokens: Token[] = []
    for (const tok of parent.parentInputs) {
      inputTokens.push(tok)
    }
    for (const token of a.mint.inputToken) {
      if (parent.isTokenDerived(token)) {
        inputTokens.push(token)
      }
    }

    const rTokenIssueGraph = new TokenFlowGraphBuilder(
      this.universe,
      inputTokens,
      [a.rToken],
      `${a.rToken} issue`
    )
    rTokenIssueGraph.addParentInputs(parent.parentInputs)

    const issueanceNode = rTokenIssueGraph.addAction(a.mint, [
      a.rToken,
      ...a.basket,
    ])

    const endNode = rTokenIssueGraph.graph.end

    const proportions: TokenQuantity[] = await a.mint.inputProportions()
    for (const qty of proportions) {
      const basketToken = qty.token
      if (parent.isTokenDerived(basketToken)) {
        continue
      }
      let proportion = qty.asNumber() * 100

      const parentInputNodes = new DefaultMap<Token, NodeProxy>((token) => {
        if (!rTokenIssueGraph.inputs.includes(token)) {
          return rTokenIssueGraph.getTokenNode(token)
        }
        const basketProportionNode = rTokenIssueGraph.graph.newNode(
          null,
          NodeType.Split,
          `source ${basketToken}`,
          [token],
          [token]
        )

        const node = rTokenIssueGraph.getTokenNode(token)
        node.nodeType = NodeType.SplitWithDust
        rTokenIssueGraph.graph._outgoingEdges[node.id]!.min = 0

        node.forward(token, proportion, basketProportionNode)
        return basketProportionNode
      })

      let sourceBasketTokenGraph = this.universe.isTokenMintable(basketToken)
        ? await this.tokenMintingGraph(rTokenIssueGraph, basketToken)
        : null
      if (sourceBasketTokenGraph == null) {
        for (const tradeToken of parent.parentInputs) {
          try {
            const g = TokenFlowGraphBuilder.createSingleStep(
              this.universe,
              tradeToken.from(1.0),
              findAllWaysToGetFromAToB(this.universe, tradeToken, basketToken),
              `source ${basketToken} -> ${parent.inputs[0]}`
            )
            sourceBasketTokenGraph = g
            break
          } catch (e) {
            continue
          }
        }
      }
      if (sourceBasketTokenGraph == null) {
        throw new Error('No source basket token graph found')
      }
      const basketMintGraph = rTokenIssueGraph.addSubgraphNode(
        sourceBasketTokenGraph.graph,
        `source ${sourceBasketTokenGraph.graph.outputs.join(', ')}`
      )

      for (const inputToken of sourceBasketTokenGraph.graph.inputs) {
        let inputTokenNode = parentInputNodes.get(inputToken)
        inputTokenNode.forward(inputToken, 1, basketMintGraph)

        if (inputTokenNode.inputsSatisfied()) {
          continue
        }
        let found = false

        for (const tradeToken of parent.parentInputs) {
          if (inputToken === tradeToken) {
            found = true
            continue
          }
          try {
            const inputTokenSourceNode = rTokenIssueGraph.addSubgraphNode(
              await this.search1To1Graph(tradeToken, inputToken, true),
              `source ${tradeToken} -> ${inputToken}`
            )

            const tradeTokenNode = parentInputNodes.get(tradeToken)
            tradeTokenNode.forward(tradeToken, 1, inputTokenSourceNode)
            inputTokenSourceNode.forward(inputToken, 1, inputTokenNode)

            found = true
            break
          } catch (e) {}
        }
        if (found) {
          break
        }
      }
      const basketTokenNode = rTokenIssueGraph.getTokenNode(basketToken)
      basketMintGraph.forward(basketToken, 1, basketTokenNode)

      for (const dustToken of sourceBasketTokenGraph.graph.outputs) {
        if (dustToken === basketToken) {
        } else {
          basketMintGraph.forward(dustToken, 1, endNode)
        }
      }
    }
    rTokenIssueGraph.addInputTokens([...new Set(inputTokens)])

    for (const basketToken of a.mint.inputToken) {
      const basketTokenNode = rTokenIssueGraph.getTokenNode(basketToken)
      basketTokenNode.forward(basketToken, 1, issueanceNode)
      issueanceNode.forward(basketToken, 1, endNode)
    }

    const rTokenNode = rTokenIssueGraph.getTokenNode(a.rToken)
    issueanceNode.forward(a.rToken, 1, rTokenNode)
    rTokenNode.forward(a.rToken, 1, endNode)

    return rTokenIssueGraph
  }

  private async rTokenRedeemGraph(
    parent: TokenFlowGraphBuilder,
    rToken: Token
  ) {
    const a = this.universe.getRTokenDeployment(rToken)
    const redeemGraphs: TokenFlowGraphBuilder[] = []
    const proportions: TokenQuantity[] = await a.mint.inputProportions()

    const outputSet = new Set<Token>()
    const basketTokensWithoutSteps: Token[] = []
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

    console.log(rTokenRedeemGraph.graph.toDot().join('\n'))

    return rTokenRedeemGraph
  }

  private async tokenMintingGraph(
    parent: TokenFlowGraphBuilder,
    outToken: Token
  ) {
    let mintAction: BaseAction | undefined
    let out: TokenFlowGraphBuilder
    if (this.universe.rTokensInfo.tokens.has(outToken)) {
      out = await this.rTokenIssueGraph(parent, outToken)
    } else {
      mintAction = this.universe.getMintAction(outToken)

      const inputs = new Set<Token>()

      const mintGraphs: { token: Token; graph: TokenFlowGraphBuilder }[] = []

      for (const input of mintAction.inputToken) {
        if (
          !this.universe.isTokenMintable(input) ||
          parent.isTokenDerived(input)
        ) {
          inputs.add(input)
          continue
        }

        const mintGraph = await this.tokenMintingGraph(parent, input)
        mintGraphs.push({
          token: input,
          graph: mintGraph,
        })

        for (const input of mintGraph.graph.inputs) {
          inputs.add(input)
        }
      }
      out = new TokenFlowGraphBuilder(
        this.universe,
        [...inputs],
        [outToken],
        `issue ${outToken}`
      )
      out.addParentInputs(parent.parentInputs)

      const mintNode = out.addAction(mintAction)
      for (const inputToken of mintAction.inputToken) {
        out.getTokenNode(inputToken).forward(inputToken, 1, mintNode)
      }

      for (const { token, graph } of mintGraphs) {
        const mintGraphNode = out.addSubgraphNode(graph.graph)
        for (const input of graph.graph.inputs) {
          out.getTokenNode(input).forward(input, 1, mintGraphNode)
        }
        mintGraphNode.forward(token, 1, out.getTokenNode(token))

        for (const output of graph.graph.outputs) {
          if (token === output) {
            continue
          }
          mintGraphNode.forward(output, 1, out.graph.end)
        }
      }

      mintNode.forward(outToken, 1, out.getTokenNode(outToken))
      for (const input of mintAction.dustTokens) {
        if (input === outToken) {
          continue
        }
        mintNode.forward(input, 1, out.graph.end)
      }
    }

    for (const tradeToken of out.inputs) {
      const directTrades = findAllWaysToGetFromAToB(
        this.universe,
        tradeToken,
        outToken
      ).filter((i) => i.isTrade && i.is1to1)

      if (directTrades.length === 0) {
        continue
      }
      if (
        mintAction != null &&
        mintAction.is1to1 &&
        mintAction.inputToken[0] === tradeToken
      ) {
        return TokenFlowGraphBuilder.createSingleStep(
          this.universe,
          tradeToken.one,
          [mintAction, ...directTrades],
          `${tradeToken} -> ${outToken}`
        )
      }
      const directTradesGraph = TokenFlowGraphBuilder.createSingleStep(
        this.universe,
        tradeToken.one,
        directTrades,
        `${tradeToken} -> ${outToken} (direct trade)`
      )

      out = fanOutGraphs(
        this.universe,
        [out, directTradesGraph],
        `${tradeToken} -> ${outToken}`
      )
      break
    }

    return out
  }

  private async tokenRedemptionGraph(
    parent: TokenFlowGraphBuilder,
    token: Token
  ): Promise<TokenFlowGraphBuilder> {
    console.log(`Finding ${token} redemption graph`)

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
        underlyingNode.forward(underlying, 1, subgraphNode)
        for (const outputToken of subgraphNode.outputs) {
          const outputTokenNode = out.getTokenNode(outputToken)
          subgraphNode.forward(outputToken, 1, outputTokenNode)
        }
        out.addOutputTokens(subgraphNode.outputs)
      }
    }
    return out
  }

  public async search1To1(input: TokenQuantity, output: Token) {
    let inputToken = input.token
    const prev = this.registry.find(inputToken, output)
    if (prev != null) {
      return await optimise(this.universe, prev, [input])
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
    let outputNode = graph.getTokenNode(output)

    if (this.universe.isTokenBurnable(inputToken)) {
      const redemptionGraph = await this.tokenRedemptionGraph(graph, inputToken)

      const redeemNode = graph.addSubgraphNode(
        redemptionGraph.graph,
        `${input} -> ${output} (redeem)`
      )
      inputNode.forward(inputToken, 1, redeemNode)

      for (const outputToken of redeemNode.outputs) {
        const outputTokenNode = graph.getTokenNode(outputToken)
        redeemNode.forward(outputToken, 1, outputTokenNode)

        if (
          outputToken !== inTokCls &&
          outputTokenNode.recipients.length === 0
        ) {
          const outputToTokClsNode = graph.addSubgraphNode(
            (await this.search1To1Graph(outputToken, inTokCls, true)).graph
          )
          outputTokenNode.forward(outputToken, 1, outputToTokClsNode)
          outputToTokClsNode.forward(inTokCls, 1, graph.getTokenNode(inTokCls))
        }
      }

      inputNode = graph.getTokenNode(inTokCls)
      inputToken = inTokCls
      graph.addParentInputs(new Set([inTokCls]))
    }

    // if (inputToken !== inTokCls) {
    //   const g = await this.search1To1Graph(inputToken, inTokCls, true)
    //   const node = graph.addSubgraphNode(g.graph)
    //   inputNode.forward(inputToken, 1, node)
    //   node.forward(inTokCls, 1, graph.getTokenNode(inTokCls))
    //   inputNode = graph.getTokenNode(inTokCls)
    //   inputToken = inTokCls
    // }

    if (outTokCls !== output && inTokCls !== outTokCls) {
      for (const outToken of inputNode.outputs) {
        if (outToken !== inTokCls) {
          const g = await this.search1To1Graph(outToken, inTokCls, true)
          const node = graph.addSubgraphNode(g.graph)
          inputNode.forward(outToken, 1, node)
          node.forward(inTokCls, 1, graph.getTokenNode(inTokCls))
        } else {
          inputNode.forward(outToken, 1, graph.getTokenNode(inTokCls))
        }
      }
      const g = await this.search1To1Graph(inTokCls, outTokCls, true)
      const node = graph.addSubgraphNode(g.graph)
      graph.getTokenNode(inTokCls).forward(inTokCls, 1, node)

      node.forward(outTokCls, 1, graph.getTokenNode(outTokCls))
      inputNode = graph.getTokenNode(outTokCls)
      inputToken = outTokCls
      graph.addParentInputs(new Set([outTokCls]))
    } else {
      graph.addParentInputs(new Set([inputToken]))
    }

    const subgraph = graph

    if (this.universe.isTokenMintable(output)) {
      const issueanceGraph = await this.tokenMintingGraph(subgraph, output)
      const issueanceNode = subgraph.addSubgraphNode(
        issueanceGraph.graph,
        `${input} -> ${output} (issue)`
      )

      issueanceNode.forward(output, 1, outputNode)
      for (const o of issueanceGraph.graph.outputs) {
        if (o !== output) {
          issueanceNode.forward(o, 1, subgraph.graph.end)
        }
      }
      outputNode = issueanceNode
    }

    for (const inputTokenOfOutputNode of outputNode.inputs) {
      if (inputToken === inputTokenOfOutputNode) {
        continue
      }

      const g = await this.search1To1Graph(
        inputToken,
        inputTokenOfOutputNode,
        true
      )
      const tradeNode = subgraph.addSubgraphNode(g.graph)
      graph.getTokenNode(inputToken).forward(inputToken, 1, tradeNode)
      tradeNode.forward(
        inputTokenOfOutputNode,
        1,
        subgraph.getTokenNode(inputTokenOfOutputNode)
      )
    }

    for (const inputToken of outputNode.inputs) {
      subgraph.getTokenNode(inputToken).forward(inputToken, 1, outputNode)
    }
    this.registry.define(inputToken, output, graph)
    return await optimise(this.universe, graph, [input])
  }
}
