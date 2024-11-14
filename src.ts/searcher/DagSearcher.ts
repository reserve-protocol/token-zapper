import winston from 'winston'
import { BaseAction } from '../action/Action'
import { Address } from '../base/Address'
import { computeProportions, Token, TokenQuantity } from '../entities/Token'
import { bfs, shortestPath } from '../exchange-graph/BFS'
import { Universe } from '../Universe'
import { DagBuilder, DagBuilderConfig, EvaluatedDag, isActionNode } from './Dag'
import { SwapPlan } from './Swap'
import {
  ActionType,
  OverallRoutePlan,
  routeActions,
  TokenType,
} from '../entities/TokenClass'
import { TradeAction, WrappedAction } from './TradeAction'
import { DefaultMap } from '../base/DefaultMap'

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
const findTokenPaths = async (
  universe: Universe,
  inputs: Token[],
  dest: Token
) => {
  if (inputs.length === 0) {
    throw new Error(`findTokenPaths: Inputs array empty`)
  }
  const paths: Token[][] = []
  const preferredInput = await universe.tokenClass.get(dest)

  for (const input of inputs) {
    let path = shortestPath(universe, universe.graph, input, dest)
    if (input !== preferredInput) {
      const altPath = [
        input,
        ...shortestPath(universe, universe.graph, preferredInput, dest),
      ]
      if (altPath.length < path.length) {
        path = altPath
      }
    }

    if (path.length === 0) {
      continue
    }

    paths.push(path)
  }

  paths.sort((l, r) => l.length - r.length)

  return paths
}
const wrappedActions = new WeakMap<BaseAction, WrappedAction>()
const findSingularRoute = async (
  self: DagSearcher,
  tokenToSearchFrom: Token,
  toTok: Token,
  addressesUsed: Set<Address>,
  duplicates: Set<string> = new Set()
) => {
  const pathLength = shortestPath(
    self.universe,
    self.universe.graph,
    tokenToSearchFrom,
    toTok,
    addressesUsed
  ).length
  const routedPlan = bfs(
    self.universe,
    self.universe.graph,
    tokenToSearchFrom,
    toTok,
    pathLength
  )
    .steps.map((i) => i.convertToSingularPaths())
    .flat()
    .filter((route) => {
      if (
        new Set(route.steps.map((i) => i.address)).size !== route.steps.length
      ) {
        console.log(
          `Filtering off ${route.toString()} due to duplicate addresses`
        )
        return false
      }
      const numberOfMultiInputSteps = route.steps.filter(
        (i) => i.inputToken.length !== 1
      ).length
      const numberOfMultiOutputSteps = route.steps.filter(
        (i) => i.outputToken.length !== 1
      ).length
      if (numberOfMultiInputSteps != 0 && numberOfMultiOutputSteps != 0) {
        console.log(
          `Filtering off ${route.toString()} numberOfMultiInputSteps + numberOfMultiOutputSteps = ${
            numberOfMultiInputSteps + numberOfMultiOutputSteps
          } > 1`
        )
        return false
      }

      return route.addresesInUse.every((addr) => !addressesUsed.has(addr))
    })
    .map((plan) => {
      if (
        plan.steps.some(
          (i) =>
            i.dependsOnRpc &&
            i.inputToken.length === 1 &&
            i.outputToken.length === 1
        )
      ) {
        return new SwapPlan(
          self.universe,
          plan.steps.map((i) => {
            if (
              i.dependsOnRpc &&
              i.inputToken.length === 1 &&
              i.outputToken.length === 1
            ) {
              if (!wrappedActions.has(i)) {
                wrappedActions.set(i, new WrappedAction(self.universe, i))
              }
              return wrappedActions.get(i)!
            }
            return i
          })
        )
      }
      return plan
    })

  if (routedPlan.length === 0) {
    console.log(
      `Failed to find route from ${tokenToSearchFrom} to ${toTok}, path length = ${pathLength}`
    )
    return []
  } else {
    return routedPlan.map((plan) => {
      console.log(`Found plan: ${plan}`)
      if (plan.steps.every((i) => i.inputToken.length === 1)) {
        return plan
      }

      const steps: BaseAction[] = []
      for (let i = plan.steps.length - 1; i >= 0; i--) {
        const step = plan.steps[i]
        steps.push(step)
        if (step.inputToken.length !== 1) {
          break
        }
      }
      steps.reverse()
      return new SwapPlan(plan.universe, steps)
    })
  }
}

