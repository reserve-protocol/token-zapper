"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BurnStETH = exports.MintStETH = exports.StETHRateProvider = void 0;
const Action_1 = require("./Action");
const ethers_1 = require("ethers");
const IStETH__factory_1 = require("../contracts/factories/contracts/IStETH__factory");
class StETHRateProvider {
    universe;
    steth;
    constructor(universe, steth) {
        this.universe = universe;
        this.steth = steth;
    }
    async quoteMint(amountsIn) {
        return this.steth.from(amountsIn.amount);
    }
    async quoteBurn(amountsIn) {
        return this.universe.nativeToken.from(amountsIn.amount);
    }
}
exports.StETHRateProvider = StETHRateProvider;
class MintStETH extends (0, Action_1.Action)('Lido') {
    universe;
    steth;
    rateProvider;
    async plan(planner, inputs) {
        const wsteth = this.gen.Contract.createContract(IStETH__factory_1.IStETH__factory.connect(this.steth.address.address, this.universe.provider));
        planner.add(wsteth.submit(ethers_1.constants.AddressZero).withValue(inputs[0]));
        return this.outputBalanceOf(this.universe, planner);
    }
    gasEstimate() {
        return BigInt(200000n);
    }
    async quote([amountsIn]) {
        return [await this.rateProvider.quoteMint(amountsIn)];
    }
    constructor(universe, steth, rateProvider) {
        super(steth.address, [universe.nativeToken], [steth], Action_1.InteractionConvention.None, Action_1.DestinationOptions.Callee, []);
        this.universe = universe;
        this.steth = steth;
        this.rateProvider = rateProvider;
    }
    toString() {
        return 'StETHMint()';
    }
}
exports.MintStETH = MintStETH;
class BurnStETH extends (0, Action_1.Action)('Lido') {
    universe;
    steth;
    rateProvider;
    gasEstimate() {
        return BigInt(500000n);
    }
    async plan(planner, inputs) {
        throw new Error('Not implemented');
    }
    async quote([qty]) {
        return [await this.rateProvider.quoteBurn(qty)];
    }
    constructor(universe, steth, rateProvider) {
        super(steth.address, [steth], [universe.nativeToken], Action_1.InteractionConvention.None, Action_1.DestinationOptions.Callee, []);
        this.universe = universe;
        this.steth = steth;
        this.rateProvider = rateProvider;
    }
    toString() {
        return 'BurnStETH()';
    }
    /**
     * Prevents this edge of being picked up by the graph searcher, but it can still be used
     * by the zapper.
     */
    get addToGraph() {
        return false;
    }
}
exports.BurnStETH = BurnStETH;
//# sourceMappingURL=StEth.js.map