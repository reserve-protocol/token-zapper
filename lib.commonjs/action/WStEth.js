"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BurnWStETH = exports.MintWStETH = exports.WStETHRateProvider = void 0;
const Approval_1 = require("../base/Approval");
const ContractCall_1 = require("../base/ContractCall");
const utils_1 = require("../base/utils");
const IWStETH__factory_1 = require("../contracts/factories/contracts/IWStETH__factory");
const gen = __importStar(require("../tx-gen/Planner"));
const Action_1 = require("./Action");
const wstETHInterface = IWStETH__factory_1.IWStETH__factory.createInterface();
class WStETHRateProvider {
    universe;
    steth;
    wsteth;
    get outputSlippage() {
        return 3000000n;
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
        return 3000000n;
    }
    gasEstimate() {
        return BigInt(175000n);
    }
    async encode([amountsIn]) {
        const hexEncodedWrapCall = wstETHInterface.encodeFunctionData('wrap', [
            amountsIn.amount,
        ]);
        return new ContractCall_1.ContractCall((0, utils_1.parseHexStringIntoBuffer)(hexEncodedWrapCall), this.wsteth.address, 0n, this.gasEstimate(), 'Mint wstETH');
    }
    async plan(planner, inputs) {
        const wsteth = gen.Contract.createContract(IWStETH__factory_1.IWStETH__factory.connect(this.wsteth.address.address, this.universe.provider));
        const out = planner.add(wsteth.wrap(inputs[0]));
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
        return 3000000n;
    }
    gasEstimate() {
        return BigInt(175000n);
    }
    async encode([amountsIn]) {
        const hexEncodedWrapCall = wstETHInterface.encodeFunctionData('unwrap', [
            amountsIn.amount,
        ]);
        return new ContractCall_1.ContractCall((0, utils_1.parseHexStringIntoBuffer)(hexEncodedWrapCall), this.wsteth.address, 0n, this.gasEstimate(), 'Mint wstETH');
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