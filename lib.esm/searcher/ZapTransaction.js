export class ZapTransaction {
    params;
    tx;
    gasEstimate;
    input;
    output;
    constructor(params, tx, gasEstimate, input, output) {
        this.params = params;
        this.tx = tx;
        this.gasEstimate = gasEstimate;
        this.input = input;
        this.output = output;
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