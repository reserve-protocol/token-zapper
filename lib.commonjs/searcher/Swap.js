"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwapPlan = exports.SwapPaths = exports.SwapPath = exports.SingleSwap = void 0;
/**
 * A single Step token exchange
 */
class SingleSwap {
    input;
    action;
    output;
    constructor(input, action, output) {
        this.input = input;
        this.action = action;
        this.output = output;
    }
    async exchange(tokenAmounts) {
        await this.action.exchange(this.input, tokenAmounts);
    }
    toString() {
        return `SingleSwap(input: ${this.input
            .map((i) => i.formatWithSymbol())
            .join(', ')}, action: ${this.action}, output: ${this.output
            .map((i) => i.formatWithSymbol())
            .join(', ')})`;
    }
}
exports.SingleSwap = SingleSwap;
/**
 * A SwapPath groups a set of actions together
 */
class SwapPath {
    universe;
    inputs;
    steps;
    outputs;
    outputValue;
    destination;
    constructor(universe, inputs, steps, outputs, outputValue, destination) {
        this.universe = universe;
        this.inputs = inputs;
        this.steps = steps;
        this.outputs = outputs;
        this.outputValue = outputValue;
        this.destination = destination;
    }
    async exchange(tokenAmounts) {
        for (const step of this.steps) {
            await step.exchange(tokenAmounts);
        }
    }
    // This is a bad way to compare, ideally the USD value gets compared
    compare(other) {
        const comp = this.outputValue.compare(other.outputValue);
        if (comp !== 0) {
            return comp;
        }
        let score = 0;
        for (let index = 0; index < this.outputs.length; index++) {
            score += this.outputs[index].compare(other.outputs[index]);
        }
        return score;
    }
    toString() {
        return `SwapPath(input: ${this.inputs
            .map((i) => i.formatWithSymbol())
            .join(', ')}, steps: ${this.steps.join(', ')}, output: ${this.outputs
            .map((i) => i.formatWithSymbol())
            .join(', ')} (${this.outputValue.formatWithSymbol()}))`;
    }
    describe() {
        const out = [];
        out.push(`SwapPath {`);
        out.push(`  inputs: ${this.inputs.join(', ')}`);
        out.push(`  steps:`);
        for (let i = 0; i < this.steps.length; i++) {
            const step = this.steps[i];
            out.push(`    Step ${i + 1}: Exchange ${step.input.join(',')} for ${step.output.join(', ')} via ${step.action.toString()}`);
        }
        out.push(`  outputs: ${this.outputs.join(', ')}`);
        out.push('}');
        return out;
    }
}
exports.SwapPath = SwapPath;
/**
 * SwapPaths groups SwapPath's together into sections
 */
class SwapPaths {
    universe;
    inputs;
    swapPaths;
    outputs;
    outputValue;
    destination;
    constructor(universe, inputs, swapPaths, outputs, outputValue, destination) {
        this.universe = universe;
        this.inputs = inputs;
        this.swapPaths = swapPaths;
        this.outputs = outputs;
        this.outputValue = outputValue;
        this.destination = destination;
    }
    async exchange(tokenAmounts) {
        for (const step of this.swapPaths) {
            await step.exchange(tokenAmounts);
        }
    }
    toString() {
        return `SwapPaths(input: ${this.inputs
            .map((i) => i.formatWithSymbol())
            .join(', ')}, swapPaths: ${this.swapPaths.join(', ')}, output: ${this.outputs
            .map((i) => i.formatWithSymbol())
            .join(', ')} (${this.outputValue.formatWithSymbol()}))`;
    }
    describe() {
        const out = [];
        out.push(`SwapPaths {`);
        out.push(`  inputs: ${this.inputs.join(', ')}`);
        out.push(`  actions:`);
        for (let i = 0; i < this.swapPaths.length; i++) {
            const subExchangeDescription = this.swapPaths[i].describe();
            out.push(...subExchangeDescription.map((line) => {
                return '    ' + line;
            }));
        }
        out.push(`  outputs: ${this.outputs.join(', ')}`);
        out.push('}');
        return out;
    }
}
exports.SwapPaths = SwapPaths;
/** Abstract set of steps to go from A to B */
class SwapPlan {
    universe;
    steps;
    constructor(universe, steps) {
        this.universe = universe;
        this.steps = steps;
    }
    get inputs() {
        return this.steps[0].input;
    }
    async quote(input, destination) {
        let legAmount = input;
        const swaps = [];
        for (const step of this.steps) {
            if (step.input.length !== legAmount.length) {
                throw new Error('Invalid input, input count does not match Action input length');
            }
            const output = await step.quote(legAmount);
            swaps.push(new SingleSwap(legAmount, step, output));
            legAmount = output;
        }
        const value = (await Promise.all(legAmount.map(async (i) => await this.universe
            .fairPrice(i)
            .then((i) => i ?? this.universe.usd.zero)))).reduce((l, r) => l.add(r));
        return new SwapPath(this.universe, input, swaps, legAmount, value, destination);
    }
    toString() {
        return `SwapPlan(${this.steps.map((i) => i.toString()).join(', ')})`;
    }
}
exports.SwapPlan = SwapPlan;
//# sourceMappingURL=Swap.js.map