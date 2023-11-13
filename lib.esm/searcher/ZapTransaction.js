export class ZapTransaction {
    params;
    tx;
    gasEstimate;
    input;
    output;
    contractCalls;
    constructor(params, tx, gasEstimate, input, output, contractCalls) {
        this.params = params;
        this.tx = tx;
        this.gasEstimate = gasEstimate;
        this.input = input;
        this.output = output;
        this.contractCalls = contractCalls;
    }
    describe() {
        return [
            "Transaction {",
            '  Commands: [',
            ...this.contractCalls.map(i => '    ' + i.comment),
            '  ],',
            `  input: ${this.input}`,
            `  outputs: ${this.output.join(", ")}`,
            '}'
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
//# sourceMappingURL=ZapTransaction.js.map