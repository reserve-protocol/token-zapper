export class ZapTransaction {
    universe;
    params;
    tx;
    gasEstimate;
    input;
    output;
    result;
    constructor(universe, params, tx, gasEstimate, input, output, result) {
        this.universe = universe;
        this.params = params;
        this.tx = tx;
        this.gasEstimate = gasEstimate;
        this.input = input;
        this.output = output;
        this.result = result;
    }
    get fee() {
        return this.universe.nativeToken.quantityFromBigInt(this.universe.gasPrice * this.gasEstimate);
    }
    toString() {
        return `ZapTransaction(input:${this.input.formatWithSymbol()},outputs:[${this.output
            .map((i) => i.formatWithSymbol())
            .join(', ')}],txFee:${this.fee.formatWithSymbol()})`;
    }
}
//# sourceMappingURL=ZapTransaction.js.map