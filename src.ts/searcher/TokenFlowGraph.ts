import { NodesmithProvider } from '@ethersproject/providers'
import { Universe } from '../Universe'
import { BaseAction } from '../action/Action'
import { DefaultMap } from '../base/DefaultMap'
import { TokenQuantity, Token } from '../entities/Token'
import { Queue } from './Queue'
import { shortestPath } from '../exchange-graph/BFS'

class NodeProxy {
  private version: number
  public constructor(
    private readonly graph: TokenFlowGraph,
    public readonly id: number
  ) {
    this.version = graph.getVersion(id)
  }

  public toString() {
    return `${this.id} - ${this.name}`
  }

  private checkVersion() {
    if (this.graph.getVersion(this.id) !== this.version) {
      throw new Error(`Version mismatch for node ${this.id}`)
    }
  }

  public get inputTokens() {
    this.checkVersion()
    return this.graph.data[this.id].inputs
  }

  public get action() {
    this.checkVersion()
    return this.graph.data[this.id].action
  }

  public getSubNodes(): NodeProxy[] {
    this.checkVersion()
    if (this.action instanceof TokenFlowGraph) {
      return this.action.sort()
    } else {
      return [this]
    }
  }

  public get outputTokens() {
    this.checkVersion()
    return this.graph.data[this.id].outputs
  }

  public get name() {
    this.checkVersion()
    return this.graph.data[this.id].nodeName
  }

  public forward(token: Token, parts: number, to: NodeProxy) {
    this.graph.forward(this.id, to.id, token, parts)
  }

  public remove() {
    this.graph.freeNode(this.id)
  }
}

class TokenFlowSplits {
  constructor(
    public readonly token: Token,
    public sum: number,
    public readonly parts: number[],
    public readonly recipient: number[]
  ) {}

  public forward(parts: number, recipient: number) {
    let idx = this.recipient.indexOf(recipient)
    if (idx === -1) {
      idx = this.recipient.length
      this.recipient.push(recipient)
      this.parts.push(0)
    }
    this.parts[idx] += parts
    this.sum += parts
  }

  public *[Symbol.iterator]() {
    for (let i = 0; i < this.recipient.length; i++) {
      yield {
        recipient: this.recipient[i],
        proportion: this.parts[i] / this.sum,
      }
    }
  }

  public clone() {
    return new TokenFlowSplits(
      this.token,
      this.sum,
      [...this.parts],
      [...this.recipient]
    )
  }
}

class OutgoingTokens {
  private tokenToEdge = new DefaultMap<Token, TokenFlowSplits>((token) => {
    const edges = new TokenFlowSplits(token, 0, [], [])
    this.edges.push(edges)
    return edges
  })
  public getEdge(token: Token) {
    return this.tokenToEdge.get(token)
  }
  public constructor(
    public readonly nodeId: number,
    public readonly edges: TokenFlowSplits[]
  ) {
    for (const edge of edges) {
      this.tokenToEdge.set(edge.token, edge)
    }
  }
  public clone() {
    return new OutgoingTokens(
      this.nodeId,
      this.edges.map((edge) => edge.clone())
    )
  }

  public *[Symbol.iterator]() {
    for (const edge of this.edges) {
      for (const split of edge) {
        yield {
          token: edge.token,
          proportion: split.proportion,
          recipient: split.recipient,
        }
      }
    }
  }
}

let nodeCounter = 0
enum NodeType {
  Split,
  Action,
}
class Node {
  public readonly nodeName: string
  public readonly nodeId: string = `node_${nodeCounter++}`

  public constructor(
    public readonly inputs: Token[] = [],
    public readonly action: TokenFlowGraph | BaseAction | null = null,
    public readonly outputs: Token[] = [],
    public readonly nodeType: NodeType = NodeType.Action,
    name: string = ''
  ) {
    this.nodeName = name
    if (name.length === 0) {
      if (action != null) {
        if (action instanceof TokenFlowGraph) {
          this.nodeName = `graph ${action.inputs.join(
            ' '
          )} into ${action.outputs.join(' ')}`
        } else {
          if (action.isTrade) {
            this.nodeName = `trade ${action.inputToken.join(
              ' '
            )} for ${action.outputToken.join(' ')} on ${action.protocol}`
          } else {
            if (action.inputToken.length !== 1) {
              this.nodeName = `mint ${action.outputToken.join(' ')} on ${
                action.protocol
              }`
            } else if (action.outputToken.length !== 1) {
              this.nodeName = `redeem ${action.inputToken.join(' ')} on ${
                action.protocol
              }`
            } else {
              this.nodeName = `convert ${action.inputToken.join(
                ' '
              )} into ${action.outputToken.join(' ')} on ${action.protocol}`
            }
          }
        }
      }
    }
  }

