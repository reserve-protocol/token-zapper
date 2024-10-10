"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenAmounts = void 0;
const DefaultMap_1 = require("../base/DefaultMap");
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
class TokenAmounts {
    tokenBalances = new DefaultMap_1.DefaultMap((tok) => tok.fromBigInt(0n));
    static fromQuantities(qtys) {
        const out = new TokenAmounts();
        qtys.forEach((qty) => out.add(qty));
        return out;
    }
    toTokenQuantities() {
        return [...this.tokenBalances.values()].filter((i) => i.amount !== 0n);
    }
    get(tok) {
        return tok.fromBigInt(this.tokenBalances.get(tok).amount);
    }
    add(qty) {
        const b = this.tokenBalances.get(qty.token);
        this.tokenBalances.set(qty.token, b.add(qty));
        return this;
    }
    sub(qty) {
        const b = this.tokenBalances.get(qty.token);
        this.tokenBalances.set(qty.token, b.sub(qty));
    }
    hasBalance(inputs) {
        return inputs.every((i) => this.tokenBalances.has(i.token) ? this.get(i.token).gte(i) : i.token.zero.gte(i));
    }
    exchange(tokensRemovedFromBasket, tokensAddedToBasket) {
        if (!this.hasBalance(tokensRemovedFromBasket)) {
            throw new Error('Insufficient balance');
        }
        tokensAddedToBasket.forEach((outputs) => {
            this.add(outputs);
        });
        tokensRemovedFromBasket.forEach((input) => {
            this.sub(input);
        });
    }
    multiplyFractions(inputs, convertZeroToOne = false) {
        return TokenAmounts.fromQuantities(inputs.map((input) => {
            let current = this.get(input.token);
            if (current.amount === 0n && convertZeroToOne) {
                current = input.token.one;
            }
            return current.mul(input);
        }));
    }
    recalculateAsFractionOf(parent) {
        return TokenAmounts.fromQuantities([...this.tokenBalances.values()].map((qty) => qty.div(parent.get(qty.token))));
    }
    addAll(input) {
        this.addQtys(input.toTokenQuantities());
    }
    subAll(input) {
        this.subQtys(input.toTokenQuantities());
    }
    addQtys(inputs) {
        for (const value of inputs) {
            if (value.amount === 0n) {
                continue;
            }
            this.add(value);
        }
    }
    subQtys(inputs) {
        for (const value of inputs) {
            if (value.amount === 0n) {
                continue;
            }
            this.sub(value);
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
//# sourceMappingURL=TokenAmounts.js.map