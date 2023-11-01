import { Address } from '../base/Address';
import { DestinationOptions, Action, InteractionConvention } from './Action';
import { ContractCall } from '../base/ContractCall';
import { Approval } from '../base/Approval';
import { parseHexStringIntoBuffer } from '../base/utils';
// OneInch actions should only be dynamically generated by the Searcher and not be added to the exchange-graph
export class OneInchAction extends Action {
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
        return new ContractCall(parseHexStringIntoBuffer(swap.tx.data), Address.fromHexString(swap.tx.to), BigInt(swap.tx.value), this.gasEstimate(), `1Inch Swap (${this.input.join(",")}) -> (${this.output[0].from(BigInt(this.actionQuote.toAmount))})`);
    }
    toString() {
        return `OneInch(path=[...])`;
    }
    outputQty;
    async quote(_) {
        return [this.outputQty];
    }
    constructor(universe, inputToken, outputToken, actionQuote, slippagePercent) {
        super(Address.fromHexString(actionQuote.tx.to), [inputToken], [outputToken], InteractionConvention.ApprovalRequired, DestinationOptions.Recipient, [new Approval(inputToken, Address.fromHexString(actionQuote.tx.to))]);
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
//# sourceMappingURL=OneInch.js.map