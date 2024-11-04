import { BaseAction } from '../action/Action'
import { Address } from '../base/Address'
import { Token, TokenQuantity } from '../entities/Token'
import { TokenAmounts } from '../entities/TokenAmounts'
import { bfs, shortestPath } from '../exchange-graph/BFS'
import { Universe } from '../Universe'
import { Dag, SearchContextConfig } from './Dag'
import { SwapPlan } from './Swap'

const findTokenPaths = async (
  universe: Universe,
  inputs: Token[],
  dest: Token
) => {
  if (inputs.length === 0) {
    throw new Error(`Inputs array empty`)
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

export class DagBuilder {
  constructor(public readonly universe: Universe) {}

  public async buildDag(userInput: TokenQuantity[], userOutput: Token) {
    await this.universe.initialized
    const addressesUsed = new Set<Address>()
    const paths = await findTokenPaths(
      this.universe,
      userInput.map((i) => i.token),
      userOutput
    )
    if (paths.length === 0) {
      throw new Error(`No paths found`)
    }

    const longestPath = paths[0]
    console.log(`Longest path: ${longestPath.join(' -> ')}`)

    const goals = longestPath.slice(0, longestPath.length - 1)

    const dag = await Dag.create(
      this.universe,
      new SearchContextConfig(userInput, [userOutput.one])
    )
    goals.reverse()

    const consumeBalances = () => {
      while (true) {
        const balanceToken = dag.nextTokenToMatch
        if (balanceToken == null) {
          break
        }
        dag.matchBalance(balanceToken)
      }
    }

    const replaceOpenSet = async (fromTok: Token) => {
      const openSet = dag.openTokens
      console.log(
        `Replacing ${openSet.join(', ')} with productions from ${fromTok}`
      )

      let plans: SwapPlan[] = []

      for (const toTok of openSet) {
        const p = shortestPath(
          this.universe,
          this.universe.graph,
          fromTok,
          toTok,
          addressesUsed
        )
        console.log(p.join(' -> '))
        let routedPlan = bfs(
          this.universe,
          this.universe.graph,
          fromTok,
          toTok,
          p.length
        )
          .steps.map((i) => i.convertToSingularPaths())
          .flat()
          .filter((route) => {
            const addrs = route.addresesInUse
            const valid = addrs.every((addr) => !addressesUsed.has(addr))
            if (valid) {
              for (const a of addrs) {
                addressesUsed.add(a)
              }
            }
            return valid
          })

        if (routedPlan.length === 0) {
          console.log(`No plans found for ${fromTok} -> ${toTok}`)
          return
        }

        const plan = routedPlan[0]
        plans.push(plan)
      }
      plans = plans.map((plan) => {
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
      await dag.replaceOpenSet(plans)
      console.log(`Replaced open set ${openSet.join(', ')}`)
    }

    for (const fromTok of goals) {
      console.log(`Taking step towards inputs`)
      consumeBalances()
      console.log(`Replacing`)
      await replaceOpenSet(fromTok)
    }
    console.log(`Done constructing main dag`)
    for (let i = 0; i < 4; i++) {
      if (dag.isDagConstructed) {
        console.log(`Dag constructed`)
        break
      }
      consumeBalances()
      const unspent = dag.getUnspent()

      let found = false
      for (const tok of unspent.dust) {
        console.log(`Spending ${tok}`)
        if (userInput.find((qty) => qty.token === tok)) {
          await replaceOpenSet(tok)
          found = true
          break
        }
      }
      if (!found) {
        break
      }
    }

    const unspent = dag.getUnspent()
    console.log(`Spending unspent`)
    for (const token of unspent.input) {
      console.log(`Unspent token ${token}`)
      const options = bfs(
        this.universe,
        this.universe.graph,
        token,
        longestPath[0],
        2
      )
        .steps.map((i) => i.convertToSingularPaths())
        .flat()
        .filter((route) => {
          if (route.inputs.length !== 1 && route.outputs.length !== 1) {
            return false
          }
          const addrs = route.addresesInUse
          const valid = addrs.every((addr) => !addressesUsed.has(addr))
          if (valid) {
            for (const a of addrs) {
              addressesUsed.add(a)
            }
          }
          return valid
        })
      options.sort((l, r) => l.steps.length - r.steps.length)
      if (options.length === 0) {
        console.log(`Unable to spend ${unspent.input.join(', ')}`)
        continue
      }
      for (const path of options) {
        console.log(
          `Trading unspent input ${path.inputs.join(
            ', '
          )} traded for ${path.outputs.join(', ')} via ${path}`
        )
        dag.spendInput(path)
        break
      }
    }

    if (dag.isDagConstructed) {
      dag.finialize()
      console.log(`Dag constructed`)
      const nodes = dag.getSorted()
      console.log(`Result: ${nodes.join(', ')}`)
      return dag
    }
    console.log(`Failed to construct dag`)
  }
}
