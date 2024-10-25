import { BaseAction } from '../action/Action'
import { DefaultMap } from '../base/DefaultMap'
import { Token, TokenQuantity } from '../entities/Token'
import { TokenAmounts } from '../entities/TokenAmounts'
import { Universe } from '../Universe'
import { SwapPath, SwapPath1toN } from './Swap'

class EvalContext {
  public readonly balances: TokenAmounts = new TokenAmounts()
  public constructor() {}
}
abstract class DagNode {
  protected consumers = new DefaultMap<Token, DagNode[]>(() => [])

  constructor(
    public readonly inputs: [number, Token][],
    public readonly outputs: [number, Token][]
  ) {}

  public forward(token: Token, next: DagNode) {
    this.consumers.get(token).push(next)
  }

  public async evaluate(
    context: EvalContext,
    inputs: TokenQuantity[]
  ): Promise<TokenQuantity[]> {
    throw new Error('Method not implemented.')
  }
}

class EffectNode extends DagNode {
  constructor(
    private readonly effect: (
      consumers: DagNode[],
      context: EvalContext,
      inputs: TokenQuantity[]
    ) => Promise<TokenQuantity[]>,
    inputToken: Token,
    outputToken: Token
  ) {
    super([[1, inputToken]], [[1, outputToken]])
  }
  static make(
    effect: (
      consumers: DagNode[],
      context: EvalContext,
      inputs: TokenQuantity[]
    ) => Promise<TokenQuantity[]>,
    inputToken: Token,
    outputToken: Token
  ) {
    return new EffectNode(effect, inputToken, outputToken)
  }

  static balanceNode(token: Token) {
    return new EffectNode(
      async (consumers, context, inputs) => {
        if (consumers.length > 1) {
          throw new Error('BalanceNode must have exactly one consumer')
        }
        for (const input of inputs) {
          context.balances.replace(input)
        }
        if (consumers.length === 0) {
          return [context.balances.get(token)]
        }
        return await consumers[0].evaluate(context, [
          context.balances.get(token),
        ])
      },
      token,
      token
    )
  }

  public async evaluate(
    context: EvalContext,
    inputs: TokenQuantity[]
  ): Promise<TokenQuantity[]> {
    return await this.effect(
      [...this.consumers.values()].map((i) => i[0]),
      context,
      inputs
    )
  }
}

