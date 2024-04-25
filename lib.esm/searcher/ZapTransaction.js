import { PricedTokenQuantity } from '../entities/Token';
import { printPlan } from '../tx-gen/Planner';
class DustStats {
    dust;
    valueUSD;
    constructor(dust, valueUSD) {
        this.dust = dust;
        this.valueUSD = valueUSD;
    }
    static async fromDust(universe, dust) {
        const valueUSD = dust.reduce((a, b) => a.add(b.price), universe.usd.zero);
        return new DustStats(dust, valueUSD);
    }
    toString() {
        if (this.dust.length === 0)
            return '';
        return `[${this.dust.join(', ')}] (${this.valueUSD})`;
    }
}
class FeeStats {
    universe;
    units;
    constructor(universe, units) {
        this.universe = universe;
        this.units = units;
    }
    get txFee() {
        const ethFee = this.universe.nativeToken.from(this.units * this.universe.gasPrice);
        return new PricedTokenQuantity(ethFee, this.universe.gasTokenPrice
            .into(ethFee.token)
            .mul(ethFee)
            .into(this.universe.usd));
    }
    static fromGas(universe, gasUnits) {
        return new FeeStats(universe, gasUnits);
    }
    [Symbol.toPrimitive]() {
        return this.toString();
    }
    [Symbol.toStringTag] = 'FeeStats';
    toString() {
        return `${this.txFee} (${this.units} wei)`;
    }
}
export class ZapTxStats {
    universe;
    gasUnits;
    input;
    output;
    dust;
    outputs;
    valueUSD;
    constructor(universe, gasUnits, input, output, dust, outputs, valueUSD) {
        this.universe = universe;
        this.gasUnits = gasUnits;
        this.input = input;
        this.output = output;
        this.dust = dust;
        this.outputs = outputs;
        this.valueUSD = valueUSD;
    }
    get txFee() {
        return FeeStats.fromGas(this.universe, this.gasUnits);
    }
    get netValueUSD() {
        return this.valueUSD.sub(this.txFee.txFee.price);
    }
    static async create(universe, input) {
        const [inputValue, ...outputsValue] = await Promise.all([input.input, input.output, ...input.dust].map((i) => universe.priceQty(i)));
        const [outputValue, ...dustValue] = outputsValue;
        const totalValueUSD = outputsValue.reduce((a, b) => a.add(b.price), universe.usd.zero);
        return new ZapTxStats(universe, input.gasUnits, inputValue, outputValue, await DustStats.fromDust(universe, dustValue), outputsValue, totalValueUSD);
    }
    compare(other) {
        return this.netValueUSD.compare(other.netValueUSD);
    }
    get isThereDust() {
        return this.dust.dust.length > 0;
    }
    [Symbol.toPrimitive]() {
        return this.toString();
    }
    [Symbol.toStringTag] = 'ZapTxStats';
    toString() {
        if (this.isThereDust)
            return `${this.input} -> ${this.output} (+ $${this.dust.valueUSD} D.) @ fee: ${this.txFee.txFee.price}`;
        return `${this.input} -> ${this.output} @ fee: ${this.txFee.txFee.price}`;
    }
}
export class ZapTransaction {
    planner;
    searchResult;
    transaction;
    stats;
    constructor(planner, searchResult, transaction, stats) {
        this.planner = planner;
        this.searchResult = searchResult;
        this.transaction = transaction;
        this.stats = stats;
    }
    get universe() {
        return this.searchResult.universe;
    }
    get input() {
        return this.stats.input.quantity;
    }
    get output() {
        return this.stats.output.quantity;
    }
    get outputs() {
        return this.stats.outputs.map((o) => o.quantity);
    }
    get dust() {
        return this.stats.dust;
    }
    get inputValueUSD() {
        return this.stats.input.price;
    }
    get outputsValueUSD() {
        return this.stats.outputs.map((o) => o.price);
    }
    get dustValueUSD() {
        return this.stats.dust.valueUSD;
    }
    get outputValueUSD() {
        return this.stats.valueUSD;
    }
    get gas() {
        return this.stats.txFee.units;
    }
    get txFee() {
        return this.stats.txFee.txFee;
    }
    get txFeeUSD() {
        return this.stats.txFee.txFee.price;
    }
    get netUSD() {
        return this.stats.netValueUSD;
    }
    describe() {
        return [
            'Transaction {',
            `  zap: ${this.stats},`,
            `  fees: ${this.stats.txFee}`,
            '  program: [',
            ...printPlan(this.planner, this.universe).map((c) => '   ' + c),
            '  ],',
            '}',
        ];
    }
    toString() {
        return `ZapTx(${this.stats}, ${this.stats.txFee})`;
    }
    static async create(searchResult, planner, tx, stats) {
        return new ZapTransaction(planner, searchResult, tx, stats);
    }
    compare(other) {
        return this.stats.compare(other.stats);
    }
}
//# sourceMappingURL=ZapTransaction.js.map