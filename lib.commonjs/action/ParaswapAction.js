"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParaswapAction = void 0;
const __1 = require("..");
const Approval_1 = require("../base/Approval");
const Action_1 = require("./Action");
class ParaswapAction extends (0, Action_1.Action)('Paraswap') {
    universe;
    tx;
    inputQuantity;
    outputQuantity;
    plan(planner, inputs, destination, predictedInputs) {
        throw new Error('Method not implemented.');
    }
    constructor(universe, tx, inputQuantity, outputQuantity) {
        super(__1.Address.from(tx.to), [inputQuantity.token], [outputQuantity.token], Action_1.InteractionConvention.ApprovalRequired, Action_1.DestinationOptions.Recipient, [new Approval_1.Approval(inputQuantity.token, __1.Address.from(tx.to))]);
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
    static createAction(universe, input, output, tx) {
        return new ParaswapAction(universe, tx, input, output);
    }
}
exports.ParaswapAction = ParaswapAction;
//# sourceMappingURL=ParaswapAction.js.map