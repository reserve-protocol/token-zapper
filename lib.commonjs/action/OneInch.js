"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OneInchAction = void 0;
const Address_1 = require("../base/Address");
const Action_1 = require("./Action");
const ContractCall_1 = require("../base/ContractCall");
const Approval_1 = require("../base/Approval");
const utils_1 = require("../base/utils");
// OneInch actions should only be dynamically generated by the Searcher and not be added to the exchange-graph
class OneInchAction extends Action_1.Action {
    universe;
    outputToken;
    actionQuote;
    gasEstimate() {
        return BigInt(this.actionQuote.tx.gas);
    }
    async encode() {
        const swap = this.actionQuote;
        if (swap == null) {
            throw new Error('Failed to generate swap');
        }
        return new ContractCall_1.ContractCall((0, utils_1.parseHexStringIntoBuffer)(swap.tx.data), Address_1.Address.fromHexString(swap.tx.to), BigInt(swap.tx.value), this.gasEstimate(), `1Inch Swap (${this.input.join(",")}) -> (${this.output[0].from(BigInt(this.actionQuote.toAmount))}})`);
    }
    toString() {
        return `OneInch(path=[...])`;
    }
    outputQty;
    async quote(_) {
        return [this.outputQty];
    }
    constructor(universe, inputToken, outputToken, actionQuote, slippagePercent) {
        super(Address_1.Address.fromHexString(actionQuote.tx.to), [inputToken], [outputToken], Action_1.InteractionConvention.ApprovalRequired, Action_1.DestinationOptions.Recipient, [new Approval_1.Approval(inputToken, Address_1.Address.fromHexString(actionQuote.tx.to))]);
        this.universe = universe;
        this.outputToken = outputToken;
        this.actionQuote = actionQuote;
        this.outputQty = this.outputToken
            .fromBigInt(BigInt(this.actionQuote.toAmount))
            .mul(outputToken.fromDecimal((100 - slippagePercent) / 100));
    }
    static createAction(universe, input, output, quote, slippagePercent) {
        return new OneInchAction(universe, input, output, quote, slippagePercent);
    }
}
exports.OneInchAction = OneInchAction;
//# sourceMappingURL=OneInch.js.map