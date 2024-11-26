import winston from 'winston'
import { BaseAction } from '../action/Action'
import { Address } from '../base/Address'
import { DefaultMap } from '../base/DefaultMap'
import { Token, TokenQuantity } from '../entities/Token'
import { Universe } from '../Universe'
import { DagBuilder } from './DagBuilder'
import { DagBuilderConfig, EvaluatedDag } from './Dag'
import { SwapPlan } from './Swap'
import { NativeInputWrapper, WrappedAction } from './TradeAction'
import { Planner, Value } from '../tx-gen/Planner'
import { TxGen } from './TxGen'

function generateAllCombinations<T>(
  list: T[][],
  n: number = 0,
  result: T[][] = [],
  current: T[] = []
) {
  if (n === list.length) result.push(current)
  else
    list[n].forEach((item) => {
      generateAllCombinations(list, n + 1, result, [...current, item])
    })
  return result
}

// Dags could technically span all tokens, instead we limit the number of steps to
// main tokens to visit + 5 additional steps. Up this number if it becomes a problem
const MAX_ADDITIONAL_STEPS = 5

const findUnderlyingTokens = async (universe: Universe, tokens: Token[]) => {
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
      const rate = await universe.mintRate.get(outputToken)
      console.log(`${outputToken}: ${rate}`)
      const inputToken = rate.token
      const out = Math.max(
        rate.asNumber(),
        mintPrices.get(inputToken).get(outputToken)
      )
      if (out === 0) {
        mintPrices.get(inputToken).delete(outputToken)
        continue
      }
      mintPrices.get(inputToken).set(outputToken, out)
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
    const inputs = userInput.map((i) => i.token)
    if (inputs.includes(this.universe.wrappedNativeToken)) {
      inputs.push(this.universe.nativeToken)
    }

    const { byPhase, mintPrices } = await findUnderlyingTokens(this.universe, [
      userOutput,
    ])
    for (const [_, edges] of mintPrices.entries()) {
      for (const [tokenOut, price] of edges.entries()) {
        for (const [tokenOutRate, rate] of mintPrices.get(tokenOut).entries()) {
          if (!edges.has(tokenOutRate)) {
            edges.set(tokenOutRate, price * rate)
          }
        }
      }
    }
    for (const [tokenIn, edges] of mintPrices.entries()) {
      for (const [tokenOut, price] of edges.entries()) {
        console.log(`${tokenIn} -> ${tokenOut}: ${price}`)
      }
    }

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
        userInput,
        [1],
        [userOutput.one],
        [1]
      )
    )
    const addrsUsed = new Set<Address>()
    const addrsUsedTrade = new Set<Address>()

    const tradeActions = new Set<BaseAction>()

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
      >(() => new DefaultMap<Token, BaseAction[]>((t) => []))
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
          console.log(`${edge} midPrice: ${midPrice} mintPrice: ${mintPrice}`)
          if ((midPrice / mintPrice) < 0.999) {
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
        const vertex = this.universe.graph.vertices.get(token)
        const mintEdge = this.universe.getMintAction(token)
        if (mintEdge != null) {
          addMainEdge(mintEdge)
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

            await addTradeEdge(edge)
          }
        }
      }
      const openSet = new Set(dag.openTokens)
      for (const act of actions) {
        for (const tok of act.outputToken) {
          openSet.delete(tok)
        }
      }
      if (openSet.size > 0) {
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
    await new TxGen(out).generate(signer)
    return out
  }
}