const routeOptionToPlan = async (
  self: DagSearcher,
  addrsInUse: Set<Address>,
  option: OverallRoutePlan,
  duplicates: Set<string>
): Promise<SwapPlan[]> => {
  let previousRoutes: BaseAction[][] = []
  let stepsSoFar: BaseAction[] = []
  let input = option.input

  for (const step of option.steps) {
    if (step.dest.address === input.address) {
      break
    }

    switch (step.type) {
      case ActionType.Wrap:
      case ActionType.Unwrap:
        const routes = await findSingularRoute(
          self,
          input,
          step.dest,
          addrsInUse,
          duplicates
        )
        if (routes.length === 0) {
          console.log(
            `No plans from ${input} to ${step.dest}, adding tradeedge`
          )
          stepsSoFar.push(new TradeAction(self.universe, input, step.dest))
          break
        }
        if (routes.length === 1) {
          stepsSoFar.push(...routes[0].steps)
        } else {
          if (previousRoutes.length === 0) {
            previousRoutes = routes.map((i) => stepsSoFar.concat(i.steps))
            stepsSoFar = []
          } else {
            previousRoutes = previousRoutes
              .map((route) =>
                routes.map((next) =>
                  route.concat(stepsSoFar).concat(next.steps)
                )
              )
              .flat(1)
            stepsSoFar = []
          }
        }
        break
      case ActionType.Trade:
        stepsSoFar.push(new TradeAction(self.universe, input, step.dest))
    }
    input = step.dest
  }
  if (previousRoutes.length === 0) {
    if (stepsSoFar.length === 0) {
      console.log(
        `empty result from ${option.input} to ${option.steps.at(-1)!.dest}`
      )
      console.log([...addrsInUse].join(', '))
      return [
        new SwapPlan(self.universe, [
          new TradeAction(
            self.universe,
            option.input,
            option.steps.at(-1)!.dest
          ),
        ]),
      ]
    }
    return [new SwapPlan(self.universe, stepsSoFar)]
  }
  return previousRoutes
    .map((route) => new SwapPlan(self.universe, route.concat(stepsSoFar)))
    .filter((i) => {
      for (const addr of i.addresesInUse) {
        if (addrsInUse.has(addr)) {
          return false
        }
      }
      return true
    })
}

const routeOptionsToPlans = async (
  self: DagSearcher,
  addrsInUse: Set<Address>,
  options: OverallRoutePlan[],
  duplicates: Set<string>
) =>
  (
    await Promise.all(
      options
        .filter((i) => i.steps.length > 0)
        .map(
          async (i) =>
            await routeOptionToPlan(self, addrsInUse, i, new Set(duplicates))
        )
    )
  ).flat()

const findAllRoutes = async (
  self: DagSearcher,
  logger: winston.Logger,
  inputTokens: Token[],
  openSet: Token[],
  addressesUsed: Set<Address>,
  duplicates: Set<string>
) => {
  // const underlyingInputTokenSet = (
  //   await Promise.all(
  //     inputTokens.map(async (i) => {
  //       const tokenType = await self.universe.tokenType.get(i)
  //       if (tokenType === TokenType.OtherMintable) {
  //         return [await self.universe.underlyingToken.get(i)]
  //       }
  //       return []
  //     })
  //   )
  // ).flat()

  logger.debug(
    `Finding all routes from ${inputTokens.join(', ')} to ${openSet.join(', ')}`
  )
  const plan: SwapPlan[] = []
  let plans: SwapPlan[][] = [plan]
  const dups = new Set<string>()

  for (const toTok of openSet) {
    let options = await routeActions(self.universe, inputTokens, toTok)

    options = options
      .map((option) => {
        if (option.steps.length > 1) {
          return new OverallRoutePlan(option.steps.at(-2)!.dest, [
            option.steps.at(-1)!,
          ])
        }
        return option
      })
      .filter((i) => i.steps.length !== 0 && i.input !== i.steps.at(-1)?.dest)
      .filter((i) => {
        if (openSet.includes(i.input)) {
          return false
        }
        const k = i.toString()
        if (dups.has(k)) {
          return false
        }
        dups.add(k)
        return true
      })
    console.log(`Options from ${inputTokens.join(', ')} to ${toTok}:`)
    for (const option of options) {
      console.log(`  -> ${option.toString()}`)
    }
    const res = (
      await routeOptionsToPlans(self, addressesUsed, options, duplicates)
    ).filter((plan) => {
      if (plan.outputs.some((i) => inputTokens.includes(i))) {
        return false
      }
      const k = plan.toString()
      if (dups.has(k)) {
        return false
      }
      dups.add(k)
      return true
    })
    plan.push(...res)
  }

  console.log(
    `Found ${plan.length} plans from ${inputTokens.join(
      ', '
    )} to ${openSet.join(', ')}`
  )
  for (const p of plan) {
    console.log(`${p.toString()}`)
  }
  // return generateAllCombinations(plans)
  return plans
}

