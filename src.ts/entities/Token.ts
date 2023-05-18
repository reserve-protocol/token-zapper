import { Address } from '../base/Address'
import { DefaultMap } from '../base/DefaultMap'
import { ethers } from 'ethers'

/**
 * A class representing a token.
 * @property {Address} address - The address of the token.
 * @property {string} symbol - The symbol of the token.
 * @property {string} name - The name of the token.
 * @property {number} decimals - The number of decimals of the token.
 * @property {bigint} scale - The scale of the token.
 *
 * @property {TokenQuantity} zero - The zero quantity of the token.
 * @property {TokenQuantity} one - The one quantity of the token.
 *
 * An instance of a token can be instantiated into a TokenQuantity.
 * @example
 * const token = universe.commonTokens.USDC!
 *
 * const fromString = token.from("12.34")
 * const fromBigInt = token.from(12340000n)
 * const fromBigIntAlt = token.fromBigInt(12340000n)
 *
 * fromString.amount === fromBigInt.amount // true
 */
export class Token {
  public readonly zero: TokenQuantity
  public readonly one: TokenQuantity

  private constructor(
    public readonly address: Address,
    public readonly symbol: string,
    public readonly name: string,
    public readonly decimals: number,
    public readonly scale: bigint
  ) {
    this.zero = this.fromBigInt(0n)
    this.one = this.fromBigInt(scale)
  }

  static createToken(
    tokensRegister: Map<Address, Token>,
    address: Address,
    symbol: string,
    name: string,
    decimals: number
  ): Token {
    let current = tokensRegister.get(address)
    if (current == null) {
      current = new Token(
        address,
        symbol,
        name,
        decimals,
        10n ** BigInt(decimals)
      )
      tokensRegister.set(address, current)
    }
    return current
  }
  static NullToken = {} as Token

  toString() {
    return `${this.symbol}`
  }

  get [Symbol.toStringTag]() {
    return `Token(${this.address.toShortString()},${this.symbol})`
  }

  fromDecimal(decimalStringOrNumber: string | number): TokenQuantity {
    if (typeof decimalStringOrNumber === 'number') {
      decimalStringOrNumber = decimalStringOrNumber.toFixed(this.decimals)
    }
    return new TokenQuantity(
      this,
      ethers.utils.parseUnits(decimalStringOrNumber, this.decimals).toBigInt()
    )
  }

  fromBigInt(decimalStringOrNumber: bigint): TokenQuantity {
    return new TokenQuantity(this, decimalStringOrNumber)
  }

  fromEthersBn(decimalStringOrNumber: ethers.BigNumber): TokenQuantity {
    return new TokenQuantity(this, decimalStringOrNumber.toBigInt())
  }

  fromScale18BN(decimalStringOrNumber: ethers.BigNumber): TokenQuantity {
    const diff = Math.abs(18 - this.decimals)

    if (diff === 0) {
      return new TokenQuantity(this, decimalStringOrNumber.toBigInt())
    }
    const scale = 10n ** BigInt(diff)
    if (this.decimals < 18) {
      return this.fromBigInt(decimalStringOrNumber.toBigInt() / scale)
    } else {
      return this.fromBigInt(decimalStringOrNumber.toBigInt() * scale)
    }
  }

  from(
    decimalStringOrNumber: string | number | bigint | ethers.BigNumber
  ): TokenQuantity {
    if (
      typeof decimalStringOrNumber === 'string' ||
      typeof decimalStringOrNumber === 'number'
    ) {
      return this.fromDecimal(decimalStringOrNumber)
    } else if (typeof decimalStringOrNumber === 'bigint') {
      return this.fromBigInt(decimalStringOrNumber)
    } else {
      return this.fromEthersBn(decimalStringOrNumber)
    }
  }

  toJson() {
    return {
      address: this.address.toString(),
      symbol: this.symbol,
      name: this.name,
      decimals: this.decimals,
    }
  }
}

