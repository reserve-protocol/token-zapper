import { type Address } from '../base/Address';
import { DefaultMap } from '../base/DefaultMap';
import { ethers } from 'ethers';
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
export declare class Token {
    readonly address: Address;
    readonly symbol: string;
    readonly name: string;
    readonly decimals: number;
    readonly scale: bigint;
    readonly zero: TokenQuantity;
    readonly one: TokenQuantity;
    private constructor();
    static createToken(tokensRegister: Map<Address, Token>, address: Address, symbol: string, name: string, decimals: number): Token;
    toString(): string;
    get [Symbol.toStringTag](): string;
    fromDecimal(decimalStringOrNumber: string | number): TokenQuantity;
    fromBigInt(decimalStringOrNumber: bigint): TokenQuantity;
    fromEthersBn(decimalStringOrNumber: ethers.BigNumber): TokenQuantity;
    from(decimalStringOrNumber: string | number | bigint | ethers.BigNumber): TokenQuantity;
}
export declare class TokenQuantity {
    readonly token: Token;
    readonly amount: bigint;
    constructor(token: Token, amount: bigint);
    gte(other: TokenQuantity): boolean;
    gt(other: TokenQuantity): boolean;
    compare(other: TokenQuantity): 0 | 1 | -1;
    sub(other: TokenQuantity): TokenQuantity;
    add(other: TokenQuantity): TokenQuantity;
    div(other: TokenQuantity): TokenQuantity;
    mul(other: TokenQuantity): TokenQuantity;
    scalarMul(other: bigint): TokenQuantity;
    fpMul(other: bigint, scale: bigint): TokenQuantity;
    fpDiv(other: bigint, scale: bigint): TokenQuantity;
    scalarDiv(other: bigint): TokenQuantity;
    format(): string;
    formatWithSymbol(): string;
    toScaled(scale: bigint): bigint;
    convertTo(other: Token): TokenQuantity;
    toString(): string;
}
export declare const numberOfUnits: (amountsIn: TokenQuantity[], unit: TokenQuantity[]) => bigint;
export declare class TokenAmounts {
    tokenBalances: DefaultMap<Token, TokenQuantity>;
    static fromQuantities(qtys: TokenQuantity[]): TokenAmounts;
    toTokenQuantities(): TokenQuantity[];
    get(tok: Token): TokenQuantity;
    add(qty: TokenQuantity): void;
    sub(qty: TokenQuantity): void;
    hasBalance(inputs: TokenQuantity[]): boolean;
    exchange(inputs: TokenQuantity[], outputs: TokenQuantity[]): void;
    addAll(input: TokenAmounts): void;
    toString(): string;
    clone(): TokenAmounts;
}
