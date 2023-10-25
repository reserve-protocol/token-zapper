import { Address } from "..";
import { ContractCall } from "../base/ContractCall";
import { Action, DestinationOptions, InteractionConvention } from "./Action";
import { Approval } from "../base/Approval";
import { parseHexStringIntoBuffer } from "../base/utils";
export class ParaswapAction extends Action {
    universe;
    tx;
    outputQuantity;
    constructor(universe, tx, input, outputQuantity) {
        super(Address.from(tx.to), [input.token], [outputQuantity.token], InteractionConvention.ApprovalRequired, DestinationOptions.Recipient, [new Approval(input.token, Address.from(tx.to))]);
        this.universe = universe;
        this.tx = tx;
        this.outputQuantity = outputQuantity;
    }
    async quote(_) {
        return [this.outputQuantity];
    }
    gasEstimate() {
        return 200000n;
    }
    async encode(amountsIn, destination, bytes) {
        return new ContractCall(parseHexStringIntoBuffer(this.tx.data), Address.from(this.tx.to), BigInt(this.tx.value), this.gasEstimate(), "Swap (Paraswap)");
    }
    static createAction(universe, input, output, tx) {
        return new ParaswapAction(universe, tx, input, output);
    }
}
//# sourceMappingURL=ParaswapAction.js.map