  public clone(updateAction = this.action) {
    return new Node([...this.inputs], updateAction, [...this.outputs])
  }
}

const getInputsAndOutputs = (action: TokenFlowGraph | BaseAction | null) => {
  if (action instanceof TokenFlowGraph) {
    return {
      inputs: action.start.inputTokens,
      outputs: action.end.outputTokens,
    }
  }
  if (action instanceof BaseAction) {
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
class IncomingEdge {
  public constructor(
    public readonly source: number,
    public readonly token: Token,
    public readonly recipient: number
  ) {}
}

let graphId = 0
class TokenFlowGraph {
  private graphId = graphId++
  private nodeId = 0
  private freeList: number[] = []
  private outgoingEdges: (OutgoingTokens | null)[] = []
  private incomingEdges: IncomingEdge[][] = []
  private nodes_: Node[] = []
  public get data() {
    return this.nodes_
  }
  private nodeVersions: number[] = []
  private start_: number
  private end_: number
  public get start() {
    return this.getNode(this.start_)
  }
  public get end() {
    return this.getNode(this.end_)
  }

  public get inputs() {
    return this.nodes_[this.start_].inputs
  }

  public get outputs() {
    return this.nodes_[this.end_].outputs
  }

  public clone() {
    const graph = new TokenFlowGraph()
    graph.nodes_ = [...this.nodes_]
    graph.outgoingEdges = this.outgoingEdges.map(
      (edge) => edge?.clone() ?? null
    )
    graph.incomingEdges = this.incomingEdges.map((e) => [...e])
    graph.nodeVersions = [...this.nodeVersions]
    graph.start_ = this.start_
    graph.end_ = this.end_
    return graph
  }

  public toDot(): string[] {
    const lines: string[] = []
    lines.push(`subgraph cluster_${this.graphId} {`)
    lines.push(`  style=dotted;`)
    lines.push(`  color=black;`)
    lines.push(
      `  label = "Derive ${this.nodes_[this.start_].inputs.join(
        ', '
      )} -> ${this.nodes_[this.end_].outputs.join(', ')}"`
    )
    for (const node of this.nodes_) {
      if (node.action instanceof TokenFlowGraph) {
        lines.push(
          ...node.action.toDot().map((line) => `  ${node.nodeId} -> ${line}`)
        )
      } else {
        lines.push(`  ${node.nodeId} [label = "${node.nodeName}"]`)
      }
    }
    for (let i = 0; i < this.outgoingEdges.length; i++) {
      const edge = this.outgoingEdges[i]!
      if (edge == null) {
        console.log('Missing edge', i)
        continue
      }
      const node = this.nodes_[i]!
      if (node == null) {
        console.log('Missing node', i)
        continue
      }
      for (const tokenOutputs of edge.edges) {
        for (let j = 0; j < tokenOutputs.recipient.length; j++) {
          const recipient = tokenOutputs.recipient[j]
          const parts = tokenOutputs.parts[j]
          const proportion = parts / tokenOutputs.sum
          if (proportion === 0) {
            continue
          }
          const propStr =
            proportion === 1
              ? tokenOutputs.token.symbol
              : `${proportion.toFixed(2)}% ${tokenOutputs.token}`
          const act = this.nodes_[i].action
          if (act instanceof TokenFlowGraph) {
            const subgraphStartNode = act.nodes_[act.start_]
            lines.push(
              `  ${node.nodeId} -> ${subgraphStartNode.nodeId} [label="${propStr}"]`
            )
          } else {
            lines.push(
              `  ${node.nodeId} -> ${this.nodes_[recipient].nodeId} [label="${propStr}"]`
            )
          }
        }
      }
    }

    lines.push(`}`)
    return lines
  }

  public getVersion(nodeId: number) {
    this.checkNodeExists(nodeId)
    return this.nodeVersions[nodeId]
  }

  public newNode(
    action: TokenFlowGraph | BaseAction | null = null,
    nodeType: NodeType = action == null ? NodeType.Split : NodeType.Action,
    name: string = ''
  ) {
    const { inputs, outputs } = getInputsAndOutputs(action)

    if (this.freeList.length > 0) {
      const id = this.freeList.pop()!
      this.nodeVersions[id] += 1
      this.nodes_[id] = new Node(inputs, action, outputs, nodeType, name)
      this.outgoingEdges[id] = new OutgoingTokens(id, [])
      this.incomingEdges[id] = []
      return new NodeProxy(this, id)
    }
    const id = this.nodeId++
    this.nodes_.push(new Node(inputs, action, outputs, nodeType, name))
    this.outgoingEdges.push(new OutgoingTokens(id, []))
    this.incomingEdges.push([])
    this.nodeVersions.push(0)
    return new NodeProxy(this, id)
  }

  private checkNodeExists(id: number) {
    if (id >= this.nodes_.length) {
      throw new Error(`Node ${id} does not exist`)
    }
  }

  public getNode(id: number) {
    this.checkNodeExists(id)
    return new NodeProxy(this, id)
  }

  public freeNode(id: number) {
    this.checkNodeExists(id)
    this.freeList.push(id)
    this.outgoingEdges[id] = null
    this.incomingEdges[id] = []
  }

  public forward(fromId: number, toId: number, input: Token, parts: number) {
    this.checkNodeExists(fromId)
    this.checkNodeExists(toId)
    const edge = this.outgoingEdges[fromId]!.getEdge(input)
    edge.forward(parts, toId)

    this.incomingEdges[toId] = this.incomingEdges[toId].filter(
      (edge) => edge.token !== input
    )
    this.incomingEdges[toId].push(new IncomingEdge(fromId, input, toId))
  }

  public getIncomingEdges(id: number) {
    this.checkNodeExists(id)
    return this.incomingEdges[id]
  }
  public getOutgoingEdges(id: number) {
    this.checkNodeExists(id)
    return this.outgoingEdges[id]
  }

  public sort() {
    const sorted: number[] = []
    const openSet = new Queue<number>()
    const seen = this.nodes_.map((i) => false)
    openSet.push(this.start_)
    while (openSet.isNotEmpty) {
      const node = openSet.pop()
      if (seen[node]) {
        continue
      }
      if (node == null) {
        throw new Error(`PANIC! Got null node in sort()`)
      }
      sorted.push(node)
      seen[node] = true
      const edge = this.outgoingEdges[node]
      if (edge == null) {
        throw new Error(`Missing edge for ${node}`)
      }
      for (const { recipient } of edge) {
        openSet.push(recipient)
      }
    }
    return sorted.map((i) => this.getNode(i).getSubNodes()).flat()
  }

  public constructor() {
    this.start_ = this.newNode(null, NodeType.Split, 'start').id
    this.end_ = this.newNode(null, NodeType.Split, 'output').id
  }
}

export class TokenFlowGraphBuilder {
  public readonly graph = new TokenFlowGraph()
  private readonly tokenBalanceNodes = new DefaultMap<Token, number>(
    (token) => this.graph.newNode(null, NodeType.Split, `${token.symbol}`).id
  )

  public toDot(): string[] {
    const lines: string[] = []
    lines.push('digraph G {')
    for (const line of this.graph.toDot()) {
      lines.push(`  ${line}`)
    }
    lines.push('}')
    return lines
  }

  public constructor(
    private readonly inputs: TokenQuantity[],
    private readonly outputs: [number, Token][]
  ) {
    const inps = this.graph.start.inputTokens
    const outs = this.graph.end.outputTokens
    for (const input of inputs) {
      inps.push(input.token)
      const balanceNode = this.getTokenNode(input.token)
      this.graph.start.forward(input.token, 1, balanceNode)
    }
    for (const output of outputs) {
      outs.push(output[1])
      this.tokenBalanceNodes.get(output[1])
    }
  }

  public getTokenNode(token: Token) {
    return this.graph.getNode(this.tokenBalanceNodes.get(token))
  }

  public static createSingleStep(input: TokenQuantity, actions: BaseAction[]) {
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
    const builder = TokenFlowGraphBuilder.create1To1(
      input,
      actions[0].outputToken[0]
    )

    const inputNode = builder.getTokenNode(input.token)
    const outputNode = builder.getTokenNode(actions[0].outputToken[0])
    outputNode.forward(actions[0].outputToken[0], 1, builder.graph.end)

    for (const action of actions) {
      const actionNode = builder.graph.newNode(action)
      inputNode.forward(action.inputToken[0], 1, actionNode)
      actionNode.forward(action.outputToken[0], 1, outputNode)
    }

    return builder
  }

  public static create1To1(
    input: TokenQuantity,
    output: Token
  ): TokenFlowGraphBuilder {
    const builder = new TokenFlowGraphBuilder([input], [[1, output]])
    return builder
  }
}

export class TokenFlowGraphSearcher {
  private readonly topLevelBuilder: TokenFlowGraphBuilder
  public constructor(
    public readonly universe: Universe,
    public readonly inputs: TokenQuantity[],
    public readonly outputs: [number, Token][]
  ) {
    this.topLevelBuilder = new TokenFlowGraphBuilder(inputs, outputs)
  }

  public toDot(): string[] {
    return this.topLevelBuilder.toDot()
  }

  public async search() {
    const path = shortestPath(
      this.universe,
      this.inputs[0].token,
      this.outputs[0][1]
    )
    console.log(path.join(' -> '))
  }
}
