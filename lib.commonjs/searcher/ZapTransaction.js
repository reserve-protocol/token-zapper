"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZapTransaction = exports.ZapTxStats = void 0;
const Token_1 = require("../entities/Token");
const Planner_1 = require("../tx-gen/Planner");
class DustStats {
    dust;
    valueUSD;
    constructor(dust, valueUSD) {
        this.dust = dust;
        this.valueUSD = valueUSD;
    }
    static fromDust(universe, dust) {
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
        return new Token_1.PricedTokenQuantity(ethFee, this.universe.gasTokenPrice
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
class ZapTxStats {
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
        const [inputValue, outputValue, ...dustValue] = await Promise.all([input.input, input.output, ...input.dust].map((i) => universe.priceQty(i)));
        const totalValueUSD = dustValue.reduce((a, b) => a.add(b.price), outputValue.price);
        return new ZapTxStats(universe, input.gasUnits, inputValue, outputValue, DustStats.fromDust(universe, dustValue), [outputValue, ...dustValue], totalValueUSD);
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
exports.ZapTxStats = ZapTxStats;
class ZapTransaction {
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
            `  dust: [${this.stats.dust.dust.join(', ')}],`,
            `  fees: ${this.stats.txFee}`,
            '  program: [',
            ...(0, Planner_1.printPlan)(this.planner, this.universe).map((c) => '   ' + c),
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
exports.ZapTransaction = ZapTransaction;
//# sourceMappingURL=ZapTransaction.js.map