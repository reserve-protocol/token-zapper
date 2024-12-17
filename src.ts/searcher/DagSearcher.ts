import winston from 'winston'
import { BaseAction } from '../action/Action'
import { Address } from '../base/Address'
import { DefaultMap } from '../base/DefaultMap'
import { Token, TokenQuantity } from '../entities/Token'
import { Universe } from '../Universe'
import { DagBuilder } from './DagBuilder'
import { ActionNode, BalanceNode, DagBuilderConfig } from './Dag'
import { SingleSwap, SwapPlan } from './Swap'
import {
  MultiStepAction,
  NativeInputWrapper,
  unwrapAction,
  WrappedAction,
} from './TradeAction'
import { bfs } from '../exchange-graph/BFS'
import { constructToken } from '@paraswap/sdk'

const LONGEST_TUNNEL_DEPTH = 3

const wrapAction = (universe: Universe, i: BaseAction) => {
  let act = i
  if (act.is1to1 && act.inputToken[0] === universe.nativeToken) {
    act = new NativeInputWrapper(universe, act)
  }
  if (act.dependsOnRpc) {
    act = new WrappedAction(universe, act)
  }
  return act
}
const findUnderlyingTokens = async (
  universe: Universe,
  inputTradeSizeUSD: number,
  tokens: Token[]
) => {
  const allUnderlyingTokens = new Set<Token>()
  let numberOfLevels = 0
  const mintPrices = new DefaultMap<Token, DefaultMap<Token, number>>(
    () => new DefaultMap((t) => 0)
  )

  const level = new DefaultMap<Token, number[]>(() => [])
  const tokensToExplore = tokens.map((t) => {
    return {
      token: t,
      depth: 0,
    }
  })

  while (tokensToExplore.length !== 0) {
    const node = tokensToExplore.pop()!
    const { token: outputToken, depth } = node
    numberOfLevels = Math.max(numberOfLevels, depth + 1)
    level.get(outputToken).push(depth)

    const graphActions = [
      ...universe.graph.vertices.get(outputToken).incomingEdges.values(),
    ]
      .flat()
      .filter((i) => {
        if (i.isTrade) {
          return false
        }
        return false
      })

    const mintAction = universe.getMintAction(outputToken) ?? graphActions[0]

    if (mintAction == null) {
      continue
    }

    if (universe.mintableTokens.has(outputToken)) {
      const txFeeUSD = (
        await universe.nativeToken
          .from(universe.gasPrice * mintAction.gasEstimate())
          .price()
      ).asNumber()
      const rate = await universe.mintRate.get(outputToken) // Rate is exact midprice
      const inputTokenPriceUSD = (await rate.token.price).asNumber()
      const mintInoutQty = (inputTradeSizeUSD + txFeeUSD) / inputTokenPriceUSD
      const mintOutputQty =
        (inputTradeSizeUSD / inputTokenPriceUSD) * rate.asNumber()
      const mintPrice = mintOutputQty / mintInoutQty

      const inputToken = rate.token
      const out = Math.max(
        mintPrice,
        mintPrices.get(inputToken).get(outputToken)
      )
      // console.log(`${inputToken} -> ${outputToken}: ${out}`)
      if (out === 0) {
        mintPrices.get(inputToken).delete(outputToken)
      } else {
        mintPrices.get(inputToken).set(outputToken, out)
      }
    }
    tokensToExplore.push(
      ...mintAction.inputToken.map((token) => ({
        token,
        depth: depth + 1,
      }))
    )
  }
  const byPhase: Token[][] = [...new Array(numberOfLevels + 1)].map(() => [])
  for (let [token, levels] of level.entries()) {
    if (levels.length === 0) {
      continue
    }
    levels = [...new Set(levels)]
    levels.sort((l, r) => r - l)
    const lvl = levels[0]
    byPhase[lvl].push(token)
  }

  const wrappedNativeEdges = mintPrices.get(universe.wrappedNativeToken)
  const nativeTokenEdges = mintPrices.get(universe.nativeToken)
  for (const [tokenOut, price] of wrappedNativeEdges.entries()) {
    if (!nativeTokenEdges.has(tokenOut)) {
      nativeTokenEdges.set(tokenOut, price)
    }
  }
  for (const [tokenOut, price] of nativeTokenEdges.entries()) {
    if (!wrappedNativeEdges.has(tokenOut)) {
      wrappedNativeEdges.set(tokenOut, price)
    }
  }

  return {
    byPhase: byPhase.filter((i) => i.length > 0),
    mintPrices,
    underlyingTokens: allUnderlyingTokens,
  }
}

