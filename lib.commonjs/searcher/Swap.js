"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwapPlan = exports.SwapPaths = exports.SwapPath = exports.SingleSwap = void 0;
/**
 * A single Step token exchange
 */
class SingleSwap {
    inputs;
    action;
    outputs;
    type = 'SingleSwap';
    constructor(inputs, action, outputs) {
        this.inputs = inputs;
        this.action = action;
        this.outputs = outputs;
    }
    get proceedsOptions() {
        return this.action.proceedsOptions;
    }
    get interactionConvention() {
        return this.action.interactionConvention;
    }
    get address() {
        return this.action.address;
    }
    async exchange(tokenAmounts) {
        tokenAmounts.exchange(this.inputs, this.outputs);
    }
    describe() {
        return [
            `SingleSwap(input: ${this.inputs
                .map((i) => i.formatWithSymbol())
                .join(', ')}, action: ${this.action}, output: ${this.outputs
                .map((i) => i.formatWithSymbol())
                .join(', ')})`,
        ];
    }
}
exports.SingleSwap = SingleSwap;
/**
 * A SwapPath groups a set of SingleSwap's together. The output of one SingleSwap is the input of the next.
 * A SwapPath may be optimized, as long as the input's and output's remain the same.
 */
class SwapPath {
    universe;
    inputs;
    steps;
    outputs;
    outputValue;
    destination;
    type = 'MultipleSwaps';
    get proceedsOptions() {
        return this.steps.at(-1).proceedsOptions;
    }
    get interactionConvention() {
        return this.steps.at(0).interactionConvention;
    }
    get address() {
        return this.steps.at(0).address;
    }
    constructor(universe, inputs, steps, outputs, outputValue, destination) {
        this.universe = universe;
        this.inputs = inputs;
        this.steps = steps;
        this.outputs = outputs;
        this.outputValue = outputValue;
        this.destination = destination;
        if (steps.length === 0) {
            throw new Error('Invalid SwapPath, no steps');
        }
    }
    async exchange(tokenAmounts) {
        tokenAmounts.exchange(this.inputs, this.outputs);
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
            if (step.type === 'SingleSwap') {
                out.push(`    Step ${i + 1}: via ${step.describe()}`);
            }
            else {
                const desc = step.describe();
                out.push(`    Step ${i + 1}: via ${desc[0]}`);
                for (let j = 1; j < desc.length; j++) {
                    out.push(`    ${desc[j]}`);
                }
            }
        }
        out.push(`  outputs: ${this.outputs.join(', ')} ${this.destination}`);
        out.push('}');
        return out;
    }
}
exports.SwapPath = SwapPath;
/**
 * SwapPaths groups SwapPath's together into sections
 * The swapPaths can be reordered, as long as the following holds for the ith SwapPath:
 * (sum(swapPaths[0..i-1].outputs) - sum(swapPaths[0..i-1].inputs)) >= swapPaths[i].inputs
 *
 * Basically, if you sum up all the inputs and output for all previous steps
 * You are holding enough tokens to do the current step.
 */
class SwapPaths {
    universe;
    inputs;
    swapPaths;
    outputs;
    outputValue;
    destination;
    // public readonly swapPaths: SwapPath[] = []
    constructor(universe, inputs, swapPaths, outputs, outputValue, destination) {
        this.universe = universe;
        this.inputs = inputs;
        this.swapPaths = swapPaths;
        this.outputs = outputs;
        this.outputValue = outputValue;
        this.destination = destination;
    }
    async exchange(tokenAmounts) {
        tokenAmounts.exchange(this.inputs, this.outputs);
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
/**
 * A list steps to go from token set A to token set B.
 * A SwapPlan contains a linear set of actions to go from some input basket
 * to some output basket. But does not yet has any concrete values attached to it.
 *
 * Using the quote method with an input basket, a SwapPath can be generated.
 * The SwapPath is the concrete SwapPlan that contains the sub-actions inputs and outputs,
 * and can be used to generate an actual transaction.
 * */
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
        if (input.length === 0) {
            throw new Error('Invalid input, no input tokens ' + this.toString());
        }
        let legAmount = input;
        const swaps = [];
        for (const step of this.steps) {
            if (step.input.length !== legAmount.length) {
                throw new Error('Invalid input, input count does not match Action input length: ' +
                    step.input.join(', ') +
                    ' vs ' +
                    legAmount.join(', ') + " " + this.toString());
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