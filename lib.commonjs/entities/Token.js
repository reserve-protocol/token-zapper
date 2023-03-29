"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenAmounts = exports.numberOfUnits = exports.TokenQuantity = exports.Token = void 0;
const DefaultMap_1 = require("../base/DefaultMap");
const ethers_1 = require("ethers");
// This class describes a token, which is identified by its address.
// Each token has a symbol, a name, and a number of decimals.
// A token's scale is calculated as 10^decimals.
// The zero and one TokenQuantities are also calculated and stored.
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
        this.zero = this.quantityFromBigInt(0n);
        this.one = this.quantityFromBigInt(scale);
    }
    static createToken(tokensRegister, address, symbol, name, decimals) {
        let current = tokensRegister.get(address);
        if (current == null) {
            current = new Token(address, symbol, name, decimals, 10n ** BigInt(decimals));
            tokensRegister.set(address, current);
        }
        return current;
    }
    toString() {
        return `Token(${this.symbol})`;
    }
    fromDecimal(decimalStringOrNumber) {
        return new TokenQuantity(this, ethers_1.ethers.utils
            .parseUnits(decimalStringOrNumber.toString(), this.decimals)
            .toBigInt());
    }
    quantityFromBigInt(decimalStringOrNumber) {
        return new TokenQuantity(this, decimalStringOrNumber);
    }
}
exports.Token = Token;
class TokenQuantity {
    token;
    amount;
    constructor(token, amount) {
        this.token = token;
        this.amount = amount;
    }
    gte(other) {
        console.assert(other.token === this.token);
        return this.amount >= other.amount;
    }
    gt(other) {
        console.assert(other.token === this.token);
        return this.amount > other.amount;
    }
    compare(other) {
        console.assert(other.token === this.token);
        return this.amount < other.amount
            ? -1
            : this.amount === other.amount
                ? 0
                : 1;
    }
    sub(other) {
        console.assert(other.token === this.token);
        return new TokenQuantity(this.token, this.amount - other.amount);
    }
    add(other) {
        console.assert(other.token === this.token);
        return new TokenQuantity(this.token, this.amount + other.amount);
    }
    div(other) {
        console.assert(other.token === this.token);
        return new TokenQuantity(this.token, (this.amount * this.token.scale) / other.amount);
    }
    mul(other) {
        console.assert(other.token === this.token);
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
        return ethers_1.ethers.utils.formatUnits(this.amount, this.token.decimals);
    }
    formatWithSymbol() {
        return (ethers_1.ethers.utils.formatUnits(this.amount, this.token.decimals) +
            ' ' +
            this.token.symbol);
    }
    toScaled(scale) {
        return (this.amount * scale) / this.token.scale;
    }
    convertTo(other) {
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
class TokenAmounts {
    tokenBalances = new DefaultMap_1.DefaultMap((tok) => tok.quantityFromBigInt(0n));
    static fromQuantities(qtys) {
        const out = new TokenAmounts();
        qtys.forEach((qty) => out.add(qty));
        return out;
    }
    toTokenQuantities() {
        return [...this.tokenBalances.values()].filter((i) => i.amount !== 0n);
    }
    get(tok) {
        return tok.quantityFromBigInt(this.tokenBalances.get(tok).amount);
    }
    add(qty) {
        const b = this.tokenBalances.get(qty.token);
        this.tokenBalances.set(qty.token, b.add(qty));
    }
    sub(qty) {
        const b = this.tokenBalances.get(qty.token);
        this.tokenBalances.set(qty.token, b.sub(qty));
    }
    hasBalance(inputs) {
        return inputs.every((i) => this.get(i.token).gte(i));
    }
    exchange(inputs, outputs) {
        if (!this.hasBalance(inputs)) {
            throw new Error('Insufficient balance');
        }
        inputs.forEach((input) => {
            this.sub(input);
        });
        outputs.forEach((outputs) => {
            this.add(outputs);
        });
    }
    addAll(input) {
        for (const value of input.tokenBalances.values()) {
            if (value.amount === 0n) {
                continue;
            }
            this.add(value);
        }
    }
    toString() {
        return `TokenAmounts(${[...this.tokenBalances.values()]
            .map((qty) => qty.formatWithSymbol())
            .join(', ')})`;
    }
    clone() {
        const out = new TokenAmounts();
        for (const amount of this.tokenBalances.values()) {
            out.tokenBalances.set(amount.token, amount);
        }
        return out;
    }
}
exports.TokenAmounts = TokenAmounts;
//# sourceMappingURL=Token.js.map