import { DefaultMap } from '../base';
import { TokenAmounts } from '../entities/Token';
/**
 * A single Step token exchange
 */
export class SingleSwap {
    input;
    action;
    output;
    constructor(input, action, output) {
        this.input = input;
        this.action = action;
        this.output = output;
    }
    async exchange(tokenAmounts) {
        tokenAmounts.exchange(this.input, this.output);
    }
    toString() {
        return `SingleSwap(input: ${this.input
            .map((i) => i.formatWithSymbol())
            .join(', ')}, action: ${this.action}, output: ${this.output
            .map((i) => i.formatWithSymbol())
            .join(', ')})`;
    }
}
/**
 * A SwapPath groups a set of SingleSwap's together. The output of one SingleSwap is the input of the next.
 * A SwapPath may be optimized, as long as the input's and output's remain the same.
 */
export class SwapPath {
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
            out.push(`    Step ${i + 1}: Exchange ${step.input.join(',')} for ${step.output.join(', ')} via ${step.action.toString()}`);
        }
        out.push(`  outputs: ${this.outputs.join(', ')}`);
        out.push('}');
        return out;
    }
}
/**
 * SwapPaths groups SwapPath's together into sections
 */
export class SwapPaths {
    universe;
    inputs;
    outputs;
    outputValue;
    destination;
    swapPaths = [];
    constructor(universe, inputs, swapPaths, outputs, outputValue, destination) {
        this.universe = universe;
        this.inputs = inputs;
        this.outputs = outputs;
        this.outputValue = outputValue;
        this.destination = destination;
        const byInputs = new DefaultMap(() => []);
        swapPaths.forEach((swapPath) => {
            const key = swapPath.inputs.map((i) => i.token.address.address).join(',') +
                swapPath.destination.address;
            byInputs.get(key).push(swapPath);
        });
        this.swapPaths = [...byInputs.values()].map((group) => {
            const inputs = TokenAmounts.fromQuantities(group.map((i) => i.inputs).flat()).toTokenQuantities();
            const outputs = TokenAmounts.fromQuantities(group.map((i) => i.outputs).flat()).toTokenQuantities();
            const outputValue = TokenAmounts.fromQuantities(group.map((i) => i.outputValue).flat()).toTokenQuantities();
            return new SwapPath(universe, inputs, group.map((i) => i.steps).flat(), outputs, outputValue[0], group[0].destination);
        });
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
/** Abstract set of steps to go from A to B */
export class SwapPlan {
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
//# sourceMappingURL=Swap.js.map