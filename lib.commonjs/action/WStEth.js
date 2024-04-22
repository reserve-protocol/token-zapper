"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BurnWStETH = exports.MintWStETH = exports.WStETHRateProvider = void 0;
const tslib_1 = require("tslib");
const Approval_1 = require("../base/Approval");
const contracts_1 = require("../contracts");
const IWStETH__factory_1 = require("../contracts/factories/contracts/IWStETH__factory");
const gen = tslib_1.__importStar(require("../tx-gen/Planner"));
const Action_1 = require("./Action");
const wstETHInterface = IWStETH__factory_1.IWStETH__factory.createInterface();
class WStETHRateProvider {
    universe;
    steth;
    wsteth;
    get outputSlippage() {
        return 0n;
    }
    wstethInstance;
    constructor(universe, steth, wsteth) {
        this.universe = universe;
        this.steth = steth;
        this.wsteth = wsteth;
        this.wstethInstance = IWStETH__factory_1.IWStETH__factory.connect(wsteth.address.address, universe.provider);
    }
    async quoteMint(amountsIn) {
        const out = (await this.wstethInstance.callStatic.getWstETHByStETH(amountsIn.amount)).toBigInt();
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
    get outputSlippage() {
        return 0n;
    }
    gasEstimate() {
        return BigInt(175000n);
    }
    async plan(planner, inputs) {
        const zapperLib = gen.Contract.createContract(contracts_1.ZapperExecutor__factory.connect(this.universe.config.addresses.executorAddress.address, this.universe.provider));
        const wsteth = gen.Contract.createContract(IWStETH__factory_1.IWStETH__factory.connect(this.wsteth.address.address, this.universe.provider));
        const input = planner.add(zapperLib.add(inputs[0], 1n));
        const out = planner.add(wsteth.wrap(input));
        return [out];
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
    get outputSlippage() {
        return 0n;
    }
    gasEstimate() {
        return BigInt(175000n);
    }
    async plan(planner, inputs) {
        const wsteth = gen.Contract.createContract(IWStETH__factory_1.IWStETH__factory.connect(this.wsteth.address.address, this.universe.provider));
        const out = planner.add(wsteth.unwrap(inputs[0]));
        return [out];
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