class ActionNode extends DagNode {
  constructor(public readonly path: SwapPath1toN) {
    super(
      [[1, path.input.token]],
      path.outputs.length === 1
        ? [[1, path.outputs[0].token]]
        : path.proportions().map((i) => [i.asNumber(), i.token])
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
  public async evaluate(
    context: EvalContext,
    [input]: TokenQuantity[]
  ): Promise<TokenQuantity[]> {
    const consumers = this.consumers.get(input.token)
    if (consumers.length !== this.splits.length) {
      throw new Error('SplitNode must have as many consumers as splits')
    }
    const splitQtys = this.splits.map((split) => {
      return input.mul(input.token.from(split))
    })
    const output = new TokenAmounts()

    for (const out of (
      await Promise.all(
        consumers.map((consumer, index) =>
          consumer.evaluate(context, [splitQtys[index]])
        )
      )
    ).flat()) {
      output.add(out)
    }
    return output.toTokenQuantities()
  }
}

class SearchContextConfig {
  constructor(
    public readonly userInput: TokenQuantity[],
    public readonly userOutput: TokenQuantity[]
  ) {}
}

const routeOutputToConsumers = (
  node: DagNode,
  token: Token,
  consumers: { proportion: number; consumer: DagNode }[]
) => {
  if (consumers.length === 0) {
    throw new Error('No consumers for node')
  }
  if (consumers.length === 1) {
    node.forward(token, consumers[0].consumer)
    return
  }
  let splits = consumers.map((consumer) => consumer.proportion)
  const sum = splits.reduce((l, r) => l + r)
  splits = splits.map((split) => split / sum)
  const splitNode = new SplitNode(token, splits)
  for (const { consumer } of consumers) {
    splitNode.forward(token, consumer)
  }
  node.forward(token, splitNode)
  return
}

class Dag {
  private root: DagNode
  private balanceNodeTip = new Map<Token, DagNode>()
  private balanceNodeStart = new Map<Token, DagNode>()
  private openTokenSet = new Map<
    Token,
    {
      proportion: number
      consumers: { proportion: number; consumer: DagNode }[]
    }
  >()
  public constructor(config: SearchContextConfig) {
    this.root = new (class extends DagNode {
      constructor() {
        super(
          config.userInput.map((i) => [1, i.token]),
          config.userInput.map((i) => [1, i.token])
        )
      }
      public async evaluate(context: EvalContext, inputs: TokenQuantity[]) {
        const results = (
          await Promise.all(
            inputs.map((input) => {
              const consumers = this.consumers.get(input.token)
              if (consumers.length !== 1) {
                throw new Error('Root must have exactly one consumer')
              }
              return consumers[0].evaluate(context, [input])
            })
          )
        ).flat()
        const output = new TokenAmounts()
        for (const out of results) {
          output.add(out)
        }
        return output.toTokenQuantities()
      }
    })()

    for (const { token } of config.userInput) {
      const inputBalanceNode = EffectNode.balanceNode(token)
      this.balanceNodeTip.set(token, inputBalanceNode)
      this.balanceNodeStart.set(token, inputBalanceNode)
      this.root.forward(token, inputBalanceNode)
    }
    for (const { token } of config.userOutput) {
      this.openTokenSet.set(token, {
        proportion: 1.0,
        consumers: [
          {
            proportion: 1.0,
            consumer: EffectNode.balanceNode(token),
          },
        ],
      })
    }
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
  }

  /** Matches a balance node with an open set token,
   *  this will create splits as neccessary and connect up balance nodes to the output nodes */
  public matchBalance(token: Token) {
    const previousNode = this.balanceNodeTip.get(token)
    if (previousNode == null) {
      throw new Error('No balance for token ' + token.toString())
    }
    const prop = this.takeOpenSet(token)
    if (this.openTokenSet.size !== 0) {
      const splits = [
        ...prop.consumers.map(
          (consumer) => consumer.proportion * prop.proportion
        ),
        1 - prop.proportion,
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
      for (const consumer of consumers) {
        splitNode.forward(token, consumer)
      }
      previousNode.forward(token, splitNode)

      this.balanceNodeTip.set(token, balanceNode)
      return
    }
    if (prop.consumers.length === 1) {
      previousNode.forward(token, prop.consumers[0].consumer)
      this.balanceNodeTip.set(token, prop.consumers[0].consumer)
      return
    }

    let splits = prop.consumers.map((consumer) => consumer.proportion)
    const sum = splits.reduce((l, r) => l + r)
    splits = splits.map((split) => split / sum)

    const splitNode = new SplitNode(token, splits)
    for (const { consumer } of prop.consumers) {
      splitNode.forward(token, consumer)
    }
    this.balanceNodeTip.delete(token)
  }

  private takeOpenSet(token: Token) {
    const prop = this.openTokenSet.get(token)
    if (prop == null) {
      throw new Error('No balance for token ' + token.toString())
    }
    this.openTokenSet.delete(token)
    this.normalizeProportions()
    return prop
  }

  /**
   * Replaces the open set with a new set of actions. This will remove all the tokens from the open set, and replace it with a new set of tokens
   * the new set will be the inputs of the actions.
   */
  public replaceOpenSet(tokenDerivations: SwapPath1toN[]) {
    const consumed = new Set<Token>()
    const openSet = this.openTokenSet
    this.openTokenSet = new Map()
    if (tokenDerivations.length !== openSet.size) {
      throw new Error(
        `Cannot replace set: expected ${openSet.size} derivations, got ${tokenDerivations.length}`
      )
    }
    if (!tokenDerivations.every((i) => openSet.has(i.input.token))) {
      throw new Error(
        `Cannot replace set: derivations must all have the same input token`
      )
    }

    for (const action of tokenDerivations) {
      const outputTokens = action.outputs.map((i) => i.token)
      for (const outputToken of outputTokens) {
        if (consumed.has(outputToken)) {
          throw new Error(
            `Cannot replace set: token ${outputToken} is already consumed`
          )
        }
        consumed.add(outputToken)
        if (!openSet.has(outputToken)) {
          throw new Error(
            `Cannot replace set: token ${outputToken} is not in the open set`
          )
        }
      }
      const actionNode = new ActionNode(action)
      let outProportion = 0.0
      for (const outToken of outputTokens) {
        const consumers = openSet.get(outToken)!
        routeOutputToConsumers(actionNode, outToken, consumers.consumers)
        outProportion += consumers.proportion
      }
      if (outProportion == 0.0) {
        throw new Error(`Failed to find a route for ${action.toString()}`)
      }

      this.openTokenSet.set(action.input.token, {
        proportion: outProportion,
        consumers: [{ proportion: 1, consumer: actionNode }],
      })
    }
  }
}

class SearchContext {
  public readonly balances: TokenAmounts = new TokenAmounts()
  public readonly dag: Dag
  constructor(public readonly config: SearchContextConfig) {
    this.dag = new Dag(config)
  }
}

type TokenStrategies =
  | {
      type: 'trade'
      input: TokenQuantity
      output: Token
    }
  | {
      type: 'action'
      amounts?: TokenQuantity[]
      action: BaseAction
    }

export class OpenSetTokenStrategy {
  constructor(
    public readonly universe: Universe,
    public readonly token: Token
  ) {}

  public addOption(fn: (context: SearchContext) => TokenStrategies) {}
}