const DEFAULT_TUNNEL_OPTS = {
  dontExplorePaths: new Set<Token>(),
}

type TunnelOpts = Partial<typeof DEFAULT_TUNNEL_OPTS>

const findTradePaths = async (
  universe: Universe,
  addrsInUse: Set<Address>,
  qty: TokenQuantity,
  to: Token,
  opts: TunnelOpts = DEFAULT_TUNNEL_OPTS
) => {
  let paths = (
    await Promise.all(
      bfs(universe, universe.graph, qty.token, to, LONGEST_TUNNEL_DEPTH)
        .steps.map((i) => i.convertToSingularPaths())
        .flat()
        .filter(
          (i) =>
            i.steps.every((i) => {
              if (!i.is1to1) {
                return false
              }
              if (opts.dontExplorePaths == null) {
                return true
              }
              return !opts.dontExplorePaths.has(i.outputToken[0])
            }) && i.addresesInUse.every((i) => !addrsInUse.has(i))
        )
        .map((i) => i.quote([qty]).catch(() => null))
    )
  ).filter((i) => i !== null)

  const shortestPath = Math.min(...paths.map((i) => i.steps.length))
  paths = paths.filter((i) => i.steps.length === shortestPath)
  paths.sort((l, r) => r.outputValue.asNumber() - l.outputValue.asNumber())
  if (paths.length === 0) {
    throw new Error(
      `Failed to find any trade paths from ${
        qty.token
      } to ${to}, don't explore paths=${[...(opts.dontExplorePaths ?? [])].join(
        ', '
      )}`
    )
  }

  const fromToken = new DefaultMap<Token, DefaultMap<Token, BaseAction[]>>(
    () => new DefaultMap<Token, BaseAction[]>(() => [])
  )
  for (const path of paths) {
    for (const step of path.steps) {
      fromToken
        .get(step.inputs[0].token)
        .get(step.outputs[0].token)
        .push(step.action)
    }
  }

  const bestPath = paths[0]
  const out: BaseAction[][] = []
  for (let s = 0; s < bestPath.steps.length; s++) {
    const tokenIn = bestPath.steps[s].inputs[0].token
    const tokenOut = bestPath.steps[s].outputs[0].token
    const actions = fromToken.get(tokenIn).get(tokenOut)
    const actionsArray: BaseAction[] = []
    for (const action of actions) {
      for (const addr of action.addressesInUse) {
        if (addrsInUse.has(addr)) {
          continue
        }
        actionsArray.push(action)
        addrsInUse.add(addr)
      }
    }
    if (actionsArray.length === 0) {
      console.log(`Addreses in use: ${[...addrsInUse].join(', ')}`)
      console.log(
        `Don't explore paths: ${[...(opts.dontExplorePaths ?? [])].join(', ')}`
      )
      throw new Error(`No actions found: from=${qty.token} to=${to}`)
    }
    out.push(actionsArray)
  }
  return out
}

const tradeUserInput = async (
  universe: Universe,
  addrsInUse: Set<Address>,
  dag: DagBuilder,
  qty: TokenQuantity,
  to: Token,
  opts: TunnelOpts = DEFAULT_TUNNEL_OPTS
) => {
  const steps = await findTradePaths(universe, addrsInUse, qty, to, opts)
  for (const step of steps) {
    dag.tradeUserInputFor(
      step,
      step[0].inputToken[0],
      step[0].outputToken[0],
      true
    )
  }
}

