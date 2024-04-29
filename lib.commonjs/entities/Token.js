"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricedTokenQuantity = exports.numberOfUnits = exports.TokenQuantity = exports.Token = void 0;
const units_1 = require("@ethersproject/units");
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
class Token {
    address;
    symbol;
    name;
    decimals;
    scale;
    zero;
    one;
    constructor(address, symbol, name, decimals, scale) {
        this.address = address;
        this.symbol = symbol;
        this.name = name;
        this.decimals = decimals;
        this.scale = scale;
        this.zero = this.fromBigInt(0n);
        this.one = this.fromBigInt(scale);
    }
    static createToken(tokensRegister, address, symbol, name, decimals) {
        let current = tokensRegister.get(address);
        if (current == null) {
            current = new Token(address, symbol, name, decimals, 10n ** BigInt(decimals));
            tokensRegister.set(address, current);
        }
        return current;
    }
    static NullToken = {};
    toString() {
        return `${this.symbol}`;
    }
    get [Symbol.toStringTag]() {
        return `Token(${this.address.toShortString()},${this.symbol})`;
    }
    fromDecimal(decimalStringOrNumber) {
        if (typeof decimalStringOrNumber === 'number') {
            decimalStringOrNumber = decimalStringOrNumber.toFixed(this.decimals);
        }
        return new TokenQuantity(this, (0, units_1.parseUnits)(decimalStringOrNumber, this.decimals).toBigInt());
    }
    fromBigInt(decimalStringOrNumber) {
        return new TokenQuantity(this, decimalStringOrNumber);
    }
    fromEthersBn(decimalStringOrNumber) {
        return new TokenQuantity(this, decimalStringOrNumber.toBigInt());
    }
    fromScale18BN(decimalStringOrNumber) {
        const diff = Math.abs(18 - this.decimals);
        if (diff === 0) {
            return new TokenQuantity(this, decimalStringOrNumber.toBigInt());
        }
        const scale = 10n ** BigInt(diff);
        if (this.decimals < 18) {
            return this.fromBigInt(decimalStringOrNumber.toBigInt() / scale);
        }
        else {
            return this.fromBigInt(decimalStringOrNumber.toBigInt() * scale);
        }
    }
    from(decimalStringOrNumber) {
        if (typeof decimalStringOrNumber === 'string' ||
            typeof decimalStringOrNumber === 'number') {
            return this.fromDecimal(decimalStringOrNumber);
        }
        else if (typeof decimalStringOrNumber === 'bigint') {
            return this.fromBigInt(decimalStringOrNumber);
        }
        else {
            return this.fromEthersBn(decimalStringOrNumber);
        }
    }
    toJson() {
        return {
            address: this.address.toString(),
            symbol: this.symbol,
            name: this.name,
            decimals: this.decimals,
        };
    }
}
exports.Token = Token;
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
class TokenQuantity {
    token;
    amount;
    constructor(token, amount) {
        this.token = token;
        this.amount = amount;
    }
    gte(other) {
        return this.amount >= other.amount;
    }
    gt(other) {
        return this.amount > other.amount;
    }
    compare(other) {
        return this.amount < other.amount
            ? -1
            : this.amount === other.amount
                ? 0
                : 1;
    }
    sub(other) {
        return new TokenQuantity(this.token, this.amount - other.amount);
    }
    add(other) {
        return new TokenQuantity(this.token, this.amount + other.amount);
    }
    div(other) {
        return new TokenQuantity(this.token, (this.amount * this.token.scale) / other.amount);
    }
    mul(other) {
        return new TokenQuantity(this.token, (this.amount * other.amount) / this.token.scale);
    }
    scalarMul(other) {
        return new TokenQuantity(this.token, this.amount * other);
    }
    fpMul(other, scale) {
        return new TokenQuantity(this.token, (this.amount * other) / scale);
    }
    fpDiv(other, scale) {
        return new TokenQuantity(this.token, (this.amount * scale) / other);
    }
    scalarDiv(other) {
        return new TokenQuantity(this.token, this.amount / other);
    }
    format() {
        return (0, units_1.formatUnits)(this.amount, this.token.decimals);
    }
    formatWithSymbol() {
        return ((0, units_1.formatUnits)(this.amount, this.token.decimals) + ' ' + this.token.symbol);
    }
    toScaled(scale) {
        return (this.amount * scale) / this.token.scale;
    }
    /**
     * @deprecated use into instead
     */
    convertTo(other) {
        return this.into(other);
    }
    /**
     * Converts this quantity to another token.
     * @param other
     * @returns The quantity in the other token.
     */
    into(other) {
        return new TokenQuantity(other, (this.amount * other.scale) / this.token.scale);
    }
    toString() {
        return this.formatWithSymbol();
    }
}
exports.TokenQuantity = TokenQuantity;
const ONE = 10n ** 18n;
const numberOfUnits = (amountsIn, unit) => {
    let smallest = amountsIn[0].div(unit[0]).toScaled(ONE);
    for (let i = 1; i < amountsIn.length; i++) {
        const qty = amountsIn[i].div(unit[i]).toScaled(ONE);
        if (qty < smallest) {
            smallest = qty;
        }
    }
    return smallest;
};
exports.numberOfUnits = numberOfUnits;
class PricedTokenQuantity {
    quantity;
    innerPrice;
    constructor(quantity, innerPrice) {
        this.quantity = quantity;
        this.innerPrice = innerPrice;
    }
    async update(universe) {
        this.innerPrice = await universe.fairPrice(this.quantity);
    }
    get price() {
        return this.innerPrice ?? this.quantity.token.zero;
    }
    get isValid() {
        return this.innerPrice != null;
    }
    static async make(universe, quantity) {
        const valueUSD = (await universe.fairPrice(quantity)) ?? universe.usd.zero;
        return new PricedTokenQuantity(quantity, valueUSD);
    }
    [Symbol.toPrimitive]() {
        return this.toString();
    }
    [Symbol.toStringTag] = 'PricedTokenQuantity';
    toString() {
        return `${this.quantity} (${this.price})`;
    }
}
exports.PricedTokenQuantity = PricedTokenQuantity;
//# sourceMappingURL=Token.js.map