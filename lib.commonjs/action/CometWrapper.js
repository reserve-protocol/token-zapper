"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BurnCometWrapperAction = exports.MintCometWrapperAction = void 0;
const Approval_1 = require("../base/Approval");
const ContractCall_1 = require("../base/ContractCall");
const utils_1 = require("../base/utils");
const WrappedComet__factory_1 = require("../contracts/factories/contracts/Compv3.sol/WrappedComet__factory");
const Action_1 = require("./Action");
const iWrappedCometInterface = WrappedComet__factory_1.WrappedComet__factory.createInterface();
class MintCometWrapperAction extends Action_1.Action {
    universe;
    baseToken;
    receiptToken;
    getRate;
    async plan(planner, inputs, destination) {
        const lib = this.gen.Contract.createContract(WrappedComet__factory_1.WrappedComet__factory.connect(this.receiptToken.address.address, this.universe.provider));
        planner.add(lib.deposit(inputs[0]));
        const out = this.genUtils.erc20.balanceOf(this.universe, planner, this.output[0], destination);
        return [out];
    }
    gasEstimate() {
        return BigInt(110000n);
    }
    async encode([amountsIn], dest) {
        return new ContractCall_1.ContractCall((0, utils_1.parseHexStringIntoBuffer)(iWrappedCometInterface.encodeFunctionData('deposit', [amountsIn.amount])), this.receiptToken.address, 0n, this.gasEstimate(), 'CompoundV3Wrapper mint ' + this.receiptToken.symbol);
    }
    async quote([amountsIn]) {
        return [
            this.receiptToken.from(await WrappedComet__factory_1.WrappedComet__factory.connect(this.receiptToken.address.address, this.universe.provider).convertDynamicToStatic(amountsIn.amount)),
        ];
    }
    constructor(universe, baseToken, receiptToken, getRate) {
        super(receiptToken.address, [baseToken], [receiptToken], Action_1.InteractionConvention.ApprovalRequired, Action_1.DestinationOptions.Callee, [new Approval_1.Approval(baseToken, receiptToken.address)]);
        this.universe = universe;
        this.baseToken = baseToken;
        this.receiptToken = receiptToken;
        this.getRate = getRate;
    }
    toString() {
        return `CompoundV3WrapperMint(${this.receiptToken.toString()})`;
    }
    get outputSlippage() {
        return 1000000n;
    }
}
exports.MintCometWrapperAction = MintCometWrapperAction;
class BurnCometWrapperAction extends Action_1.Action {
    universe;
    baseToken;
    receiptToken;
    getRate;
    async plan(planner, inputs, destination) {
        const lib = this.gen.Contract.createContract(WrappedComet__factory_1.WrappedComet__factory.connect(this.receiptToken.address.address, this.universe.provider));
        const amount = planner.add(lib.convertStaticToDynamic(inputs[0]));
        planner.add(lib.withdrawTo(destination.address, amount));
        const out = this.genUtils.erc20.balanceOf(this.universe, planner, this.output[0], destination);
        return [out];
    }
    gasEstimate() {
        return BigInt(110000n);
    }
    async encode([amountsIn], dest) {
        const [withdrawalAmount] = await this.quote([amountsIn]);
        return new ContractCall_1.ContractCall((0, utils_1.parseHexStringIntoBuffer)(iWrappedCometInterface.encodeFunctionData('withdrawTo', [
            dest.address,
            withdrawalAmount.amount,
        ])), this.receiptToken.address, 0n, this.gasEstimate(), 'CompoundV3Wrapper burn ' + this.receiptToken.symbol);
    }
    async quote([amountsIn]) {
        return [
            this.baseToken.from(await WrappedComet__factory_1.WrappedComet__factory.connect(this.receiptToken.address.address, this.universe.provider).convertStaticToDynamic(amountsIn.amount)),
        ];
    }
    constructor(universe, baseToken, receiptToken, getRate) {
        super(receiptToken.address, [receiptToken], [baseToken], Action_1.InteractionConvention.None, Action_1.DestinationOptions.Callee, []);
        this.universe = universe;
        this.baseToken = baseToken;
        this.receiptToken = receiptToken;
        this.getRate = getRate;
    }
    toString() {
        return `CompoundV3Burn(${this.receiptToken.toString()})`;
    }
    get outputSlippage() {
        return 1500000n;
    }
}
exports.BurnCometWrapperAction = BurnCometWrapperAction;
//# sourceMappingURL=CometWrapper.js.map