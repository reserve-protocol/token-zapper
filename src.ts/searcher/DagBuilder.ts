import { child } from 'winston'
import { Universe } from '../Universe'
import { DefaultMap } from '../base/DefaultMap'
import { PricedTokenQuantity, Token, TokenQuantity } from '../entities/Token'
import { TokenAmounts } from '../entities/TokenAmounts'
import { SwapPlan } from './Swap'
import { unwrapAction } from './TradeAction'
import { BaseAction } from '../action/Action'
import {
  EvaluatedDag,
  DagNode,
  OutputNode,
  BalanceNode,
  ActionNode,
  DagBuilderConfig,
  RootNode,
  normalizeVector,
  SplitNode,
  copyVectors,
  DagEvalContext,
  EvaluatedNode,
  PricedTokenQuantities,
} from './Dag'
import { optimiseTrades } from './optimiseTrades'
import { wait } from '../base/controlflow'

type ObjectiveFunction = (dag: EvaluatedDag) => number

enum SplitNodeType {
  Standard,
  Trades,
}
const previousResults = new DefaultMap<
  SplitNode,
  Map<number, Promise<number[]>>
>(() => new Map())

const RESOLUTION = 5

export class DagBuilder {
  public startNode!: DagNode
  public outputNode!: OutputNode

  public readonly dependencies = new DefaultMap<DagNode, DagNode[]>(() => [])

  public balanceNodeTip = new DefaultMap<Token, DagNode>((token) => {
    if (!this.balanceNodeStart.has(token)) {
      return this.outputNode
    }
    return new BalanceNode(token)
  })
  private balanceNodeStart = new Map<Token, DagNode>()

  public readonly edges = new DefaultMap<DagNode, DefaultMap<Token, DagNode[]>>(
    () => {
      return new DefaultMap<Token, DagNode[]>(() => {
        return []
      })
    }
  )

  public splitNodes: number[][] = []
  public splitNodeTypes = new DefaultMap<number, SplitNodeType>(
    () => SplitNodeType.Standard
  )
  public splitNodeEdges = new DefaultMap<number, ActionNode[]>(() => [])
  private openTokenSet = new Map<Token, DagNode[]>()

