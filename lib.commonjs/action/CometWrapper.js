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
    gasEstimate() {
        return BigInt(110000n);
    }
    async encode([amountsIn], dest) {
        return new ContractCall_1.ContractCall((0, utils_1.parseHexStringIntoBuffer)(iWrappedCometInterface.encodeFunctionData('deposit', [
            amountsIn.amount,
        ])), this.receiptToken.address, 0n, this.gasEstimate(), 'CompoundV3Wrapper mint ' + this.receiptToken.symbol);
    }
    async quote([amountsIn]) {
        const rate = await this.getRate();
        let amountOut = (amountsIn.amount * amountsIn.token.one.amount) / rate;
        amountOut = amountOut - amountOut / 3000000n;
        return [
            this.receiptToken.from(amountOut)
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
}
exports.MintCometWrapperAction = MintCometWrapperAction;
class BurnCometWrapperAction extends Action_1.Action {
    universe;
    baseToken;
    receiptToken;
    getRate;
    gasEstimate() {
        return BigInt(110000n);
    }
    async encode([amountsIn], dest) {
        return new ContractCall_1.ContractCall((0, utils_1.parseHexStringIntoBuffer)(iWrappedCometInterface.encodeFunctionData('withdrawTo', [
            dest.address,
            amountsIn.amount,
        ])), this.receiptToken.address, 0n, this.gasEstimate(), 'CompoundV3Wrapper burn ' + this.receiptToken.symbol);
    }
    async quote([amountsIn]) {
        const rate = await this.getRate();
        const amountOut = (amountsIn.amount * rate) / amountsIn.token.one.amount;
        return [
            this.baseToken.from(amountOut)
        ];
    }
    constructor(universe, baseToken, receiptToken, getRate) {
        super(receiptToken.address, [receiptToken], [baseToken], Action_1.InteractionConvention.None, Action_1.DestinationOptions.Recipient, []);
        this.universe = universe;
        this.baseToken = baseToken;
        this.receiptToken = receiptToken;
        this.getRate = getRate;
    }
    toString() {
        return `CompoundV3Burn(${this.receiptToken.toString()})`;
    }
}
exports.BurnCometWrapperAction = BurnCometWrapperAction;
//# sourceMappingURL=CometWrapper.js.map