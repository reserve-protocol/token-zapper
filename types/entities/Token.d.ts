import { type Address } from '../base/Address';
import { DefaultMap } from '../base/DefaultMap';
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
    fromDecimal(decimalStringOrNumber: string | number): TokenQuantity;
    quantityFromBigInt(decimalStringOrNumber: bigint): TokenQuantity;
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
//# sourceMappingURL=Token.d.ts.map