  // Clones the DAGBuilder such that the constant state is preserved, while the mutable state is copied
  public clone() {
    const self = new DagBuilder(this.universe, this.config)
    self.startNode = this.startNode
    self.outputNode = this.outputNode

    for (const vect of this.splitNodes) {
      self.splitNodes.push([...vect])
    }

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
      self.openTokenSet.set(token, [...consumers])
    }
    return self
  }

  public get isDagConstructed() {
    return this.openTokenSet.size === 0
  }

  public closeOpenSet() {
    this.openTokenSet.clear()
    this.balanceNodeTip.clear()
    this.balanceNodeStart.clear()
  }

  public toDot() {
    try {
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
    } catch (e) {
      this.debugToDot()
      throw e
    }
  }

  public getBalanceStartNode(token: Token) {
    return this.balanceNodeStart.get(token)
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

    for (let i = 0; i < config.userInput.length; i++) {
      const token = config.userInput[i].token
      const inputBalanceNode = new BalanceNode(token)
      self.balanceNodeTip.set(token, inputBalanceNode)
      self.balanceNodeStart.set(token, inputBalanceNode)
      self.forward(self.startNode, token, inputBalanceNode)
    }
    for (const qty of config.userOutput) {
      self.balanceNodeTip.set(qty.token, self.outputNode)
      self.openTokenSet.set(qty.token, [self.outputNode])
    }
    return self
  }

  private getOrCreateSplitNodeIndex(splits: number[]) {
    if (splits.length !== 0) {
      normalizeVector(splits)
    }
    for (let i = 0; i < this.splitNodes.length; i++) {
      if (this.splitNodes[i].length === 0) {
        this.splitNodes[i] = splits
        return i
      }
    }
    const index = this.splitNodes.length
    this.splitNodes.push(splits)
    return index
  }
  private createSplitNode(token: Token, splits: number[]) {
    if (splits.length === 0) {
      throw new Error('Cannot create split node with empty splits')
    }
    const index = this.getOrCreateSplitNodeIndex(splits)
    return new SplitNode(token, index)
  }

  private forward(from: DagNode, token: Token, next: DagNode) {
    if (from === next) {
      return
    }
    const edges = this.edges.get(from).get(token)
    edges.push(next)
    this.dependencies.get(next).push(from)

    if (!(from instanceof SplitNode)) {
      return
    }
    const splits = this.splitNodes[from.splitNodeIndex]
    if (splits.length >= edges.length) {
      return
    }
    splits.push(0)
    for (let i = 0; i < splits.length; i++) {
      splits[i] = 1 / splits.length
    }
  }
  private constructor(
    public readonly universe: Universe,
    public readonly config: DagBuilderConfig
  ) {}

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
    const consumers = this.takeOpenSet(token)

    // If there is more than one consumer, we need to split the current balance between all of them
    // and forward the remainder to the balance node

    if (this.openTokenSet.size !== 0) {
      const splitNode = this.createSplitNode(
        token,
        consumers.map(() => 1 / (consumers.length + 1))
      )
      const balanceNode = new BalanceNode(token)
      for (const consumer of [...consumers, balanceNode]) {
        this.forward(splitNode, token, consumer)
      }
      this.forward(previousNode, token, splitNode)
      this.balanceNodeTip.set(token, balanceNode)
    } else {
      this.balanceNodeTip.delete(token)
      if (consumers.length === 1) {
        this.forward(previousNode, token, consumers[0])
      } else {
        const splits = consumers.map(() => 1 / consumers.length)
        const splitNode = this.createSplitNode(token, splits)
        this.forward(previousNode, token, splitNode)
        for (const consumer of consumers) {
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
    return outputProportion
  }

  public async replaceOpenSet(tokenDerivations: SwapPlan[]) {
    // SplitNode -> productions
    const startNodes = new DefaultMap<Token, SplitNode>((token) =>
      this.createSplitNode(token, [1])
    )
    const producerOutputNode = new DefaultMap<Token, OutputNode | BalanceNode>(
      (token) => {
        if (this.config.outputTokenSet.has(token)) {
          return this.outputNode
        }
        return new BalanceNode(token)
      }
    )

    const productions = new DefaultMap<
      Token,
      DefaultMap<
        Token,
        {
          start: SplitNode // If no trades exist route to tradeExcess node
          mintsStart: SplitNode
          outputNode: OutputNode | BalanceNode
        }
      >
    >(
      (tokenIn) =>
        new DefaultMap((tokenOut) => {
          const start = startNodes.get(tokenIn)
          const outputNode = producerOutputNode.get(tokenOut)

          return {
            start: start,
            mintsStart: start,
            outputNode: outputNode,
          }
        })
    )
    for (const mint of tokenDerivations) {
      const inputProportions = (await mint.inputProportions()).map(
        (i) => [i.asNumber(), i.token] as [number, Token]
      )
      const outputProportions = (await mint.outputProportions()).map(
        (i) => [i.asNumber(), i.token] as [number, Token]
      )
      const node = new ActionNode(inputProportions, mint, outputProportions)

      if (mint.is1to1) {
        const tokenIn = mint.inputs[0]
        const tokenOut = mint.outputs[0]
        const production = productions.get(tokenIn).get(tokenOut)
        this.forward(production.mintsStart, tokenIn, node)
        this.forward(node, tokenOut, production.outputNode)
      } else if (mint.outputs.length === 1) {
        const tokenOut = mint.outputs[0]
        for (const tokenIn of mint.inputs) {
          const production = productions.get(tokenIn).get(tokenOut)
          this.forward(production.mintsStart, tokenIn, node)
        }
        const outputNode = producerOutputNode.get(tokenOut)
        this.forward(node, tokenOut, outputNode)
      } else {
        throw new Error('Unsupported mint: ' + mint.toString())
      }

      for (const dustToken of mint.dustTokens) {
        this.forward(node, dustToken, this.outputNode)
      }
    }

    for (const [token, consumers] of this.openTokenSet.entries()) {
      const outputNode = producerOutputNode.get(token)
      const splitNode = this.createSplitNode(
        token,
        consumers.map(() => 1 / consumers.length)
      )
      this.forward(outputNode, token, splitNode)
      for (const consumer of consumers) {
        this.forward(splitNode, token, consumer)
      }
    }
    this.openTokenSet.clear()

    for (const [inputToken, splitNode] of startNodes.entries()) {
      this.openTokenSet.set(inputToken, [splitNode])
    }
  }

  public getSorted() {
    if (this.openTokenSet.size !== 0) {
      throw new Error('Cannot get sorted graph, graph is not built')
    }
    if (this.balanceNodeTip.size !== 0) {
      throw new Error('Cannot get sorted graph, graph is not finalized')
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
    for (const s of sorted) {
      all.delete(s)
    }
    if (all.size !== 0) {
      console.log(
        `Missing nodes from DAG: ${[...all].map((i) => i.dotNode()).join(', ')}`
      )
      throw new Error(
        `Missing nodes from DAG: ${[...all].map((i) => i.dotNode()).join(', ')}`
      )
    }
    return sorted
  }

  public debugToDot() {
    console.log(`digraph G {`)
    for (const node of this.edges.keys()) {
      console.log(`  ${node.dotNode()};`)
    }
    for (const [from, edges] of this.edges.entries()) {
      for (const [token, to] of edges.entries()) {
        for (const t of to) {
          console.log(
            `  ${from.dotId()} -> ${t.dotId()} [label="${token.symbol}"];`
          )
        }
      }
    }
    console.log(`}`)
  }

  private getDependencyChain(node: DagNode) {
    let n = node
    const chain: DagNode[] = [n]
    while (n !== this.startNode) {
      const deps = this.dependencies.get(n)
      if (deps.length !== 1) {
        break
      }
      const dep = deps[0]
      let numberOfTotalOutgoingEdges = 0
      for (const [_, edges] of this.edges.get(dep).entries()) {
        numberOfTotalOutgoingEdges += edges.length
      }
      n = deps[0]
      chain.push(n)
      if (numberOfTotalOutgoingEdges !== 1) {
        break
      }
    }
    chain.reverse()
    return chain
  }

  public async tradeUserInputFor(
    trades: BaseAction[],
    prevInputToken: Token,
    newInputToken: Token,
    createTradeNode: boolean = true
  ) {
    const splitNode = this.createSplitNode(
      prevInputToken,
      trades.map(() => 1 / trades.length)
    )
    let prev = this.balanceNodeTip.get(prevInputToken)
    if (prev == null) {
      throw new Error('No start node for ' + prevInputToken)
    }
    if (!(prev instanceof SplitNode)) {
      const newPrev = this.createSplitNode(prevInputToken, [1])
      this.forward(prev, prevInputToken, newPrev)
      this.balanceNodeTip.set(prevInputToken, newPrev)
      prev = newPrev
    }
    this.forward(prev, prevInputToken, splitNode)

    const outnodeNode = this.config.outputTokenSet.has(newInputToken)
      ? this.outputNode
      : this.balanceNodeTip.has(newInputToken)
      ? this.balanceNodeTip.get(newInputToken)!
      : new BalanceNode(newInputToken)
    if (
      outnodeNode !== this.outputNode &&
      !this.balanceNodeTip.has(newInputToken)
    ) {
      this.balanceNodeTip.set(newInputToken, outnodeNode)
      this.balanceNodeStart.set(newInputToken, outnodeNode)
    }

    const tradeNodes: ActionNode[] = []
    for (const trade of trades) {
      const tradeNode = new ActionNode(
        [[1, prevInputToken]],
        new SwapPlan(this.universe, [trade]),
        [[1, newInputToken]]
      )
      tradeNodes.push(tradeNode)
      this.forward(splitNode, prevInputToken, tradeNode)
      this.forward(tradeNode, newInputToken, outnodeNode)
    }
    if (createTradeNode) {
      this.splitNodeEdges.set(splitNode.splitNodeIndex, tradeNodes)
      this.splitNodeTypes.set(splitNode.splitNodeIndex, SplitNodeType.Trades)
    }
  }

  public async unwrapInput(action: BaseAction) {
    if (action.inputToken.length !== 1) {
      throw new Error('unwrapInput: action must have 1 input token')
    }
    const inputToken = action.inputToken[0]
    const currentTip = this.balanceNodeTip.get(inputToken)
    this.balanceNodeTip.delete(inputToken)
    const node = new ActionNode(
      [[1, inputToken]],
      new SwapPlan(this.universe, [action]),
      action.outputToken.map((i) => [1, i] as [number, Token])
    )
    this.forward(currentTip, inputToken, node)
    for (const outputToken of action.outputToken) {
      if (this.config.outputTokenSet.has(outputToken)) {
        this.forward(node, outputToken, this.outputNode)
        continue
      }
      if (!this.balanceNodeTip.has(outputToken)) {
        const balNode = new BalanceNode(outputToken)
        this.balanceNodeTip.set(outputToken, balNode)
        this.balanceNodeStart.set(outputToken, balNode)
        this.forward(node, outputToken, balNode)
      } else {
        const balanceNode = this.balanceNodeTip.get(outputToken)!
        this.forward(node, outputToken, balanceNode)
      }
    }
  }

  public async finalize(
    mintPrices: Map<Token, Map<Token, number>>,
    tradeActions: BaseAction[]
  ) {
    // console.log('Finalizing DAG:')
    for (const [t, node] of this.balanceNodeTip.entries()) {
      if (node === this.outputNode) {
        continue
      }
      this.forward(node, t, this.outputNode)
    }
    this.balanceNodeTip.clear()
    this.simplify()

    const byTokens = new DefaultMap<Token, DefaultMap<Token, Set<BaseAction>>>(
      () => new DefaultMap<Token, Set<BaseAction>>(() => new Set())
    )
    const spentTrades = new Set<BaseAction>()
    // console.log(`Trades available: ${tradeActions.length}`)
    for (const act of tradeActions) {
      // console.log(`  ${act.toString()}`)
      const input = act.inputToken[0]
      const output = act.outputToken[0]
      byTokens.get(input).get(output).add(act)
    }

    const getTrades = (trades: BaseAction[]) => {
      const out: BaseAction[] = []
      for (const trade of trades) {
        if (spentTrades.has(trade)) {
          continue
        }
        out.push(trade)
      }
      return out
    }

    const addTradeSplits = (
      inputToken: Token,
      outputToken: Token,
      trades: BaseAction[],

      inputNode: DagNode,
      outputNode: DagNode
    ) => {
      const startNode = inputNode
      const consumer = this.edges.get(startNode).get(inputToken)[0]
      this.unforward(startNode, inputToken, consumer)
      const splitNode = this.createSplitNode(inputToken, [
        1,
        ...trades.map(() => 1),
      ])
      this.forward(startNode, inputToken, splitNode)
      const tradeNodes: ActionNode[] = []
      for (const trade of trades) {
        spentTrades.add(trade)
        const node = new ActionNode(
          [[1, inputToken]],
          new SwapPlan(this.universe, [trade]),
          [[1, outputToken]]
        )
        this.forward(splitNode, inputToken, node)
        this.forward(node, outputToken, outputNode)
        tradeNodes.push(node)
      }
      this.forward(splitNode, inputToken, consumer)
      this.splitNodeTypes.set(splitNode.splitNodeIndex, SplitNodeType.Trades)
      this.splitNodeEdges.set(splitNode.splitNodeIndex, tradeNodes)
    }

    for (const inputToken of this.config.inputTokenSet) {
      for (const outputToken of this.config.outputTokenSet) {
        const trades = getTrades([...byTokens.get(inputToken).get(outputToken)])
        if (trades.length === 0) {
          continue
        }
        addTradeSplits(
          inputToken,
          outputToken,
          trades,
          this.startNode,
          this.outputNode
        )
      }
    }

    // add trades for n-to-1 mint edges
    for (const mintNode of this.edges.keys()) {
      if (!(mintNode instanceof ActionNode)) {
        continue
      }
      const dependencies = this.dependencies.get(mintNode)
      if (dependencies.length === 1) {
        continue
      }
      const action = mintNode.actions.steps[0]
      if (action.isTrade || action.is1to1) {
        continue
      }
      if (action.outputToken.length !== 1) {
        continue
      }
      const outputToken = action.outputToken[0]
      const consumers = this.edges.get(mintNode).get(outputToken)
      if (consumers.length !== 1) {
        continue
      }
      const consumer = consumers[0]

      const trades = getTrades(
        tradeActions.filter((i) => i.outputToken[0] === outputToken)
      )
      if (trades.length === 0) {
        continue
      }
      const chains = dependencies.map((n) => this.getDependencyChain(n))
      if (chains.length === 0) {
        continue
      }
      const startNode = chains[0][0]
      if (!chains.every((chain) => chain[0] === startNode)) {
        continue
      }
      const outEdges = this.edges.get(startNode)
      if (outEdges.size !== 1) {
        continue
      }
      const [startToken] = [...outEdges.entries()][0]
      const tradesToUse = trades.filter((i) => i.inputToken[0] === startToken)
      if (tradesToUse.length === 0) {
        continue
      }
      const tradesToMintsSplitNode = this.createSplitNode(startToken, [
        1,
        ...tradesToUse.map(() => 1),
      ])
      this.forward(startNode, startToken, tradesToMintsSplitNode)
      const tradeNodes: ActionNode[] = []
      for (const trade of tradesToUse) {
        spentTrades.add(trade)
        const tradeNode = new ActionNode(
          [[1, startToken]],
          new SwapPlan(this.universe, [trade]),
          [[1, outputToken]]
        )
        this.forward(tradesToMintsSplitNode, startToken, tradeNode)
        this.forward(tradeNode, outputToken, consumer)
        tradeNodes.push(tradeNode)
      }
      this.splitNodeEdges.set(tradesToMintsSplitNode.splitNodeIndex, tradeNodes)
      this.splitNodeTypes.set(
        tradesToMintsSplitNode.splitNodeIndex,
        SplitNodeType.Trades
      )
      const mintSplitNode = this.createSplitNode(
        startToken,
        chains.map(() => 1 / chains.length)
      )
      this.forward(tradesToMintsSplitNode, startToken, mintSplitNode)

      for (const chain of chains) {
        this.unforward(startNode, startToken, chain[1])
        this.forward(mintSplitNode, startToken, chain[1])
      }
    }

    for (const [node, outgoingEdges] of this.edges.entries()) {
      if (!(node instanceof ActionNode)) {
        continue
      }
      const dependencies = this.dependencies.get(node)
      if (dependencies.length !== 1) {
        continue
      }
      const action = node.actions.steps[0]
      if (action.isTrade || !action.is1to1) {
        continue
      }
      const inputToken = action.inputToken[0]
      if (!this.config.inputTokenSet.has(inputToken)) {
        continue
      }
      const outputToken = action.outputToken[0]

      const trades = getTrades([...byTokens.get(inputToken).get(outputToken)])
      if (trades.length === 0) {
        continue
      }
      const startNode = dependencies[0]
      const endNode = outgoingEdges.get(outputToken)[0]
      if (startNode == null || endNode == null) {
        throw new Error(
          `${node}: PANIC, weird edges startNode=${startNode}, endNode=${endNode}`
        )
      }
      this.unforward(startNode, inputToken, node)
      this.dependencies.delete(node)
      const splitNode = this.createSplitNode(inputToken, [
        1,
        ...trades.map(() => 1),
      ])
      this.forward(startNode, inputToken, splitNode)
      this.forward(splitNode, inputToken, node)
      const nodes: ActionNode[] = []
      for (const trade of trades) {
        spentTrades.add(trade)
        const tradeNode = new ActionNode(
          [[1, inputToken]],
          new SwapPlan(this.universe, [trade]),
          [[1, outputToken]]
        )
        this.forward(splitNode, inputToken, tradeNode)
        this.forward(tradeNode, outputToken, endNode)
        nodes.push(tradeNode)
      }
      this.splitNodeEdges.set(splitNode.splitNodeIndex, nodes)
      this.splitNodeTypes.set(splitNode.splitNodeIndex, SplitNodeType.Trades)
    }

    for (const [node] of this.edges.entries()) {
      if (!(node instanceof SplitNode)) {
        continue
      }
      const splits = this.splitNodes[node.splitNodeIndex]
      for (let i = 0; i < splits.length; i++) {
        splits[i] = 1 / splits.length
      }
    }

    console.log('Final DAG:')
    console.log(this.toDot())

    /**
     * Run's the initial optimisation phase, this phase will try to
     * optimise for average price of output token
     */
    const start = Date.now()

    let result = await this.optimiseDag({
      iterations: 100,
      objectiveFn: (i) => {
        if (
          i.outputs.length === 0 ||
          i.outputs[0] === null ||
          i.outputs[0].token == null ||
          !this.config.outputTokenSet.has(i.outputs[0].token)
        ) {
          return -Infinity
        }
        const qtyOut = i.outputs[0].asNumber() * 2
        if (typeof qtyOut !== 'number' || qtyOut <= 0.00001) {
          return -Infinity
        }
        const inputValue =
          i.inputsValue + i.txFee.price.asNumber() + i.dustValue
        const price = inputValue / qtyOut
        return -price
      },
      epsilon: 0.00001,
      resetOnWorse: 10,
      learningRate: (i) => 0.25 / (i + 1) ** 1.35,
      mintPrices,
    })
    for (let i = 0; i < 3; i++) {
      if (Date.now() - start > 2000) {
        break
      }
      result = await result.dag.optimiseDag({
        iterations: 100,
        objectiveFn: (i) => {
          if (
            i.outputs.length === 0 ||
            i.outputs[0] === null ||
            i.outputs[0].token == null ||
            !this.config.outputTokenSet.has(i.outputs[0].token)
          ) {
            return -Infinity
          }
          const qtyOut = i.outputs[0].asNumber() * 2
          if (typeof qtyOut !== 'number' || qtyOut <= 0.00001) {
            return -Infinity
          }
          const inputValue =
            i.inputsValue + i.txFee.price.asNumber() + i.dustValue
          const price = inputValue / qtyOut
          return -price
        },
        epsilon: 0.00001,
        resetOnWorse: 10,
        learningRate: (i) => 0.25 / (i + 1) ** 1.35,
        mintPrices,
      })
    }

    previousResults.clear()

    for (const node of this.edges.keys()) {
      if (node instanceof ActionNode) {
        node.actions.steps[0] = unwrapAction(node.actions.steps[0])
      }
    }

    return result
  }

  public async splitTradeInputIntoNewOutput(trades: BaseAction[]) {
    // console.log(`Splitting trades`)
    // this.debugToDot()
    // console.log(`Open set:`)
    // for (const [token, nodes] of this.openTokenSet.entries()) {
    //   console.log(`  ${token}: ${nodes.length}`)
    //   for (const node of nodes) {
    //     console.log(`    ${node.dotNode()}`)
    //   }
    // }
    const byTokens = new DefaultMap<Token, DefaultMap<Token, BaseAction[]>>(
      () => new DefaultMap<Token, BaseAction[]>(() => [])
    )
    for (const trade of trades) {
      byTokens.get(trade.inputToken[0]).get(trade.outputToken[0]).push(trade)
    }

    for (const [inputToken, outputTokenMap] of byTokens.entries()) {
      for (const [outputToken, trades] of outputTokenMap.entries()) {
        if (!this.openTokenSet.has(outputToken)) {
          const balNode = new BalanceNode(outputToken)
          this.openTokenSet.set(outputToken, [balNode])
          const tradeNodes: ActionNode[] = []
          const tradeSplitNode = this.createSplitNode(
            inputToken,
            trades.map(() => 1 / trades.length)
          )
          for (const trade of trades) {
            const tradeNode = new ActionNode(
              [[1, inputToken]],
              new SwapPlan(this.universe, [trade]),
              [[1, outputToken]]
            )
            tradeNodes.push(tradeNode)
            this.forward(tradeSplitNode, inputToken, tradeNode)
            this.forward(tradeNode, outputToken, balNode)
          }
          this.splitNodeEdges.set(tradeSplitNode.splitNodeIndex, tradeNodes)
          this.splitNodeTypes.set(
            tradeSplitNode.splitNodeIndex,
            SplitNodeType.Trades
          )
          const current = this.openTokenSet.get(inputToken) ?? []
          current.push(tradeSplitNode)
          this.openTokenSet.set(inputToken, current)
          continue
        }
        const tradeSplitNode = this.createSplitNode(
          inputToken,
          trades.map(() => 1 / trades.length)
        )
        const consumers = this.takeOpenSet(outputToken)
        const consumersSplit = this.createSplitNode(
          outputToken,
          consumers.map(() => 1 / consumers.length)
        )
        for (const consumer of consumers) {
          this.forward(consumersSplit, outputToken, consumer)
        }

        const tradeNodes: ActionNode[] = []
        for (const trade of trades) {
          const tradeNode = new ActionNode(
            [[1, inputToken]],
            new SwapPlan(this.universe, [trade]),
            [[1, outputToken]]
          )
          tradeNodes.push(tradeNode)
          this.forward(tradeSplitNode, inputToken, tradeNode)
          this.forward(tradeNode, outputToken, consumersSplit)
        }
        this.splitNodeEdges.set(tradeSplitNode.splitNodeIndex, tradeNodes)
        this.splitNodeTypes.set(
          tradeSplitNode.splitNodeIndex,
          SplitNodeType.Trades
        )
        const current = this.openTokenSet.get(inputToken) ?? []
        current.push(tradeSplitNode)
        this.openTokenSet.set(inputToken, current)
      }
    }
    this.matchBalances()
  }

  public async evaluate(
    inputs: TokenQuantity[] = this.config.userInput,
    mintPrices: Map<Token, Map<Token, number>> = new Map()
  ) {
    const endPerf = this.universe.perf.begin(
      `dag.evaluate`,
      `${[...this.config.inputTokenSet.keys()].join(',')}->${[
        ...this.config.outputTokenSet.keys(),
      ].join(',')}`
    )
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

    const unspent = new TokenAmounts()
    for (const node of sorted) {
      if (evaluating.has(node)) {
        continue
      }
      if (node === this.outputNode) {
        continue
      }
      const deps = this.dependencies.get(node)
      await Promise.all(deps.map((dep) => evaluating.get(dep)))
      const inputTokenAmts = nodeInputs.get(node)

      const inputs = node.inputs.map((i) => inputTokenAmts.get(i[1]))

      if (inputs.length === 0 || inputs.every((i) => i.isZero)) {
        evaluating.set(node, Promise.resolve())
        continue
      }

      const consumers = [...this.edges.get(node).entries()]

      evaluating.set(
        node,
        node.evaluate(ctx, consumers, inputs).then(async (outputResult) => {
          const inputsValues = await Promise.all(
            inputs.map((i) => i.price().then((i) => i.asNumber()))
          )
          const nodeInputValue = inputsValues.reduce((l, r) => l + r, 0)
          if (node instanceof SplitNode) {
            if (
              this.splitNodeTypes.get(node.splitNodeIndex) ===
              SplitNodeType.Trades
            ) {
              await this.findBestTradesSplits(mintPrices, ctx, node, inputs)
            }
          }
          const outputValue = await Promise.all(
            outputResult.map((i) => i[1].price().then((i) => i.asNumber()))
          ).then((i) => i.reduce((l, r) => l + r, 0))

          let price = 0
          if (
            outputResult.length !== 0 &&
            !outputResult[0][1].isZero &&
            node instanceof ActionNode
          ) {
            if (node.actions.is1to1) {
              const out = outputResult[0][1].asNumber()
              if (out !== 0) {
                price = out / inputs[0].asNumber()
              }
            }
          }

          ctx.gasUsed += node.gasEstimate

          if (
            outputResult.length === 0 ||
            outputResult.every((i) => i[1].isZero)
          ) {
            for (const qty of inputs) {
              nodeInputs.get(this.outputNode).add(qty)
            }
          }

          for (const [consumer, qty] of outputResult) {
            nodeInputs.get(consumer).add(qty)
          }

          evaluated.push(
            new EvaluatedNode(
              node,
              inputs,
              nodeInputValue,
              outputValue,
              outputResult,
              price
            )
          )
        })
      )
    }
    await Promise.all(evaluating.values())

    const allUnspent = unspent.toTokenQuantities()
    const pricedUnspent = await Promise.all(
      allUnspent.map(
        async (i) =>
          [i.token, await i.price().then((i) => i.asNumber())] as const
      )
    )

    const unspent_: PricedTokenQuantities = {
      sum: pricedUnspent.reduce((l, r) => l + r[1], 0),
      quantities: allUnspent,
      prices: pricedUnspent.map((i) => i[1]),
    }

    const allOutputs__ = nodeInputs.get(this.outputNode).toTokenQuantities()
    const outputQtys = allOutputs__.filter((i) =>
      this.config.outputTokenSet.has(i.token)
    )
    const dustQtys = allOutputs__.filter(
      (i) => !this.config.outputTokenSet.has(i.token)
    )
    const allOutputs = [...outputQtys, ...dustQtys]
    const pricedAllOutputs = await Promise.all(
      allOutputs.map(
        async (i) =>
          [
            i.token,
            i.amount < 1000n ? 0 : await i.price().then((i) => i.asNumber()),
            i,
          ] as const
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

    endPerf()
    return new EvaluatedDag(
      this,
      evaluated,
      inputs_,
      allOutputs_,
      outputs_,
      dust_,
      unspent_,
      new PricedTokenQuantity(txFee, await txFee.price())
    )
  }

  async findBestTradesSplits(
    mintPrices: Map<Token, Map<Token, number>>,
    ctx: DagEvalContext,
    node: SplitNode,
    [input]: TokenQuantity[]
  ) {
    const previousResultsMap = previousResults.get(node)
    const inputValue = input.asNumber()
    if (inputValue === 0) {
      this.splitNodes[node.splitNodeIndex].fill(0)
      return
    }
    const currentSplits = this.splitNodes[node.splitNodeIndex]
    for (const [inputSize, prev] of previousResultsMap) {
      const ratio = inputValue / inputSize
      if (ratio > 0.95 && ratio < 1.05) {
        const out = await prev
        for (let i = 0; i < out.length; i++) {
          currentSplits[i] = out[i]
        }
        return
      }
    }
    let inputQty = inputValue
    const orderOrMagnitude = Math.floor(Math.log2(inputQty))
    const start = 2 ** orderOrMagnitude
    const end = 2 ** (orderOrMagnitude + 1)
    const range = end - start
    const step = range / RESOLUTION
    const index = Math.floor((inputQty - start) / step)
    const keyInRange = index * step + start
    const prev = previousResultsMap.get(keyInRange)
    if (prev) {
      const out = await prev
      for (let i = 0; i < out.length; i++) {
        currentSplits[i] = out[i]
      }
      return
    }
    previousResultsMap.set(
      keyInRange,
      new Promise(async (resolve) => {
        const calc = async () => {
          // console.log(`Optimising trades for split node index: ${node.splitNodeIndex}`)
          const tradeNodes = this.splitNodeEdges.get(node.splitNodeIndex)
          const edges = this.edges.get(node).get(input.token)

          const tradeIndices = tradeNodes.map((i) => edges.indexOf(i))
          let excessDim = -1
          for (let i = 0; i < edges.length; i++) {
            const edge = edges[i]
            if (!(edge instanceof ActionNode) || !tradeNodes.includes(edge)) {
              excessDim = i
              break
            }
          }
          const actions = tradeNodes.map((i) =>
            unwrapAction(i.actions.steps[0])
          )

          let floorPrice =
            mintPrices.get(input.token)?.get(actions[0].outputToken[0]) ??
            Infinity
          if (floorPrice === 0) {
            floorPrice = Infinity
          }

          const out = await optimiseTrades(
            this.universe,
            input,
            actions,
            floorPrice,
            10
          )
          // console.log(JSON.stringify(out, null, 2))

          if (out.outputs.every((i) => i === 0)) {
            currentSplits.fill(0)
            if (excessDim !== -1) {
              currentSplits[excessDim] = 1
            }
            return
          }
          currentSplits.fill(0)

          if (excessDim !== -1) {
            currentSplits[excessDim] = 0
          }
          if (out.unspent !== 0) {
            if (excessDim === -1) {
              throw new Error(`${node.dotNode()}: No excess dimension found`)
            }
            currentSplits[excessDim] = out.unspent
          }
          for (let i = 0; i < tradeIndices.length; i++) {
            const index = tradeIndices[i]
            const v = out.inputs[i]

            currentSplits[index] = v
          }
          normalizeVector(currentSplits)
          if (currentSplits.some((i) => isNaN(i))) {
            throw new Error(`${node.dotNode()}: NaN splits`)
          }
        }
        try {
          await calc()
        } finally {
          resolve([...currentSplits])
        }
      })
    )

    await previousResultsMap.get(keyInRange)!
  }

  private async derivative(
    clones: { dag: DagBuilder; splitIndex: number; dim: number }[],
    currentValue: number,
    objectiveFn: ObjectiveFunction,
    derivative: number[][],
    eps: number
  ) {
    let globalMagnitude = 0

    await Promise.all(
      clones.map(async (i) => {
        copyVectors(this.splitNodes, i.dag.splitNodes)
        i.dag.splitNodes[i.splitIndex][i.dim] += eps
        normalizeVector(i.dag.splitNodes[i.splitIndex])
        const newValue = objectiveFn(await i.dag.evaluate())
        if (!isFinite(newValue)) {
          derivative[i.splitIndex][i.dim] = 0
          return
        }
        let dimensionGradient = (newValue - currentValue) / eps
        globalMagnitude += dimensionGradient ** 2
        if (isNaN(dimensionGradient) || !isFinite(dimensionGradient)) {
          dimensionGradient = 0
        }

        derivative[i.splitIndex][i.dim] = dimensionGradient
      })
    )
    globalMagnitude = Math.sqrt(globalMagnitude)

    for (let i = 0; i < derivative.length; i++) {
      for (let j = 0; j < derivative[i].length; j++) {
        derivative[i][j] = derivative[i][j] / globalMagnitude
      }
    }
    return globalMagnitude
  }

  public get dustCanBeOptimised() {
    return this.splitNodes.length > 0
  }

  public mergeActionNodes(_: SplitNode, mergeableNodes: ActionNode[]) {
    // Merge all the nodes in the parent
    for (let i = 1; i < mergeableNodes.length; i++) {
      this.removeNode(mergeableNodes[i])
    }
  }
  public simplify() {
    if (!this.isDagConstructed) {
      throw new Error('Cannot simplify DAG, DAG is not constructed')
    }
    const balanceNodes: BalanceNode[] = []

    // Step 1: Remove all balance nodes
    for (const node of this.edges.keys()) {
      if (node instanceof BalanceNode) {
        balanceNodes.push(node)
      }
    }
    for (const node of balanceNodes) {
      this.removeNode(node)
    }

    while (true) {
      const mergableSplitNodes: { parent: SplitNode; child: SplitNode }[] = []
      for (const childSplitNode of this.edges.keys()) {
        if (childSplitNode instanceof SplitNode) {
          if (
            this.splitNodeTypes.get(childSplitNode.splitNodeIndex) !==
            SplitNodeType.Standard
          ) {
            continue
          }
          const parentSplitNodes = this.dependencies
            .get(childSplitNode)
            .filter((i) => i instanceof SplitNode)
          if (parentSplitNodes.length === 0) {
            continue
          }

          if (
            this.splitNodeTypes.get(
              (parentSplitNodes[0] as SplitNode).splitNodeIndex
            ) !== SplitNodeType.Standard
          ) {
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
          if (!consumer.actions.is1to1) {
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
        break
      }
    }
    this.removeUselessSplits()
  }
  public removeUselessNodes() {
    const uselessNodes = new Set<DagNode>()
    for (const [node, outGoing] of this.edges.entries()) {
      if (node === this.outputNode || node === this.startNode) {
        continue
      }
      if (!(node instanceof SplitNode)) {
        let numEdges = 0
        for (const edges of outGoing.values()) {
          numEdges += edges.length
        }
        if (numEdges === 0) {
          uselessNodes.add(node)
          const parents = this.dependencies.get(node)
          for (const parent of parents) {
            for (const token of outGoing.keys()) {
              this.unforward(parent, token, node)
            }
          }
          outGoing.clear()
        }
      }
    }
    for (const node of uselessNodes) {
      this.removeNode(node)
    }
  }
  public removeUselessSplits() {
    const uselessSplits = new Set<SplitNode>()
    this.removeUselessNodes()
    for (const [node, outGoing] of this.edges.entries()) {
      if (!(node instanceof SplitNode)) {
        continue
      }
      const edges = outGoing.get(node.inputToken)
      const edgesSet = new Set(edges.filter((i) => i !== node))

      if (edgesSet.size === edges.length) {
        if (edgesSet.size === 1) {
          uselessSplits.add(node)
        }
        continue
      }
      const dedupped = [...edgesSet]
      this.edges.get(node).set(node.inputToken, dedupped)
      const splits = dedupped.map(() => 1 / dedupped.length)
      this.splitNodes[node.splitNodeIndex] = splits

      if (splits.length <= 1) {
        uselessSplits.add(node)
      }
    }

    for (const split of uselessSplits) {
      this.removeNode(split)
    }

    this.removeUselessNodes()
  }

  public removeDependency(parent: DagNode, child: DagNode) {
    if (!this.dependencies.has(child)) {
      return
    }

    const childDependencies = this.dependencies.get(child)
    this.dependencies.set(
      child,
      childDependencies.filter((i) => i !== parent)
    )

    if (parent instanceof SplitNode) {
      const parentOutEdges = this.edges.get(parent).get(parent.inputToken)
      const depIndex = parentOutEdges.indexOf(child)
      this.edges.get(parent).set(
        parent.inputToken,
        parentOutEdges.filter((i) => i !== parent)
      )
      this.splitNodes[parent.splitNodeIndex] = this.splitNodes[
        parent.splitNodeIndex
      ].filter((_, i) => i !== depIndex)
      normalizeVector(this.splitNodes[parent.splitNodeIndex])
    }
  }
  public unforward(parent: DagNode, token: Token, child: DagNode) {
    this.removeDependency(parent, child)

    const edges = this.edges.get(parent)
    edges.set(
      token,
      edges.get(token).filter((i) => i !== child)
    )
  }

  // Removes a node from the DAG.
  // If the node changes the token, the edge is deleted.
  // If the node is a split or balance node, the edge is forwarded to the consumer
  public removeNode(node: DagNode) {
    if (node === this.outputNode || node === this.startNode) {
      return
    }
    const edges = this.edges.get(node)

    if (edges.size !== 1) {
      throw new Error('Cannot remove node, it forwards multiple tokens')
    }
    const nodeDependencies = this.dependencies.get(node)

    if (node.inputs.length !== 1 || node.outputs.length !== 1) {
      throw new Error('Cannot remove node, it has multiple inputs')
    }
    const tokenIn = node.inputs[0][1]
    const tokenOut = node.outputs[0][1]
    const consumers = edges.get(tokenOut)
    if (consumers.length !== 1) {
      throw new Error('Cannot remove node, it has multiple consumers')
    }
    const consumer = consumers[0]
    this.removeDependency(node, consumer)
    if (node instanceof SplitNode) {
      this.splitNodes[node.splitNodeIndex] = []
    }
    const shouldKeepEdge = tokenIn === tokenOut

    for (const parent of nodeDependencies) {
      this.unforward(parent, tokenIn, node)
    }
    if (shouldKeepEdge) {
      for (const parent of nodeDependencies) {
        this.forward(parent, tokenIn, consumer)
        if (parent instanceof SplitNode) {
          const newConsumers = this.edges.get(parent).get(parent.inputToken)
          if (
            newConsumers.length !==
            this.splitNodes[parent.splitNodeIndex].length
          ) {
            this.splitNodes[parent.splitNodeIndex] = newConsumers.map(
              () => 1 / newConsumers.length
            )
          }
        }
      }
    }

    this.edges.delete(node)
    this.dependencies.delete(node)
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
    this.edges.get(parent).set(
      parent.inputToken,
      parentEdges.filter((i) => i !== child)
    )
    this.splitNodes[parent.splitNodeIndex] = parentSplits.filter(
      (_, i) => i !== childIndex
    )

    const childEdges = this.edges.get(child).get(child.inputToken)
    for (const edge of childEdges) {
      this.edges.get(parent).get(parent.inputToken).push(edge)
      this.dependencies.set(
        edge,
        this.dependencies.get(edge)!.map((i) => (i === child ? parent : i))
      )
    }
    const childSplits = this.splitNodes[child.splitNodeIndex]
    this.splitNodes[child.splitNodeIndex] = []
    this.splitNodes[parent.splitNodeIndex].push(...childSplits)
    normalizeVector(this.splitNodes[parent.splitNodeIndex])
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
      const parentSplits = this.splitNodes[parent.splitNodeIndex]
      this.splitNodes[parent.splitNodeIndex] = parentSplits.map(
        () => 1 / parentSplits.length
      )
    }

    for (const edge of this.edges.keys()) {
      if (edge instanceof SplitNode) {
        const splits = this.splitNodes[edge.splitNodeIndex]
        if (
          !(
            splits.some((i) => isNaN(i) || !isFinite(i) || i < 0 || i > 1) ||
            splits.reduce((a, b) => a + b, 0) !== 0
          )
        ) {
          continue
        }
        for (let i = 0; i < splits.length; i++) {
          splits[i] = 1 / splits.length
        }
      }
    }
  }

  async optimiseDag(opts: {
    iterations: number
    objectiveFn: ObjectiveFunction
    learningRate: (iteration: number) => number
    epsilon: number
    resetOnWorse: number
    mintPrices?: Map<Token, Map<Token, number>>
  }) {
    if (opts.mintPrices) {
      const mintPrices = opts.mintPrices

      const eth = this.universe.nativeToken
      const weth = this.universe.wrappedNativeToken

      const wethPrices = mintPrices.get(weth) ?? new Map()
      const ethPrices = mintPrices.get(eth) ?? new Map()
      opts.mintPrices.set(eth, wethPrices)
      wethPrices.set(eth, 1)
      ethPrices.set(weth, 1)
      mintPrices.set(weth, wethPrices)
      if (mintPrices.has(eth)) {
        for (const [tokenOut, price] of ethPrices.entries()) {
          const current = wethPrices.get(tokenOut)
          if (current == null || current === 0) {
            wethPrices.set(tokenOut, price)
          }
        }
      }
      for (const [tokenIn, edges] of opts.mintPrices.entries()) {
        for (const [tokenOut, price] of edges.entries()) {
          if (tokenIn === tokenOut) {
            opts.mintPrices.delete(tokenIn)
            continue
          }
          console.log(
            `floorprice: ${tokenIn.symbol} => ${tokenOut.symbol}: ${price}`
          )
        }
      }
    }
    const mintPrices = opts.mintPrices ?? new Map()

    if (!this.isDagConstructed) {
      throw new Error('Cannot optimise DAG, DAG is not constructed')
    }
    const copies: { dag: DagBuilder; splitIndex: number; dim: number }[] = []
    let splitNodes = 0
    for (let i = 0; i < this.splitNodes.length; i++) {
      if (this.splitNodes[i].length === 0) {
        continue
      }
      if (this.splitNodeTypes.get(i) !== SplitNodeType.Standard) {
        continue
      }
      splitNodes += 1
      // console.log(`Optimising split node index: ${i}`)
      for (let j = 0; j < this.splitNodes[i].length; j++) {
        const dag = this.clone()
        copies.push({ dag, splitIndex: i, dim: j })
      }
    }

    // console.log(
    //   `Optimising ${splitNodes} nodes with ${copies.length} total variables`
    // )

    let output = await this.evaluate(this.config.userInput, mintPrices)
    const initialOutput = output

    let currentObjectiveValue = opts.objectiveFn(initialOutput)
    if (isNaN(currentObjectiveValue)) {
      throw new Error('Initial value is NaN')
    }
    if (!isFinite(currentObjectiveValue)) {
      return initialOutput
    }

    let derivative = this.splitNodes.map((vect) => vect.map(() => 0))

    let bestSoFar = {
      output: 0,
      out: output,
    }

    let bestSoFarObjective = {
      output: currentObjectiveValue,
      out: output,
    }

    let worseCount = 0

    for (let iteration = 0; iteration < opts.iterations; iteration++) {
      const mag = await this.derivative(
        copies,
        currentObjectiveValue,
        opts.objectiveFn,
        derivative,
        opts.epsilon
      )

      if (mag === 0) {
        copyVectors(bestSoFarObjective.out.dag.splitNodes, this.splitNodes)
        currentObjectiveValue = bestSoFarObjective.output
        worseCount = 0
        continue
      }

      let learningRate = opts.learningRate(iteration)

      for (let step = 0; step < 20; step++) {
        for (let i = 0; i < this.splitNodes.length; i++) {
          if (
            this.splitNodes[i].length <= 0 &&
            this.splitNodeTypes.get(i) !== SplitNodeType.Standard
          ) {
            continue
          }
          const direction = derivative[i]
          if (direction.some((i) => isNaN(i))) {
            direction.fill(0)
            continue
          }
          for (let j = 0; j < direction.length; j++) {
            this.splitNodes[i][j] += direction[j] * learningRate
          }
          normalizeVector(this.splitNodes[i])
        }
        learningRate *= 0.9
        const newOut = await this.evaluate(this.config.userInput, mintPrices)

        const newObjValue = opts.objectiveFn(newOut)

        const worseResult = newObjValue < currentObjectiveValue
        if (newObjValue > bestSoFarObjective.output) {
          bestSoFarObjective = {
            output: currentObjectiveValue,
            out: newOut.clone(),
          }
          worseCount = 0
        }
        if (newOut.outputsValue > bestSoFar.output) {
          console.log(
            `iteration ${iteration}: output=${newOut.outputs.join(
              ', '
            )}, dust=${newOut.dust.join(
              ', '
            )}, txFee=$ ${newOut.txFee.price.asNumber()}`
          )
          bestSoFar = {
            output: newOut.outputsValue,
            out: newOut.clone(),
          }
        }

        output = newOut
        currentObjectiveValue = newObjValue

        if (worseResult) {
          worseCount += 1
          break
        }
      }

      if (worseCount > opts.resetOnWorse) {
        copyVectors(bestSoFarObjective.out.dag.splitNodes, this.splitNodes)
        currentObjectiveValue = bestSoFarObjective.output
        worseCount = 0
      }
    }
    copyVectors(bestSoFar.out.dag.splitNodes, this.splitNodes)

    return bestSoFar.out.clone()
  }
}

export const isActionNode = (node: DagNode): node is ActionNode => {
  return node instanceof ActionNode
}
