"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZapTransaction = exports.ZapTxStats = void 0;
const ethers_1 = require("ethers");
const utils_1 = require("ethers/lib/utils");
const Token_1 = require("../entities/Token");
const Planner_1 = require("../tx-gen/Planner");
class DustStats {
    dust;
    valueUSD;
    constructor(dust, valueUSD) {
        this.dust = dust;
        this.valueUSD = valueUSD;
    }
    static fromDust(result, dust) {
        const valueUSD = dust.reduce((a, b) => a.add(b.price), result.universe.usd.zero);
        return new DustStats(dust, valueUSD);
    }
    toString() {
        if (this.dust.length === 0)
            return '';
        return `[${this.dust.join(', ')}] (${this.valueUSD})`;
    }
}
class FeeStats {
    result;
    units;
    constructor(result, units) {
        this.result = result;
        this.units = units;
    }
    get txFee() {
        const ethFee = this.result.universe.nativeToken.from(this.units * this.result.universe.gasPrice);
        return new Token_1.PricedTokenQuantity(ethFee, this.result.universe.gasTokenPrice
            .into(ethFee.token)
            .mul(ethFee)
            .into(this.result.universe.usd));
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
    result;
    gasUnits;
    input;
    output;
    dust;
    outputs;
    valueUSD;
    get universe() {
        return this.result.universe;
    }
    constructor(result, gasUnits, 
    // value of (input token qty)
    input, 
    // value of (output token qty)
    output, dust, 
    // all outputtoken + dust
    outputs, 
    // value of (output token + dust)
    valueUSD) {
        this.result = result;
        this.gasUnits = gasUnits;
        this.input = input;
        this.output = output;
        this.dust = dust;
        this.outputs = outputs;
        this.valueUSD = valueUSD;
    }
    get txFee() {
        return FeeStats.fromGas(this.result, this.gasUnits);
    }
    get netValueUSD() {
        return this.valueUSD.sub(this.txFee.txFee.price);
    }
    static async create(result, input) {
        const [inputValue, outputValue, ...dustValue] = await Promise.all([input.input, input.output, ...input.dust].map((i) => result.priceQty(i)));
        const totalValueUSD = dustValue.reduce((a, b) => a.add(b.price), outputValue.price);
        return new ZapTxStats(result, input.gasUnits, inputValue, outputValue, DustStats.fromDust(result, dustValue), [outputValue, ...dustValue], totalValueUSD);
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
    async serialize() {
        const txArgs = await (0, utils_1.resolveProperties)(this.transaction.params);
        return {
            id: (0, utils_1.hexZeroPad)((0, utils_1.hexlify)(this.searchResult.zapId), 32),
            chainId: this.universe.chainId,
            zapType: this.searchResult.constructor.name,
            requestStart: new Date(this.searchResult.startTime).toISOString(),
            requestBlock: this.searchResult.blockNumber,
            createdAt: new Date().toISOString(),
            createdAtBlock: this.universe.currentBlock,
            searchTime: Date.now() - this.searchResult.startTime,
            txArgs: Object.fromEntries(Object.entries(txArgs).map(([k, v]) => {
                if (v == null || typeof v === 'number' || typeof v === 'boolean') {
                    return [k, v ?? null];
                }
                if (v instanceof ethers_1.BigNumber) {
                    return [k, v.toString()];
                }
                if (Array.isArray(v)) {
                    return [k, v.map((i) => i.toString())];
                }
                return [k, v.toString()];
            })),
            tx: {
                to: this.transaction.tx.to ?? null,
                data: this.transaction.tx.data == null
                    ? null
                    : (0, utils_1.hexlify)(this.transaction.tx.data),
                value: ethers_1.BigNumber.from(this.transaction.tx.value ?? '0x0').toString(),
                from: this.transaction.tx.from ?? null,
            },
            gasUnits: this.stats.txFee.units.toString(),
            input: this.stats.input.serialize(),
            output: this.stats.output.serialize(),
            dust: this.dust.dust.map((i) => i.serialize()),
            description: this.describe().join('\n'),
            state: {
                prices: {
                    searcherPrices: Array.from(this.searchResult.searcher.tokenPrices.entries()).map(([k, v]) => ({
                        token: k.serialize(),
                        price: v.serialize(),
                    })),
                },
            },
        };
    }
}
exports.ZapTransaction = ZapTransaction;
//# sourceMappingURL=ZapTransaction.js.map