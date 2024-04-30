import { Approval } from '../base/Approval';
import { Action, DestinationOptions, InteractionConvention } from './Action';
export const RouterAction = (protocol) => class RouterAction extends Action(protocol) {
    dex;
    universe;
    router;
    slippage;
    get outputSlippage() {
        return this.slippage;
    }
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
        return await this.dex.swap(AbortSignal.timeout(2000), this.universe.execAddress, this.universe.execAddress, input[0], this.outputToken[0], 0n);
    }
    async quote([amountsIn]) {
        const out = await this.innerQuote([amountsIn]);
        return out.outputs;
    }
    constructor(dex, universe, router, inputToken, outputToken, slippage) {
        super(universe.execAddress, [inputToken], [outputToken], InteractionConvention.ApprovalRequired, DestinationOptions.Callee, [new Approval(inputToken, router)]);
        this.dex = dex;
        this.universe = universe;
        this.router = router;
        this.slippage = slippage;
        if (this.inputToken.length !== 1 || this.outputToken.length !== 1) {
            throw new Error('RouterAction requires exactly one input and one output');
        }
    }
    toString() {
        return `Trade(router: ${this.dex.name}, ${this.inputToken.join(', ')} -> ${this.outputToken.join(', ')})`;
    }
};
//# sourceMappingURL=RouterAction.js.map