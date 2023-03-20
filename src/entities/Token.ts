import { type Address } from '../base/Address'
import { DefaultMap } from '../base/DefaultMap'
import { ethers } from 'ethers'

export class Token {
  public readonly zero: TokenQuantity

  private constructor (
    public readonly address: Address,
    public readonly symbol: string,
    public readonly name: string,
    public readonly decimals: number,
    public readonly scale: bigint
  ) {
    this.zero = this.quantityFromBigInt(0n)
  }

  static createToken (
    tokensRegister: Map<Address, Token>,
    address: Address,
    symbol: string,
    name: string,
    decimals: number
  ): Token {
    let current = tokensRegister.get(address)
    if (current == null) {
      current = new Token(address, symbol, name, decimals, 10n ** BigInt(decimals))
      tokensRegister.set(address, current)
    }
    return current
  }

  toString () {
    return `Token(${this.symbol})`
  }

  fromDecimal (decimalStringOrNumber: string | number): TokenQuantity {
    return new TokenQuantity(
      this,
      ethers.utils.parseUnits(decimalStringOrNumber.toString(), this.decimals).toBigInt()
    )
  }

  quantityFromBigInt (decimalStringOrNumber: bigint): TokenQuantity {
    return new TokenQuantity(
      this,
      decimalStringOrNumber
    )
  }
}

export class TokenQuantity {
  constructor (
    public readonly token: Token,
    public readonly amount: bigint
  ) { }

  public gte (other: TokenQuantity) {
    console.assert(other.token === this.token)
    return this.amount >= other.amount
  }

  public gt (other: TokenQuantity) {
    console.assert(other.token === this.token)
    return this.amount > other.amount
  }

  public compare (other: TokenQuantity) {
    console.assert(other.token === this.token)
    return this.amount < other.amount ? -1 : this.amount === other.amount ? 0 : 1
  }

  public sub (other: TokenQuantity) {
    console.assert(other.token === this.token)
    return new TokenQuantity(this.token, this.amount - other.amount)
  }

  public add (other: TokenQuantity) {
    console.assert(other.token === this.token)
    return new TokenQuantity(this.token, this.amount + other.amount)
  }

  public div (other: TokenQuantity) {
    console.assert(other.token === this.token)
    return new TokenQuantity(this.token, this.amount * this.token.scale / other.amount)
  }

  public mul (other: TokenQuantity) {
    console.assert(other.token === this.token)
    return new TokenQuantity(this.token, this.amount * other.amount / this.token.scale)
  }

  public scalarMul (other: bigint) {
    return new TokenQuantity(this.token, this.amount * other)
  }

  public scalarDiv (other: bigint) {
    return new TokenQuantity(this.token, this.amount / other)
  }

  public format (): string {
    return ethers.utils.formatUnits(this.amount, this.token.decimals)
  }

  public formatWithSymbol (): string {
    return ethers.utils.formatUnits(this.amount, this.token.decimals) + ' ' + this.token.symbol
  }

  public convertTo (other: Token) {
    return new TokenQuantity(other, this.amount * other.scale / this.token.scale)
  }

  toString () {
    return `TokenQuantity(${this.formatWithSymbol()})`
  }
}

export class TokenAmounts {
  public tokenBalances = new DefaultMap<Token, TokenQuantity>(tok => tok.quantityFromBigInt(0n))
  get (tok: Token) {
    return tok.quantityFromBigInt(this.tokenBalances.get(tok).amount)
  }

  add (qty: TokenQuantity) {
    const b = this.tokenBalances.get(qty.token)
    this.tokenBalances.set(qty.token, b.add(qty))
  }

  sub (qty: TokenQuantity) {
    const b = this.tokenBalances.get(qty.token)
    this.tokenBalances.set(qty.token, b.sub(qty))
  }

  exchange (inputs: TokenQuantity[], outputs: TokenQuantity[]) {
    if (!inputs.every(i => this.get(i.token).gte(i))) {
      throw new Error('Insufficient balance')
    }
    inputs.forEach(input => { this.sub(input) })
    outputs.forEach(outputs => { this.add(outputs) })
  }

  toString () {
    return `TokenAmounts(${[...this.tokenBalances.values()].map(qty => qty.formatWithSymbol()).join(', ')})`
  }

  clone () {
    const out = new TokenAmounts()
    for (const amount of this.tokenBalances.values()) {
      out.tokenBalances.set(amount.token, amount)
    }
    return out
  }
}