export class DagSearcher {
  private readonly logger: winston.Logger
  constructor(public readonly universe: Universe) {
    this.logger = this.universe.logger.child({
      name: 'dag-builder',
      phase: 'searching',
    })
  }

  public async buildZapOutDag(
    signer: Address,
    userInput: TokenQuantity,
    userOutput: Token
  ) {
    const logger = this.logger.child({
      input: userInput.token.toString(),
      output: userOutput.toString(),
    })

    const dag = await DagBuilder.create(
      this.universe,
      new DagBuilderConfig(
        this.universe,
        logger,
        [userInput],
        [1],
        [userOutput.one],
        [1]
      )
    )
    const weth = this.universe.wrappedNativeToken
    const eth = this.universe.nativeToken
    const current = [userInput.token]
    const unwrappedTokens = new Set<Token>()
    const inputValue = (await userInput.price()).asNumber()
    while (current.length !== 0) {
      let token = current.pop()!
      if (userOutput === token) {
        continue
      }
      if (token === weth) {
        unwrappedTokens.add(eth)
        continue
      }
      const burnAction = this.universe.wrappedTokens.get(token)?.burn
      if (burnAction == null) {
        unwrappedTokens.add(token === eth ? weth : token)
        continue
      }
      current.push(...burnAction.outputToken)
      dag.unwrapInput(wrapAction(this.universe, burnAction))
    }
    dag.debugToDot()

    for (const balanceTips of dag.balanceNodeTip.keys()) {
      unwrappedTokens.add(balanceTips)
    }

    const computeSellDirectly = async (dag: DagBuilder) => {
      const addrsInUse = new Set<Address>()
      for (const token of unwrappedTokens) {
        if (token === userOutput) {
          continue
        }

        const tokenPrice = (await token.price).asNumber()
        const inputQty = token.from(inputValue / tokenPrice)

        await tradeUserInput(
          this.universe,
          addrsInUse,
          dag,
          inputQty,
          userOutput
        )
      }

      dag.closeOpenSet()
      dag.simplify()

      for (const node of dag.edges.keys()) {
        if (node instanceof ActionNode) {
          node.actions.steps[0] = unwrapAction(node.actions.steps[0])
        }
      }

      const out = await dag.evaluate()

      return await out.dag.evaluate()
    }

    const computeSellIndirectly = async (dag: DagBuilder, midToken: Token) => {
      const addrsInUse = new Set<Address>()
      let midTokenQty = midToken.from(0)
      const midTokenPrice = (await midToken.price).asNumber()

      if (!dag.balanceNodeTip.has(midToken)) {
        dag.balanceNodeTip.set(midToken, new BalanceNode(midToken))
      }

      for (const token of unwrappedTokens) {
        if (token === userOutput) {
          continue
        }

        const tokenPrice = (await token.price).asNumber()
        const inputQty = token.from(inputValue / tokenPrice)

        await tradeUserInput(this.universe, addrsInUse, dag, inputQty, midToken)

        const outTokenQty = midToken.from(inputValue / midTokenPrice)

        midTokenQty = midTokenQty.add(outTokenQty)
      }
      await tradeUserInput(
        this.universe,
        addrsInUse,
        dag,
        midTokenQty,
        userOutput
      )

      dag.closeOpenSet()
      dag.simplify()

      for (const node of dag.edges.keys()) {
        if (node instanceof ActionNode) {
          node.actions.steps[0] = unwrapAction(node.actions.steps[0])
        }
      }

      const out = await dag.evaluate()

      return await out.dag.evaluate()
    }

    const caseSellDirectly = dag.clone()
    const caseSellIndirectly = dag.clone()
    const midToken = await this.universe.tokenClass.get(userInput.token)
    if (midToken === userOutput) {
      return await computeSellDirectly(caseSellDirectly)
    }
    const [a, b] = await Promise.all([
      computeSellDirectly(caseSellDirectly).catch(() => null),
      computeSellIndirectly(caseSellIndirectly, midToken).catch(() => null),
    ])

    if (a == null) {
      return b!
    }
    if (b == null) {
      return a!
    }

    return a.outputsValue > b.outputsValue ? a! : b!
  }

