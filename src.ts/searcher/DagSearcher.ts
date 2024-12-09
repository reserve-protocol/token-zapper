import winston from 'winston'
import { BaseAction } from '../action/Action'
import { Address } from '../base/Address'
import { DefaultMap } from '../base/DefaultMap'
import { Token, TokenQuantity } from '../entities/Token'
import { Universe } from '../Universe'
import { DagBuilder } from './DagBuilder'
import { DagBuilderConfig } from './Dag'
import { SwapPlan } from './Swap'
import {
  MultiStepAction,
  NativeInputWrapper,
  WrappedAction,
} from './TradeAction'
import { bfs } from '../exchange-graph/BFS'

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

export class DagSearcher {
  private readonly logger: winston.Logger
  constructor(public readonly universe: Universe) {
    this.logger = this.universe.logger.child({
      name: 'dag-builder',
      phase: 'searching',
    })
  }

  public async buildDag(
    signer: Address,
    userInput: TokenQuantity[],
    userOutput: Token
  ) {
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

    for (const [_, edges] of mintPrices.entries()) {
      for (const [tokenOut, price] of edges.entries()) {
        for (const [tokenOutRate, rate] of mintPrices.get(tokenOut).entries()) {
          if (!edges.has(tokenOutRate)) {
            edges.set(tokenOutRate, price * rate)
          }
        }
      }
    }
    // for (const [tokenIn, edges] of mintPrices.entries()) {
    //   for (const [tokenOut, price] of edges.entries()) {
    //     console.log(`${tokenIn} -> ${tokenOut}: ${price}`)
    //   }
    // }

    const wrapAction = (i: BaseAction) => {
      let act = i
      if (act.is1to1 && act.inputToken[0] === this.universe.nativeToken) {
        act = new NativeInputWrapper(this.universe, act)
      }
      if (act.dependsOnRpc) {
        act = new WrappedAction(this.universe, act)
      }
      return act
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
    const outputTokenClass = await this.universe.tokenClass.get(userOutput)
    const outputUnderlying = await this.universe.underlyingToken.get(userOutput)
    for (const input of userInput) {
      const inputUnderyling = await this.universe.underlyingToken.get(
        input.token
      )
      const inputTokenClass = await this.universe.tokenClass.get(input.token)

      if (
        !(
          inputTokenClass !== outputTokenClass ||
          inputUnderyling !== outputUnderlying
        )
      ) {
        continue
      }

      const inputPrice = (await input.price()).into(outputTokenClass)
      const outputPrice = (await outputTokenClass.price).into(outputTokenClass)

      const newInputQty = inputPrice.div(outputPrice)

      userInput[userInput.indexOf(input)] = newInputQty

      // Convert input to output token class
      const path = bfs(
        this.universe,
        this.universe.graph,
        input.token,
        outputTokenClass,
        2
      )
      const possiblePlans = path.steps
        .map((i) => i.convertToSingularPaths())
        .flat()

      const paths = await Promise.all(
        possiblePlans.map(async (plan) => plan.quote([input]))
      )
      paths.sort((r, l) => l.compare(r))

      const trades: BaseAction[] = []
      for (let i = 0; i < paths.length; i++) {
        const path = paths[i]
        const plan = path.swapPlan
        if (!plan.addresesInUse.every((i) => !addrsUsed.has(i))) {
          continue
        }
        for (const addr of plan.addresesInUse) {
          addrsUsed.add(addr)
        }
        const wrappedAct =
          plan.steps.length > 1
            ? new MultiStepAction(this.universe, plan.steps.map(wrapAction))
            : wrapAction(plan.steps[0])

        trades.push(wrappedAct)
      }

      dag.tradeUserInputFor(trades, input.token, outputTokenClass)
    }

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
              plan.steps.map(wrapAction)
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
            trades.push(wrapAction(act))
            tradeActions.delete(act)
          }
        }

        if (trades.length !== 0) {
          openSet.delete(tok)
          await dag.splitTradeInputIntoNewOutput(trades)
        }
      }
      if (openSet.size !== 0) {
        const trades: BaseAction[] = []
        for (const inp of userInput) {
          for (const out of openSet) {
            const path = bfs(
              this.universe,
              this.universe.graph,
              inp.token,
              out,
              2
            )
            const possiblePlans = path.steps
              .map((i) => i.convertToSingularPaths())
              .flat()
            const paths = (
              await Promise.all(
                possiblePlans.map(async (plan) =>
                  plan.quote([inp]).catch(() => null)
                )
              )
            ).filter((i) => i !== null)
            paths.sort((r, l) => l.compare(r))
            for (const path of paths) {
              const plan = path.swapPlan

              if (!plan.addresesInUse.every((i) => !addrsUsed.has(i))) {
                continue
              }
              for (const addr of plan.addresesInUse) {
                addrsUsed.add(addr)
              }
              trades.push(
                wrapAction(
                  new MultiStepAction(this.universe, plan.steps.map(wrapAction))
                )
              )
              openSet.delete(out)
            }
          }
          await dag.splitTradeInputIntoNewOutput(trades)
          // console.log('After splitTradeInputIntoNewOutput')
          // dag.debugToDot()
        }
      }
      if (openSet.size !== 0) {
        console.log('Missing tokens', [...openSet].join(', '))
        console.log('Trade actions:')
        for (const t of tradeActions) {
          console.log('  ', t.toString())
        }
        throw new Error('Open set is not fully consumed')
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
        return new SwapPlan(this.universe, [wrapAction(i)])
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
      [...tradeActions].map(wrapAction)
    )
    return out
  }
}