export class DagSearcher {
  private readonly logger: winston.Logger
  constructor(public readonly universe: Universe) {
    this.logger = this.universe.logger.child({
      name: 'dag-builder',
      phase: 'searching',
    })
  }

  public async buildDag(userInput: TokenQuantity[], userOutput: Token) {
    const timer = this.universe.perf.begin(
      'dag-builder',
      `${userInput.map((i) => i.token).join(',')} -> ${userOutput}`
    )
    const logger = this.logger.child({
      input: `${userInput.map((i) => i.token).join(',')}`,
      output: userOutput.toString(),
    })

    await this.universe.initialized
    const paths = await findTokenPaths(
      this.universe,
      userInput.map((i) => i.token),
      userOutput
    )
    if (paths.length === 0) {
      throw new Error(
        `Unable to find path from any of the inputs: '${userInput
          .map((i) => i.token)
          .join(',')}' to '${userOutput}'`
      )
    }

    const userInputTokenSet = new Set(userInput.map((i) => i.token))
    const replaceOpenSet = async (
      dag: DagBuilder,
      tokenToSearchFrom: Token[],
      addressesUsed: Set<Address>,
      duplicates: Set<string>
    ): Promise<[Set<Address>, DagBuilder][]> => {
      // console.log(
      //   `Replacing open set ${tokenToSearchFrom.join(
      //     ', '
      //   )} with ${dag.openTokens.join(', ')}`
      // )
      const openset = dag.openTokens
      return await Promise.all(
        (
          await findAllRoutes(
            this,
            logger,
            tokenToSearchFrom,
            openset,
            addressesUsed,
            duplicates
          )
        ).map(async (plans) => {
          const option = dag.clone()
          try {
            await option.replaceOpenSet(
              plans.filter(
                (i) => !i.outputs.some((out) => userInputTokenSet.has(out))
              )
            )

            const addrs = new Set(addressesUsed)
            for (const plan of plans) {
              for (const addr of plan.addresesInUse) {
                addrs.add(addr)
              }
            }
            return [addrs, option] as [Set<Address>, DagBuilder]
          } catch (e) {
            logger.error(e)
            return null
          }
        })
      ).then((i) => i.filter((i) => i != null))
    }

    const finalizeDag = async (
      dag: DagBuilder,
      addressesUsed: Set<Address>,
      mainToken: Token,
      duplicates: Set<string>
    ) => {
      const plans: SwapPlan[][] = []
      const unspenInput = dag.unspentInputTokens()
      console.log(`unspent input: ${unspenInput.join(', ')}`)
      for (const inToken of unspenInput) {
        let outToken = mainToken
        if (inToken === mainToken) {
          const newOut = userInput.find((i) => i.token !== mainToken)?.token
          if (newOut == null) {
            continue
          }
          outToken = newOut
        }
        let options = bfs(
          this.universe,
          this.universe.graph,
          inToken,
          outToken,
          1
        )
          .steps.map((i) => i.convertToSingularPaths())
          .flat()
        options.push(
          new SwapPlan(this.universe, [
            new TradeAction(this.universe, inToken, outToken),
          ])
        )

        options = options.filter((route) => {
          if (route.inputs.length !== 1 && route.outputs.length !== 1) {
            return false
          }
          for (const addr of route.addresesInUse) {
            if (addressesUsed.has(addr)) {
              return false
            }
          }
          return true
        })

        plans.push(options)
      }

      const out = generateAllCombinations(plans).map((option) => {
        const dagClone = dag.clone()
        for (const path of option) {
          dagClone.spendInput(path)
        }
        dagClone.finalize()
        return dagClone
      })

      if (out.length === 0) {
        const last = dag.clone()
        last.finalize()
        return [last]
      }

      return out
    }
    const recourseOnIterPath = async (
      dag: DagBuilder,
      addressesUsed: Set<Address>,
      mainToken: Token,
      remainingSteps = MAX_ADDITIONAL_STEPS,
      duplicates: Set<string> = new Set()
    ): Promise<DagBuilder[]> => {
      dag.matchBalances()
      logger.debug(
        `Recourse on iter path ${remainingSteps}, ${dag.openTokens.join(', ')}`
      )
      if (dag.isDagConstructed) {
        logger.debug(`Finalizing dag`)
        return await finalizeDag(
          dag,
          new Set(addressesUsed),
          mainToken,
          duplicates
        )
      }
      if (remainingSteps <= 0) {
        logger.debug(`No more steps`)
        return []
      }

      const unspentTokens = dag.unspentInputTokens()
      if (unspentTokens.length === 0) {
        logger.debug(`No unspent tokens and dag is not finalized`)
        return []
      }
      const options = await replaceOpenSet(
        dag.clone(),
        unspentTokens,
        new Set(addressesUsed),
        duplicates
      )
      return (
        await Promise.all(
          options.map(async ([newAddrsInUse, dag]) => {
            try {
              return await recourseOnIterPath(
                dag,
                new Set(newAddrsInUse),
                mainToken,
                remainingSteps - 1,
                duplicates
              )
            } catch (e) {
              logger.error(e)
              return null
            }
          })
        )
      )
        .flat(1)
        .filter((i) => i != null)
    }
    const recourseOnMainPathToken = async (
      dag: DagBuilder,
      addressesUsed: Set<Address>,
      mainTokensToVisit: Token[],
      mainToken: Token
    ): Promise<DagBuilder[]> => {
      const duplicates = new Set<string>()
      if (mainTokensToVisit.length === 0) {
        return await recourseOnIterPath(dag.clone(), addressesUsed, mainToken)
      } else {
        let fromTok = [mainTokensToVisit[0]]
        dag.matchBalances()

        if (userInput.find((i) => i.token === mainTokensToVisit[0]) != null) {
          return await recourseOnIterPath(dag.clone(), addressesUsed, mainToken)
        }

        const options = await replaceOpenSet(
          dag.clone(),
          fromTok,
          addressesUsed,
          duplicates
        )
        const remPath = mainTokensToVisit.slice(1)
        return (
          await Promise.all(
            options.map(async ([newAddrsInUse, dag]) => {
              try {
                return await recourseOnMainPathToken(
                  dag,
                  newAddrsInUse,
                  remPath,
                  mainToken
                )
              } catch (e) {
                logger.error(e)
                return []
              }
            })
          )
        ).flat()
      }
    }
    const pathsUsed = new Set<string>()
    const handleMainPath = async (mainPath: Token[]) => {
      const k = mainPath.join(',')
      if (pathsUsed.has(k)) {
        return []
      }
      pathsUsed.add(k)
      const addressesUsed = new Set<Address>()

      const inputProportions = (await computeProportions(userInput)).map((i) =>
        i.asNumber()
      )

      const dag = await DagBuilder.create(
        this.universe,
        new DagBuilderConfig(
          this.universe,
          logger,
          userInput,
          inputProportions,
          [userOutput.one],
          [1]
        )
      )

      const dags = await recourseOnMainPathToken(
        dag,
        addressesUsed,
        mainPath.slice(0, mainPath.length - 1).reverse(),
        mainPath[0]
      )
      timer()
      return dags
    }

    const duplicates = new Set<string>()
    let unoptimised = (
      await Promise.all(
        paths.map((p) =>
          handleMainPath(p).catch((e) => {
            logger.error(e)
            return null
          })
        )
      )
    )
      .filter((i) => i != null)
      .flat() as DagBuilder[]

    unoptimised = (
      await Promise.all(
        unoptimised.map(async (dag) => {
          console.log(dag.toDot())

          const v = await dag.evaluate()
          const k = v.allOutputs.join(';')
          if (duplicates.has(k)) {
            return null
          }
          duplicates.add(k)
          return [v.totalValue, dag] as [number, DagBuilder]
        })
      )
    )
      .filter((i) => i != null)
      .sort((l, r) => r[0] - l[0])
      .map((i) => i[1])
      .slice(0, 10)

    const optimisable = unoptimised.filter((i) => i.dustCanBeOptimised)
    const nonOptimisable = await Promise.all(
      unoptimised
        .filter((i) => !i.dustCanBeOptimised)
        .map(async (i) => [await i.evaluate(), i] as [EvaluatedDag, DagBuilder])
    )

    const optimised = await Promise.all(
      optimisable.slice(0, 3).map(async (i) => {
        const fst = await i.optimiseReduceDust(100)
        return fst
      })
    ).then((optimsedOnce) => {
      optimsedOnce.sort((l, r) => r[0].outputsValue - l[0].outputsValue)
      return optimsedOnce
    })

    const o = [...optimised, ...nonOptimisable].map((i) => i[0])
    o.sort((l, r) => r.outputsValue - l.outputsValue)

    const evaluatedDags: EvaluatedDag[] = []

    // Last step, replace the temporary TradeAction steps with actual on-chain actions
    await Promise.all(
      o.slice(0, 3).map(async (evaluatedDag) => {
        evaluatedDags.push(evaluatedDag)
        // if (evaluatedDag.evaluated.every(node => {
        //   if (node.node instanceof TradeAction) {
        //   }
        // })
        // await Promise.all(
        //   evaluatedDag.evaluated.map(node => {
        //     if (isActionNode(node.node)) {
        //     }
        //   })
        // )
      })
    )

    return evaluatedDags
  }
}