  public async buildZapInDag(
    signer: Address,
    userInput: TokenQuantity[],
    userOutput: Token
  ) {
    userInput = userInput.map((i) =>
      i.token === this.universe.nativeToken
        ? i.into(this.universe.wrappedNativeToken)
        : i
    )
    const inputSet = new Set(userInput.map((i) => i.token))

    const timer = this.universe.perf.begin(
      'dag-builder',
      `${userInput.map((i) => i.token).join(',')} -> ${userOutput}`
    )
    const logger = this.logger.child({
      input: `${userInput.map((i) => i.token).join(',')}`,
      output: userOutput.toString(),
    })

    await this.universe.initialized
    const eth = this.universe.nativeToken
    const weth = this.universe.wrappedNativeToken
    const inputs = userInput
      .map((i) => i.token)
      .map((i) => (i === eth ? weth : i))
    if (inputs.includes(weth)) {
      inputs.push(this.universe.nativeToken)
    }

    const inputPrices = await Promise.all(userInput.map((i) => i.price()))
    const inputPriceSum = inputPrices.reduce((a, b) => a + b.asNumber(), 0)

    // console.log('inputPriceSum', inputPriceSum)

    const { byPhase, mintPrices } = await findUnderlyingTokens(
      this.universe,
      inputPriceSum,
      [userOutput]
    )

    for (let phaseId = 0; phaseId < byPhase.length; phaseId++) {
      const phase = byPhase[phaseId]
      console.log(`${phaseId}: ${phase.join(', ')}`)
    }

    for (const [_, edges] of mintPrices.entries()) {
      for (const [tokenOut, price] of edges.entries()) {
        for (const [tokenOutRate, rate] of mintPrices.get(tokenOut).entries()) {
          if (!edges.has(tokenOutRate)) {
            edges.set(tokenOutRate, price * rate)
          }
        }
      }
    }

    const dag = await DagBuilder.create(
      this.universe,
      new DagBuilderConfig(
        this.universe,
        logger,
        userInput.map((i) => (i.token === eth ? i.into(weth) : i)),
        [1],
        [userOutput.one],
        [1]
      )
    )

    const addrsUsed = new Set<Address>()
    const addrsUsedTrade = new Set<Address>()

    const tradeActions = new Set<BaseAction>()
    const underlyingTokens = new Set(byPhase.flat())

    let outputTokenClass = await this.universe.tokenClass.get(userOutput)
    if (outputTokenClass === userOutput) {
      outputTokenClass =
        this.universe.preferredToken.get(userOutput) ?? userOutput
      underlyingTokens.delete(outputTokenClass)
    }
    const outputUnderlying = await this.universe.underlyingToken.get(userOutput)

    const outputTokenPrice = (await outputTokenClass.price).asNumber()

    for (let i = 0; i < userInput.length; i++) {
      const input = userInput[i]
      if (outputTokenClass === userOutput) {
        continue
      }
      if (input.token === weth && outputTokenClass === eth) {
        continue
      }
      const inputUnderyling = await this.universe.underlyingToken.get(
        input.token
      )

      if (
        inputUnderyling === outputUnderlying ||
        input.token === outputTokenClass ||
        input.token === outputUnderlying
      ) {
        continue
      }

      const userInputValue = (await input.price()).asNumber()

      console.log(
        `Will find a trade from ${input} -> ${outputTokenClass}, ignore underlyingTokens: ${[
          ...underlyingTokens,
        ].join(', ')}`
      )
      await tradeUserInput(
        this.universe,
        addrsUsed,
        dag,
        input,
        outputTokenClass,
        {
          dontExplorePaths: underlyingTokens,
        }
      )
      const expectedOutputSize = userInputValue / outputTokenPrice
      dag.config.inputTokenSet.delete(userInput[i].token)
      dag.config.inputTokenSet.add(outputTokenClass)

      userInput[i] = outputTokenClass.from(expectedOutputSize)
      dag.balanceNodeTip.delete(input.token)
    }

    const tradesUsed = new Set([...addrsUsed])

    const wethDeposit = this.universe.getMintAction(weth)!
    for (let i = 0; i < byPhase.length; i++) {
      dag.matchBalances()
      if (dag.isDagConstructed) {
        break
      }
      const phase = byPhase[i].filter((i) => !inputs.includes(i))
      const nextPhase = (byPhase[i + 1] ?? []).concat(inputs)

      const actions = new Set<BaseAction>()
      const mintActions = new DefaultMap<
        Token,
        DefaultMap<Token, BaseAction[]>
      >(() => new DefaultMap<Token, BaseAction[]>(() => []))
      const checkIfAddrUsed = (edge: BaseAction, addrs: Set<Address>) => {
        if (edge.oneUsePrZap) {
          for (const addr of edge.addressesInUse) {
            if (addrs.has(addr)) {
              return true
            }
          }
        }
        return false
      }
      const addMainEdge = (edge: BaseAction) => {
        if (edge === wethDeposit) {
          return
        }
        if (inputs.includes(edge.outputToken[0])) {
          return
        }
        if (checkIfAddrUsed(edge, addrsUsed)) {
          return
        }
        actions.add(edge)
        if (edge.is1to1) {
          mintActions
            .get(edge.inputToken[0])
            .get(edge.outputToken[0])
            .push(edge)
        }
        for (const addr of edge.addressesInUse) {
          addrsUsed.add(addr)
        }
      }
      const addTradeEdge = async (edge: BaseAction) => {
        if (inputs.includes(edge.outputToken[0])) {
          return
        }
        if (checkIfAddrUsed(edge, addrsUsed)) {
          return
        }
        if (checkIfAddrUsed(edge, addrsUsedTrade)) {
          return
        }
        const tokenIn = edge.inputToken[0]
        const tokenOut = edge.outputToken[0]
        const mintPrice = mintPrices.get(tokenIn).get(tokenOut)

        if (mintPrice !== 0) {
          const midPrice = (await this.universe.midPrices.get(edge)).asNumber()
          if (midPrice / mintPrice < 0.998) {
            return
          }
        } else {
          try {
            const liq = await edge.liquidity()
            if (liq < inputPriceSum / 10) {
              return
            }
            const inputTokenPrice = (await edge.inputToken[0].price).asNumber()
            const mid =
              inputTokenPrice /
              (await this.universe.midPrices.get(edge)).asNumber()
            const outputTokenPrice = (
              await edge.outputToken[0].price
            ).asNumber()

            const outputValue = inputTokenPrice * mid

            if (outputValue / outputTokenPrice < 0.998) {
              return
            }
          } catch (e) {
            return
          }
        }

        tradeActions.add(edge)

        for (const addr of edge.addressesInUse) {
          addrsUsedTrade.add(addr)
          addrsUsed.add(addr)
        }
      }

      const phaseTokens = new Set([...phase, ...dag.openTokens])
      console.log(`user input=${userInput.join(', ')}`)

      for (const token of phaseTokens) {
        let addedEdge = false
        const vertex = this.universe.graph.vertices.get(token)
        const mintEdge = this.universe.getMintAction(token)
        if (mintEdge != null) {
          addMainEdge(mintEdge)
          addedEdge = true
        } else {
          for (const inputQty of userInput) {
            if (inputQty.token === token) {
              continue
            }
            const edges = this.universe.graph.graph
              .get(inputQty.token)
              .get(token)
            for (const edge of edges) {
              if (edge.isTrade) {
                continue
              }
              addedEdge = true
              addMainEdge(edge)
            }
          }
        }
        for (const [_, edges] of vertex.incomingEdges.entries()) {
          for (const edge of edges) {
            if (!edge.is1to1 || !edge.isTrade) {
              continue
            }

            if (!edge.inputToken.every((t) => nextPhase.includes(t))) {
              continue
            }
            addedEdge = true
            await addTradeEdge(edge)
          }
        }
        if (addedEdge) {
          continue
        }

        // Explore a 2-step path

        for (const inputQty of userInput) {
          const path = bfs(
            this.universe,
            this.universe.graph,
            inputQty.token,
            token,
            2
          )
          const possiblePlans = path.steps
            .map((i) => i.convertToSingularPaths())
            .flat()

          const paths = await Promise.all(
            possiblePlans.map(async (plan) => plan.quote([inputQty]))
          )
          paths.sort((r, l) => l.compare(r))

          for (let i = 0; i < paths.length; i++) {
            const path = paths[i]
            const plan = path.swapPlan
            if (!plan.addresesInUse.every((i) => !addrsUsed.has(i))) {
              continue
            }
            for (const addr of plan.addresesInUse) {
              addrsUsed.add(addr)
            }
            const wrappedAct = new MultiStepAction(
              this.universe,
              plan.steps.map((i) => wrapAction(this.universe, i))
            )
            tradeActions.add(wrappedAct)
          }
        }
      }
      const openSet = new Set(dag.openTokens)

      for (const act of actions) {
        for (const tok of act.outputToken) {
          openSet.delete(tok)
        }
      }

      const remainingOpenSet = [...openSet]

      for (const tok of remainingOpenSet) {
        const trades: BaseAction[] = []
        for (const act of [...tradeActions]) {
          if (
            dag.config.inputTokenSet.has(act.inputToken[0]) &&
            act.outputToken[0] === tok
          ) {
            trades.push(wrapAction(this.universe, act))
            tradeActions.delete(act)
          }
        }

        if (trades.length !== 0) {
          openSet.delete(tok)
          await dag.splitTradeInputIntoNewOutput(trades)
        }
      }

      if (openSet.size !== 0) {
        for (const inp of userInput) {
          for (const out of openSet) {
            console.log(
              `Will find a trade from ${inp} -> ${out} dontExplorePaths: ${[
                ...inputSet,
              ].join(', ')} addrsInUse=${[...addrsUsed].join(', ')}`
            )
            const paths = await findTradePaths(
              this.universe,
              tradesUsed,
              inp,
              out,
              {
                dontExplorePaths: inputSet,
              }
            )
            for (const trades of paths) {
              await dag.splitTradeInputIntoNewOutput(trades)
            }
          }
        }
      }

      const actionsArray = [...actions]
      const allActions = actionsArray
      allActions.sort((l, r) => {
        for (
          let i = 0;
          i < Math.min(l.inputToken.length, r.inputToken.length);
          i++
        ) {
          if (l.inputToken[i] !== r.inputToken[i]) {
            return l.inputToken[i].address.gt(r.inputToken[i].address) ? 1 : -1
          }
        }
        return 0
      })

      const toSwapPlan = (i: BaseAction) => {
        return new SwapPlan(this.universe, [wrapAction(this.universe, i)])
      }
      await dag.replaceOpenSet(allActions.map(toSwapPlan))
    }
    dag.matchBalances()

    if (!dag.isDagConstructed) {
      throw new Error('Dag not constructed')
    }

    for (const [tokenIn, edges] of mintPrices.entries()) {
      for (const [tokenOut, price] of edges.entries()) {
        if (price === 0) {
          edges.delete(tokenOut)
          continue
        }
        mintPrices.get(tokenIn).set(tokenOut, price)
      }
    }

    const out = await dag.finalize(
      mintPrices,
      [...tradeActions].map((i) => wrapAction(this.universe, i))
    )
    return out
  }
}
