import { type Action } from '../action/Action'
import { type Token, TokenAmounts, type TokenQuantity } from '../entities/Token'

export class PostTradeAction {
  constructor(
    public readonly inputAsFractionOfCurrentBalance: TokenQuantity[],
    public readonly action?: Action,
    public readonly postTradeActions?: PostTradeAction[],
    public readonly updateBalances: boolean = false
  ) {}

  describe() {
    const out: string[] = []
    out.push(`PostTradeAction {`)
    out.push(
      `  inputAsFractionOfCurrentBalance: ${this.inputAsFractionOfCurrentBalance
        .map(
          (i) => '(' + i.token.symbol + ' ' + i.scalarMul(100n).format() + '%)'
        )
        .join(', ')}`
    )
    out.push(`  update: ${this.updateBalances}`)
    out.push(`  action: ${this.action?.toString()}`)
    this.postTradeActions
      ?.filter((child) => {
        if (
          child.action == null &&
          (child.postTradeActions == null ||
            child.postTradeActions.length === 0)
        ) {
          return false
        }
        return true
      })
      .forEach((child, i) => {
        const desc = child.describe()
        out.push(`  step ${i + 1}: ${desc[0]}`)
        desc.slice(1).forEach((line) => out.push(`    ${line}`))
      })
    out.push('}')
    return out
  }

  static fromAction(
    action: Action,
    update?: boolean
  ) {
    return new PostTradeAction(
      action.input.map((input) => input.one),
      action,
      [],
      update
    )
  }

  static from(
    action: Action,
    postTradeActions?: PostTradeAction[],
    update?: boolean
  ) {
    return new PostTradeAction(
      action.input.map((input) => input.one),
      action,
      postTradeActions,
      update
    )
  }

  static create(
    input: TokenQuantity[],
    action: Action,
    postTradeActions?: PostTradeAction[]
  ) {
    return new PostTradeAction(input, action, postTradeActions)
  }
}

export class BasketTokenSourcingRuleApplication {
  constructor(
    public readonly precursorToTradeFor: TokenQuantity[],
    public readonly postTradeActions: PostTradeAction[]
  ) {}

  describe() {
    const out: string[] = []
    out.push(`SourcingRuleApplication {`)
    out.push(`  tokensPrUnit: ${this.precursorToTradeFor.join(', ')}`)
    this.postTradeActions?.forEach((child, i) => {
      const desc = child.describe()
      out.push(`  step ${i + 1}: ${desc[0]}`)
      desc.slice(1).forEach((line) => out.push(`    ${line}`))
    })
    out.push('}')
    return out
  }

  static create(
    precursorToTradeFor: TokenQuantity[],
    postTradeActions?: PostTradeAction
  ) {
    return new BasketTokenSourcingRuleApplication(
      precursorToTradeFor,
      postTradeActions ? [postTradeActions] : []
    )
  }

  static fromBranches(branches: BasketTokenSourcingRuleApplication[], action?: Action) {
    const precursors = TokenAmounts.fromQuantities(
      branches.map((i) => i.precursorToTradeFor).flat()
    )

    const subActions = branches.map(
      (i) =>
        new PostTradeAction(
          TokenAmounts.fromQuantities(i.precursorToTradeFor)
            .recalculateAsFractionOf(precursors)
            .toTokenQuantities(),
          undefined,
          i.postTradeActions
        )
    )

    if (action) {
      const combinedAction = PostTradeAction.from(action, subActions)
      return new BasketTokenSourcingRuleApplication(precursors.toTokenQuantities(), [
        combinedAction,
      ])
    }

    const inputs = precursors.toTokenQuantities()
    return new BasketTokenSourcingRuleApplication(inputs, subActions)
  }

  static fromActionWithDependencies(
    action: Action,
    branches: BasketTokenSourcingRuleApplication[]
  ) {
    const precursors = TokenAmounts.fromQuantities(
      branches.map((i) => i.precursorToTradeFor).flat()
    )

    const execFirst = branches.map(
      (i, ith) =>
        new PostTradeAction(
          TokenAmounts.fromQuantities(i.precursorToTradeFor)
            .recalculateAsFractionOf(precursors)
            .toTokenQuantities(),
          undefined,
          i.postTradeActions,
          ith === branches.length - 1
        )
    )

    const lastAction = PostTradeAction.from(action)
    const inputs = precursors.toTokenQuantities()

    return new BasketTokenSourcingRuleApplication(inputs, [...execFirst, lastAction])
  }

  static singleBranch(
    precursorToTradeFor: TokenQuantity[],
    postTradeActions: PostTradeAction[]
  ) {
    return new BasketTokenSourcingRuleApplication(
      precursorToTradeFor,
      postTradeActions
    )
  }

  static noAction(precursorToTradeFor: TokenQuantity[]) {
    return new BasketTokenSourcingRuleApplication(precursorToTradeFor, [])
  }
}


export type SourcingRule = (
  userInputToken: Token,
  heldQuantity: TokenQuantity
) => Promise<BasketTokenSourcingRuleApplication>
