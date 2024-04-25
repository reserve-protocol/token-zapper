"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasketTokenSourcingRuleApplication = exports.PostTradeAction = void 0;
const TokenAmounts_1 = require("../entities/TokenAmounts");
class PostTradeAction {
    inputAsFractionOfCurrentBalance;
    action;
    postTradeActions;
    updateBalances;
    constructor(inputAsFractionOfCurrentBalance, action, postTradeActions, updateBalances = false) {
        this.inputAsFractionOfCurrentBalance = inputAsFractionOfCurrentBalance;
        this.action = action;
        this.postTradeActions = postTradeActions;
        this.updateBalances = updateBalances;
    }
    describe() {
        const out = [];
        out.push(`PostTradeAction {`);
        out.push(`  inputAsFractionOfCurrentBalance: ${this.inputAsFractionOfCurrentBalance
            .map((i) => '(' + i.token.symbol + ' ' + i.scalarMul(100n).format() + '%)')
            .join(', ')}`);
        out.push(`  update: ${this.updateBalances}`);
        out.push(`  action: ${this.action?.toString()}`);
        this.postTradeActions
            ?.filter((child) => {
            if (child.action == null &&
                (child.postTradeActions == null ||
                    child.postTradeActions.length === 0)) {
                return false;
            }
            return true;
        })
            .forEach((child, i) => {
            const desc = child.describe();
            out.push(`  step ${i + 1}: ${desc[0]}`);
            desc.slice(1).forEach((line) => out.push(`    ${line}`));
        });
        out.push('}');
        return out;
    }
    static fromAction(action, update) {
        return new PostTradeAction(action.inputToken.map((input) => input.one), action, [], update);
    }
    static from(action, postTradeActions, update) {
        return new PostTradeAction(action.inputToken.map((input) => input.one), action, postTradeActions, update);
    }
    static create(input, action, postTradeActions) {
        return new PostTradeAction(input, action, postTradeActions);
    }
}
exports.PostTradeAction = PostTradeAction;
class BasketTokenSourcingRuleApplication {
    precursorToTradeFor;
    postTradeActions;
    constructor(precursorToTradeFor, postTradeActions) {
        this.precursorToTradeFor = precursorToTradeFor;
        this.postTradeActions = postTradeActions;
    }
    describe() {
        const out = [];
        out.push(`SourcingRuleApplication {`);
        out.push(`  tokensPrUnit: ${this.precursorToTradeFor.join(', ')}`);
        this.postTradeActions?.forEach((child, i) => {
            const desc = child.describe();
            out.push(`  step ${i + 1}: ${desc[0]}`);
            desc.slice(1).forEach((line) => out.push(`    ${line}`));
        });
        out.push('}');
        return out;
    }
    static create(precursorToTradeFor, postTradeActions) {
        return new BasketTokenSourcingRuleApplication(precursorToTradeFor, postTradeActions ? [postTradeActions] : []);
    }
    static fromBranches(branches, action) {
        const precursors = TokenAmounts_1.TokenAmounts.fromQuantities(branches.map((i) => i.precursorToTradeFor).flat());
        const subActions = branches.map((i) => new PostTradeAction(TokenAmounts_1.TokenAmounts.fromQuantities(i.precursorToTradeFor)
            .recalculateAsFractionOf(precursors)
            .toTokenQuantities(), undefined, i.postTradeActions));
        if (action) {
            const combinedAction = PostTradeAction.from(action, subActions);
            return new BasketTokenSourcingRuleApplication(precursors.toTokenQuantities(), [
                combinedAction,
            ]);
        }
        const inputs = precursors.toTokenQuantities();
        return new BasketTokenSourcingRuleApplication(inputs, subActions);
    }
    static fromActionWithDependencies(action, branches) {
        const precursors = TokenAmounts_1.TokenAmounts.fromQuantities(branches.map((i) => i.precursorToTradeFor).flat());
        const execFirst = branches.map((i, ith) => new PostTradeAction(TokenAmounts_1.TokenAmounts.fromQuantities(i.precursorToTradeFor)
            .recalculateAsFractionOf(precursors)
            .toTokenQuantities(), undefined, i.postTradeActions, ith === branches.length - 1));
        const lastAction = PostTradeAction.from(action);
        const inputs = precursors.toTokenQuantities();
        return new BasketTokenSourcingRuleApplication(inputs, [...execFirst, lastAction]);
    }
    static singleBranch(precursorToTradeFor, postTradeActions) {
        return new BasketTokenSourcingRuleApplication(precursorToTradeFor, postTradeActions);
    }
    static noAction(precursorToTradeFor) {
        return new BasketTokenSourcingRuleApplication(precursorToTradeFor, []);
    }
}
exports.BasketTokenSourcingRuleApplication = BasketTokenSourcingRuleApplication;
//# sourceMappingURL=BasketTokenSourcingRules.js.map