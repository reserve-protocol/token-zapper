"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BurnCometAction = exports.MintCometAction = void 0;
const Approval_1 = require("../base/Approval");
const ContractCall_1 = require("../base/ContractCall");
const utils_1 = require("../base/utils");
const Comet__factory_1 = require("../contracts/factories/contracts/Compv3.sol/Comet__factory");
const Action_1 = require("./Action");
const iCometInterface = Comet__factory_1.Comet__factory.createInterface();
class MintCometAction extends Action_1.Action {
    universe;
    baseToken;
    receiptToken;
    async plan(planner, inputs, destination) {
        const lib = this.gen.Contract.createContract(Comet__factory_1.Comet__factory.connect(this.receiptToken.address.address, this.universe.provider));
        planner.add(lib.supply(this.baseToken.address.address, inputs[0]));
        const out = this.genUtils.erc20.balanceOf(this.universe, planner, this.output[0], destination);
        return [out];
    }
    gasEstimate() {
        return BigInt(110000n);
    }
    async encode([amountsIn]) {
        return new ContractCall_1.ContractCall((0, utils_1.parseHexStringIntoBuffer)(iCometInterface.encodeFunctionData('supply', [
            this.baseToken.address.address,
            amountsIn.amount,
        ])), this.receiptToken.address, 0n, this.gasEstimate(), 'CompoundV3 mint ' + this.receiptToken.symbol);
    }
    async quote([amountsIn]) {
        return [this.receiptToken.from(amountsIn.amount)];
    }
    constructor(universe, baseToken, receiptToken) {
        super(receiptToken.address, [baseToken], [receiptToken], Action_1.InteractionConvention.ApprovalRequired, Action_1.DestinationOptions.Callee, [new Approval_1.Approval(baseToken, receiptToken.address)]);
        this.universe = universe;
        this.baseToken = baseToken;
        this.receiptToken = receiptToken;
    }
    toString() {
        return `CompoundV3Mint(${this.receiptToken.toString()})`;
    }
}
exports.MintCometAction = MintCometAction;
class BurnCometAction extends Action_1.Action {
    universe;
    baseToken;
    receiptToken;
    async plan(planner, inputs, destination) {
        const lib = this.gen.Contract.createContract(Comet__factory_1.Comet__factory.connect(this.receiptToken.address.address, this.universe.provider));
        planner.add(lib.withdrawTo(destination.address, this.baseToken.address.address, inputs[0]));
        const out = this.genUtils.erc20.balanceOf(this.universe, planner, this.output[0], destination);
        return [out];
    }
    gasEstimate() {
        return BigInt(110000n);
    }
    async encode([amountsIn], dest) {
        return new ContractCall_1.ContractCall((0, utils_1.parseHexStringIntoBuffer)(iCometInterface.encodeFunctionData('withdrawTo', [
            dest.address,
            this.baseToken.address.address,
            amountsIn.amount,
        ])), this.receiptToken.address, 0n, this.gasEstimate(), 'CompoundV3 burn ' + this.receiptToken.symbol);
    }
    async quote([amountsIn]) {
        return [this.baseToken.from(amountsIn.amount)];
    }
    constructor(universe, baseToken, receiptToken) {
        super(receiptToken.address, [receiptToken], [baseToken], Action_1.InteractionConvention.None, Action_1.DestinationOptions.Recipient, []);
        this.universe = universe;
        this.baseToken = baseToken;
        this.receiptToken = receiptToken;
    }
    toString() {
        return `CommetWithdraw(${this.receiptToken.toString()})`;
    }
}
exports.BurnCometAction = BurnCometAction;
//# sourceMappingURL=Comet.js.map