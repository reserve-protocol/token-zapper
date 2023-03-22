export class ZapTransaction {
    universe;
    params;
    tx;
    gas;
    input;
    output;
    result;
    constructor(universe, params, tx, gas, input, output, result) {
        this.universe = universe;
        this.params = params;
        this.tx = tx;
        this.gas = gas;
        this.input = input;
        this.output = output;
        this.result = result;
    }
    get fee() {
        return this.universe.nativeToken.quantityFromBigInt(this.universe.gasPrice * this.gas);
    }
    toString() {
        return `ZapTransaction(input:${this.input.formatWithSymbol()},outputs:[${this.output
            .map((i) => i.formatWithSymbol())
            .join(', ')}],txFee:${this.fee.formatWithSymbol()})`;
    }
}
//# sourceMappingURL=ZapTransaction.js.map