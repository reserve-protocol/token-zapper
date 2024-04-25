"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouterAction = void 0;
const Approval_1 = require("../base/Approval");
const Action_1 = require("./Action");
const RouterAction = (protocol) => class RouterAction extends (0, Action_1.Action)(protocol) {
    dex;
    universe;
    router;
    async plan(planner, inputs, destination, predicted) {
        const res = await this.innerQuote(predicted);
        for (const step of res.steps) {
            inputs = await step.action.plan(planner, inputs, destination, predicted);
            predicted = step.outputs;
        }
        return inputs;
    }
    gasEstimate() {
        return BigInt(300000n);
    }
    async innerQuote(input) {
        return await this.dex.swap(this.universe.execAddress, this.universe.execAddress, input[0], this.outputToken[0], 0);
    }
    async quote([amountsIn]) {
        const out = await this.innerQuote([amountsIn]);
        return out.outputs;
    }
    constructor(dex, universe, router, inputToken, outputToken) {
        super(universe.execAddress, [inputToken], [outputToken], Action_1.InteractionConvention.ApprovalRequired, Action_1.DestinationOptions.Callee, [new Approval_1.Approval(inputToken, router)]);
        this.dex = dex;
        this.universe = universe;
        this.router = router;
        if (this.inputToken.length !== 1 || this.outputToken.length !== 1) {
            throw new Error('RouterAction requires exactly one input and one output');
        }
    }
    toString() {
        return `Trade(router: ${this.dex.name}, ${this.inputToken.join(', ')} -> ${this.outputToken.join(', ')})`;
    }
};
exports.RouterAction = RouterAction;
//# sourceMappingURL=RouterAction.js.map