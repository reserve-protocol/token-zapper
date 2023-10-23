"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParaswapAction = void 0;
const __1 = require("..");
const ContractCall_1 = require("../base/ContractCall");
const Action_1 = require("./Action");
const Approval_1 = require("../base/Approval");
const utils_1 = require("../base/utils");
class ParaswapAction extends Action_1.Action {
    universe;
    tx;
    outputQuantity;
    constructor(universe, tx, input, outputQuantity) {
        super(__1.Address.from(tx.to), [input.token], [outputQuantity.token], Action_1.InteractionConvention.ApprovalRequired, Action_1.DestinationOptions.Recipient, [new Approval_1.Approval(input.token, __1.Address.from(tx.to))]);
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
        return new ContractCall_1.ContractCall((0, utils_1.parseHexStringIntoBuffer)(this.tx.data), __1.Address.from(this.tx.to), BigInt(this.tx.value), this.gasEstimate(), "Swap (Paraswap)");
    }
    static createAction(universe, input, output, tx) {
        return new ParaswapAction(universe, tx, input, output);
    }
}
exports.ParaswapAction = ParaswapAction;
//# sourceMappingURL=ParaswapAction.js.map