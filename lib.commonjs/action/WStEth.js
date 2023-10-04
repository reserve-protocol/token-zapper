"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BurnWStETH = exports.MintWStETH = exports.WStETHRateProvider = void 0;
const Approval_1 = require("../base/Approval");
const ContractCall_1 = require("../base/ContractCall");
const utils_1 = require("../base/utils");
const IWStETH__factory_1 = require("../contracts/factories/contracts/IWStETH__factory");
const Action_1 = require("./Action");
const wstETHInterface = IWStETH__factory_1.IWStETH__factory.createInterface();
class WStETHRateProvider {
    universe;
    steth;
    wsteth;
    wstethInstance;
    constructor(universe, steth, wsteth) {
        this.universe = universe;
        this.steth = steth;
        this.wsteth = wsteth;
        this.wstethInstance = IWStETH__factory_1.IWStETH__factory.connect(wsteth.address.address, universe.provider);
    }
    async quoteMint(amountsIn) {
        const out = await this.wstethInstance.callStatic.getWstETHByStETH(amountsIn.amount);
        return this.wsteth.from(out);
    }
    async quoteBurn(amountsIn) {
        const out = await this.wstethInstance.callStatic.getStETHByWstETH(amountsIn.amount);
        return this.steth.from(out);
    }
}
exports.WStETHRateProvider = WStETHRateProvider;
class MintWStETH extends Action_1.Action {
    universe;
    steth;
    wsteth;
    rateProvider;
    gasEstimate() {
        return BigInt(175000n);
    }
    async encode([amountsIn]) {
        const hexEncodedWrapCall = wstETHInterface.encodeFunctionData('wrap', [
            amountsIn.amount,
        ]);
        return new ContractCall_1.ContractCall((0, utils_1.parseHexStringIntoBuffer)(hexEncodedWrapCall), this.wsteth.address, 0n, this.gasEstimate(), 'Mint wstETH');
    }
    async quote([amountsIn]) {
        return [await this.rateProvider.quoteMint(amountsIn)];
    }
    constructor(universe, steth, wsteth, rateProvider) {
        super(wsteth.address, [steth], [wsteth], Action_1.InteractionConvention.ApprovalRequired, Action_1.DestinationOptions.Callee, [new Approval_1.Approval(steth, wsteth.address)]);
        this.universe = universe;
        this.steth = steth;
        this.wsteth = wsteth;
        this.rateProvider = rateProvider;
    }
    toString() {
        return `WStETHMint(${this.wsteth.toString()})`;
    }
}
exports.MintWStETH = MintWStETH;
class BurnWStETH extends Action_1.Action {
    universe;
    steth;
    wsteth;
    rateProvider;
    gasEstimate() {
        return BigInt(175000n);
    }
    async encode([amountsIn]) {
        const hexEncodedWrapCall = wstETHInterface.encodeFunctionData('unwrap', [
            amountsIn.amount,
        ]);
        return new ContractCall_1.ContractCall((0, utils_1.parseHexStringIntoBuffer)(hexEncodedWrapCall), this.wsteth.address, 0n, this.gasEstimate(), 'Mint wstETH');
    }
    async quote([amountsIn]) {
        return [await this.rateProvider.quoteBurn(amountsIn)];
    }
    constructor(universe, steth, wsteth, rateProvider) {
        super(wsteth.address, [wsteth], [steth], Action_1.InteractionConvention.None, Action_1.DestinationOptions.Callee, []);
        this.universe = universe;
        this.steth = steth;
        this.wsteth = wsteth;
        this.rateProvider = rateProvider;
    }
    toString() {
        return `WStETHBurn(${this.wsteth.toString()})`;
    }
}
exports.BurnWStETH = BurnWStETH;
//# sourceMappingURL=WStEth.js.map