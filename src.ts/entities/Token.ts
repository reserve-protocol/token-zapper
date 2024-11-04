import { type Address } from '../base/Address'

import { parseUnits, formatUnits } from '@ethersproject/units'
import { BigNumber } from '@ethersproject/bignumber'
import { type BaseUniverse } from '../configuration/base'
import { BigNumberish } from 'ethers'
import { USD_ADDRESS } from '../base/constants'
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
  public readonly wei: TokenQuantity

  private constructor(
    public readonly address: Address,
    public readonly symbol: string,
    public readonly name: string,
    public readonly decimals: number,
    public readonly scale: bigint
  ) {
    this.zero = this.fromBigInt(0n)
    this.one = this.fromBigInt(scale)
    this.wei = this.fromBigInt(1n)
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

  serialize() {
    return {
      address: this.address.address,
      symbol: this.symbol,
    }
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
      parseUnits(decimalStringOrNumber, this.decimals).toBigInt()
    )
  }

  fromBigInt(decimalStringOrNumber: bigint): TokenQuantity {
    return new TokenQuantity(this, decimalStringOrNumber)
  }

  fromEthersBn(decimalStringOrNumber: BigNumber): TokenQuantity {
    return new TokenQuantity(this, decimalStringOrNumber.toBigInt())
  }

  fromScale18BN(decimalStringOrNumber: BigNumberish): TokenQuantity {
    decimalStringOrNumber = BigNumber.from(decimalStringOrNumber)
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
    decimalStringOrNumber: string | number | bigint | BigNumber
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

  serialize() {
    return {
      token: this.token.serialize(),
      amount: this.amount.toString(),
      formatted: this.toString(),
    }
  }

  public get isZero() {
    return this.amount === 0n
  }

  public get isOne() {
    return this.amount === this.token.scale
  }

  public get isPositive() {
    return this.amount > 0n
  }

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

  public asNumber() {
    return parseFloat(this.format())
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
    return formatUnits(this.amount, this.token.decimals)
  }

  public formatWithSymbol(): string {
    if (this.token.address.address === USD_ADDRESS) {
      let digits = this.token.decimals
      if (this.amount > 1000000n) {
        digits = 2
      }

      return `$ ${formatUnits(this.amount, digits)}`
    }

    return (
      formatUnits(this.amount, this.token.decimals) + ' ' + this.token.symbol
    )
  }

  public withPrice(price: TokenQuantity) {
    return new PricedTokenQuantity(this, price)
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

export class PricedTokenQuantity {
  constructor(
    public readonly quantity: TokenQuantity,
    private innerPrice: TokenQuantity | null
  ) {}

  serialize() {
    return {
      quantity: this.quantity.serialize(),
      price: this.price?.serialize() ?? null,
    }
  }

  public async update(universe: {
    fairPrice: (qty: TokenQuantity) => Promise<TokenQuantity | null>
  }) {
    this.innerPrice = await universe.fairPrice(this.quantity)
  }

  public get price() {
    return this.innerPrice ?? this.quantity.token.zero
  }

  public get isValid() {
    return this.innerPrice != null
  }

  public static async make(universe: BaseUniverse, quantity: TokenQuantity) {
    const valueUSD = (await universe.fairPrice(quantity)) ?? universe.usd.zero
    return new PricedTokenQuantity(quantity, valueUSD)
  }

  [Symbol.toPrimitive](): string {
    return this.toString()
  }

  readonly [Symbol.toStringTag] = 'PricedTokenQuantity'

  toString() {
    return `${this.quantity} (${this.price})`
  }
}
