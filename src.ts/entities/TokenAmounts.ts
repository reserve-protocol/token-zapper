import { DefaultMap } from '../base/DefaultMap'
import { Token, TokenQuantity } from './Token'

/**
 * A class representing a set of token quantities.
 *
 * @example
 * const tokenAmounts = new TokenAmounts()
 * tokenAmounts.add(usdc.from("12.34"))
 * tokenAmounts.sub(usdc.from("1.0"))
 * tokenAmounts.add(usdt.from("56.78"))
 * tokenAmounts.sub(usdt.from("1.0"))
 * console.log(tokenAmounts) // TokenAmounts([USDC: 11.34, USDT: 55.78])
 */

export class TokenAmounts {
  public tokenBalances = new DefaultMap<Token, TokenQuantity>((tok) =>
    tok.fromBigInt(0n)
  )

  static fromQuantities(qtys: TokenQuantity[]) {
    const out = new TokenAmounts()
    qtys.forEach((qty) => out.add(qty))
    return out
  }
  toTokenQuantities() {
    return [...this.tokenBalances.values()].filter((i) => i.amount !== 0n)
  }
  get(tok: Token) {
    return tok.fromBigInt(this.tokenBalances.get(tok).amount)
  }

  add(qty: TokenQuantity) {
    const b = this.tokenBalances.get(qty.token)
    this.tokenBalances.set(qty.token, b.add(qty))
    return this
  }

  sub(qty: TokenQuantity) {
    const b = this.tokenBalances.get(qty.token)
    this.tokenBalances.set(qty.token, b.sub(qty))
  }

  hasBalance(inputs: TokenQuantity[]) {
    return inputs.every((i) => this.tokenBalances.has(i.token) ? this.get(i.token).gte(i) : i.token.zero.gte(i))
  }

  exchange(
    tokensRemovedFromBasket: TokenQuantity[],
    tokensAddedToBasket: TokenQuantity[]
  ) {
    if (!this.hasBalance(tokensRemovedFromBasket)) {
      throw new Error('Insufficient balance')
    }
    tokensAddedToBasket.forEach((outputs) => {
      this.add(outputs)
    })
    tokensRemovedFromBasket.forEach((input) => {
      this.sub(input)
    })
  }

  multiplyFractions(inputs: TokenQuantity[], convertZeroToOne = false) {
    return TokenAmounts.fromQuantities(
      inputs.map((input) => {
        let current = this.get(input.token)
        if (current.amount === 0n && convertZeroToOne) {
          current = input.token.one
        }
        return current.mul(input)
      })
    )
  }

  recalculateAsFractionOf(parent: TokenAmounts) {
    return TokenAmounts.fromQuantities(
      [...this.tokenBalances.values()].map((qty) =>
        qty.div(parent.get(qty.token))
      )
    )
  }

  addAll(input: TokenAmounts) {
    this.addQtys(input.toTokenQuantities())
  }
  subAll(input: TokenAmounts) {
    this.subQtys(input.toTokenQuantities())
  }

  addQtys(inputs: TokenQuantity[]) {
    for (const value of inputs) {
      if (value.amount === 0n) {
        continue
      }
      this.add(value)
    }
  }
  subQtys(inputs: TokenQuantity[]) {
    for (const value of inputs) {
      if (value.amount === 0n) {
        continue
      }
      this.sub(value)
    }
  }

  toString() {
    return `TokenAmounts(${[...this.tokenBalances.values()]
      .map((qty) => qty.formatWithSymbol())
      .join(', ')})`
  }

  clone() {
    const out = new TokenAmounts()
    for (const amount of this.tokenBalances.values()) {
      out.tokenBalances.set(amount.token, amount)
    }
    return out
  }
}
