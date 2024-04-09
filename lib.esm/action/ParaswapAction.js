import { Address } from "..";
import { Approval } from "../base/Approval";
import { ContractCall } from "../base/ContractCall";
import { parseHexStringIntoBuffer } from "../base/utils";
import { Action, DestinationOptions, InteractionConvention } from "./Action";
export class ParaswapAction extends Action {
    universe;
    tx;
    inputQuantity;
    outputQuantity;
    plan(planner, inputs, destination, predictedInputs) {
        throw new Error("Method not implemented.");
    }
    constructor(universe, tx, inputQuantity, outputQuantity) {
        super(Address.from(tx.to), [inputQuantity.token], [outputQuantity.token], InteractionConvention.ApprovalRequired, DestinationOptions.Recipient, [new Approval(inputQuantity.token, Address.from(tx.to))]);
        this.universe = universe;
        this.tx = tx;
        this.inputQuantity = inputQuantity;
        this.outputQuantity = outputQuantity;
    }
    async quote(_) {
        return [this.outputQuantity];
    }
    gasEstimate() {
        return 200000n;
    }
    toString() {
        return `ParaswapAction(${this.inputQuantity} => ${this.outputQuantity})`;
    }
    async encode(amountsIn, destination, bytes) {
        return new ContractCall(parseHexStringIntoBuffer(this.tx.data), Address.from(this.tx.to), BigInt(this.tx.value), this.gasEstimate(), "Swap (Paraswap)");
    }
    static createAction(universe, input, output, tx) {
        return new ParaswapAction(universe, tx, input, output);
    }
}
//# sourceMappingURL=ParaswapAction.js.map