"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouterAction = void 0;
const Approval_1 = require("../base/Approval");
const Action_1 = require("./Action");
class RouterAction extends (0, Action_1.Action)('Router') {
    dex;
    universe;
    router;
    slippage;
    get outputSlippage() {
        return this.universe.config.defaultInternalTradeSlippage;
    }
    async plan(planner, inputs, destination, predicted) {
        const res = await this.innerQuote(predicted);
        for (const step of res.steps) {
            inputs = await step.action.planWithOutput(this.universe, planner, inputs, destination, predicted);
            predicted = step.outputs;
        }
        return inputs;
    }
    gasEstimate() {
        return BigInt(300000n);
    }
    async innerQuote(input) {
        return await this.dex.swap(AbortSignal.timeout(this.universe.config.routerDeadline), input[0], this.outputToken[0], this.universe.config.defaultInternalTradeSlippage);
    }
    async quote([amountsIn]) {
        const out = await this.innerQuote([amountsIn]);
        return out.outputs;
    }
    constructor(dex, universe, router, inputToken, outputToken, slippage) {
        super(universe.execAddress, [inputToken], [outputToken], Action_1.InteractionConvention.ApprovalRequired, Action_1.DestinationOptions.Callee, [new Approval_1.Approval(inputToken, router)]);
        this.dex = dex;
        this.universe = universe;
        this.router = router;
        this.slippage = slippage;
        if (this.inputToken.length !== 1 || this.outputToken.length !== 1) {
            throw new Error('RouterAction requires exactly one input and one output');
        }
    }
    toString() {
        return `Router[${this.dex.name}](${this.inputToken.join(', ')} -> ${this.outputToken.join(', ')})`;
    }
}
exports.RouterAction = RouterAction;
//# sourceMappingURL=RouterAction.js.map