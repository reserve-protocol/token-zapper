"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BurnStETH = exports.MintStETH = exports.StETHRateProvider = void 0;
const Action_1 = require("./Action");
const ContractCall_1 = require("../base/ContractCall");
const contracts_1 = require("../contracts");
const base_1 = require("../base");
const ethers_1 = require("ethers");
const stETHInterface = contracts_1.IStETH__factory.createInterface();
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
class MintStETH extends Action_1.Action {
    universe;
    steth;
    rateProvider;
    gasEstimate() {
        return BigInt(200000n);
    }
    async encode([amountsIn]) {
        const hexEncodedWrapCall = stETHInterface.encodeFunctionData('submit', [
            ethers_1.ethers.constants.AddressZero,
        ]);
        return new ContractCall_1.ContractCall((0, base_1.parseHexStringIntoBuffer)(hexEncodedWrapCall), this.steth.address, amountsIn.amount, this.gasEstimate(), 'Mint stETH');
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
class BurnStETH extends Action_1.Action {
    universe;
    steth;
    rateProvider;
    gasEstimate() {
        return BigInt(0n);
    }
    async encode(_) {
        throw new Error('Not implemented');
    }
    async quote([amountsIn]) {
        return [await this.rateProvider.quoteBurn(amountsIn)];
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