/**
 * A class representing a quantity of a token.
 * It can be constructed from a Token and a bigint, but the preferred way is to use the token.from method.
 *
 * @property {Token} token - The token.
 * @property {bigint} amount - The amount of the token.
 *
 * @note
 * When doing arithmetic operations, we always assume the other quantity is in the same token.
 * We will be automatically converting the other quantity to the same token.
 *
 * @example
 * const token = universe.commonTokens.USDC!
 * const quantity = token.from("12.34")
 *
 * const quantity2 = quantity.add(token.from("56.78")) // "68.12"
 *
 * // to add two different tokens, you need to convert them to the same token first
 * const token2 = universe.commonTokens.DAI!
 * const quantity3 = quantity.add(token2.from("56.78").to(token)) // "68.12"
 *
 */
export class TokenQuantity {
  constructor(public readonly token: Token, public readonly amount: bigint) {}

  public gte(other: TokenQuantity) {
    return this.amount >= other.amount
  }

  public gt(other: TokenQuantity) {
    return this.amount > other.amount
  }

  public compare(other: TokenQuantity) {
    return this.amount < other.amount
      ? -1
      : this.amount === other.amount
      ? 0
      : 1
  }

  public sub(other: TokenQuantity) {
    return new TokenQuantity(this.token, this.amount - other.amount)
  }

  public add(other: TokenQuantity) {
    return new TokenQuantity(this.token, this.amount + other.amount)
  }

  public div(other: TokenQuantity) {
    return new TokenQuantity(
      this.token,
      (this.amount * this.token.scale) / other.amount
    )
  }

  public mul(other: TokenQuantity) {
    return new TokenQuantity(
      this.token,
      (this.amount * other.amount) / this.token.scale
    )
  }

  public scalarMul(other: bigint) {
    return new TokenQuantity(this.token, this.amount * other)
  }
  public fpMul(other: bigint, scale: bigint) {
    return new TokenQuantity(this.token, (this.amount * other) / scale)
  }

  public fpDiv(other: bigint, scale: bigint) {
    return new TokenQuantity(this.token, (this.amount * scale) / other)
  }

  public scalarDiv(other: bigint) {
    return new TokenQuantity(this.token, this.amount / other)
  }

  public format(): string {
    return ethers.utils.formatUnits(this.amount, this.token.decimals)
  }

  public formatWithSymbol(): string {
    return (
      ethers.utils.formatUnits(this.amount, this.token.decimals) +
      ' ' +
      this.token.symbol
    )
  }

  public toScaled(scale: bigint) {
    return (this.amount * scale) / this.token.scale
  }

  /**
   * @deprecated use into instead
   */
  public convertTo(other: Token) {
    return this.into(other)
  }

  /**
   * Converts this quantity to another token.
   * @param other
   * @returns The quantity in the other token.
   */
  public into(other: Token) {
    return new TokenQuantity(
      other,
      (this.amount * other.scale) / this.token.scale
    )
  }

  toString() {
    return this.formatWithSymbol()
  }
}

const ONE = 10n ** 18n
export const numberOfUnits = (
  amountsIn: TokenQuantity[],
  unit: TokenQuantity[]
) => {
  let smallest = amountsIn[0].div(unit[0]).toScaled(ONE)
  for (let i = 1; i < amountsIn.length; i++) {
    const qty = amountsIn[i].div(unit[i]).toScaled(ONE)
    if (qty < smallest) {
      smallest = qty
    }
  }
  return smallest
}

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
  }

  sub(qty: TokenQuantity) {
    const b = this.tokenBalances.get(qty.token)
    this.tokenBalances.set(qty.token, b.sub(qty))
  }

  hasBalance(inputs: TokenQuantity[]) {
    return inputs.every((i) => this.get(i.token).gte(i))
  }

  exchange(tokensRemovedFromBasket: TokenQuantity[], tokensAddedToBasket: TokenQuantity[]) {
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

  addQtys(inputs: TokenQuantity[]) {
    for (const value of inputs) {
      if (value.amount === 0n) {
        continue
      }
      this.add(value)
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
