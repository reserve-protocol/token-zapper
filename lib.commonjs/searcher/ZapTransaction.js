"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZapTransaction = void 0;
const Planner_1 = require("../tx-gen/Planner");
class ZapTransaction {
    universe;
    params;
    tx;
    gasEstimate;
    input;
    output;
    planner;
    constructor(universe, params, tx, gasEstimate, input, output, planner) {
        this.universe = universe;
        this.params = params;
        this.tx = tx;
        this.gasEstimate = gasEstimate;
        this.input = input;
        this.output = output;
        this.planner = planner;
    }
    describe() {
        return [
            'Transaction {',
            '  Commands: [',
            ...(0, Planner_1.printPlan)(this.planner, this.universe).map((c) => '   ' + c),
            '  ],',
            `  input: ${this.input}`,
            `  gas: ${this.gasEstimate}`,
            `  fee: ${this.universe.nativeToken.from(this.universe.gasPrice * this.gasEstimate)}`,
            `  outputs: ${this.output.join(', ')}`,
            '}',
        ];
    }
    feeEstimate(gasPrice) {
        return gasPrice * this.gasEstimate;
    }
    toString() {
        return `ZapTransaction(input:${this.input.formatWithSymbol()},outputs:[${this.output
            .map((i) => i.formatWithSymbol())
            .join(', ')}])`;
    }
}
exports.ZapTransaction = ZapTransaction;
//# sourceMappingURL=ZapTransaction.js.map