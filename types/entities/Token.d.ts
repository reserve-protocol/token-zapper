import { type Address } from '../base/Address';
import { BigNumber } from '@ethersproject/bignumber';
import { type BaseUniverse } from '../configuration/base';
import { BigNumberish } from 'ethers';
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
    static NullToken: Token;
    toString(): string;
    serialize(): {
        address: string;
        symbol: string;
    };
    get [Symbol.toStringTag](): string;
    fromDecimal(decimalStringOrNumber: string | number): TokenQuantity;
    fromBigInt(decimalStringOrNumber: bigint): TokenQuantity;
    fromEthersBn(decimalStringOrNumber: BigNumber): TokenQuantity;
    fromScale18BN(decimalStringOrNumber: BigNumberish): TokenQuantity;
    from(decimalStringOrNumber: string | number | bigint | BigNumber): TokenQuantity;
    toJson(): {
        address: string;
        symbol: string;
        name: string;
        decimals: number;
    };
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
export declare class TokenQuantity {
    readonly token: Token;
    readonly amount: bigint;
    constructor(token: Token, amount: bigint);
    serialize(): {
        token: {
            address: string;
            symbol: string;
        };
        amount: string;
        formatted: string;
    };
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
    /**
     * @deprecated use into instead
     */
    convertTo(other: Token): TokenQuantity;
    /**
     * Converts this quantity to another token.
     * @param other
     * @returns The quantity in the other token.
     */
    into(other: Token): TokenQuantity;
    toString(): string;
}
export declare const numberOfUnits: (amountsIn: TokenQuantity[], unit: TokenQuantity[]) => bigint;
export declare class PricedTokenQuantity {
    readonly quantity: TokenQuantity;
    private innerPrice;
    constructor(quantity: TokenQuantity, innerPrice: TokenQuantity | null);
    serialize(): {
        quantity: {
            token: {
                address: string;
                symbol: string;
            };
            amount: string;
            formatted: string;
        };
        price: {
            token: {
                address: string;
                symbol: string;
            };
            amount: string;
            formatted: string;
        };
    };
    update(universe: {
        fairPrice: (qty: TokenQuantity) => Promise<TokenQuantity | null>;
    }): Promise<void>;
    get price(): TokenQuantity;
    get isValid(): boolean;
    static make(universe: BaseUniverse, quantity: TokenQuantity): Promise<PricedTokenQuantity>;
    [Symbol.toPrimitive](): string;
    readonly [Symbol.toStringTag] = "PricedTokenQuantity";
    toString(): string;
}
//# sourceMappingURL=Token.d.ts.map