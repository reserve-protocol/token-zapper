"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BurnCTokenWrapperAction = exports.MintCTokenWrapperAction = void 0;
const Approval_1 = require("../base/Approval");
const ContractCall_1 = require("../base/ContractCall");
const utils_1 = require("../base/utils");
const CTokenWrapper__factory_1 = require("../contracts/factories/contracts/ICToken.sol/CTokenWrapper__factory");
const Action_1 = require("./Action");
const iCTokenWrapper = CTokenWrapper__factory_1.CTokenWrapper__factory.createInterface();
class MintCTokenWrapperAction extends Action_1.Action {
    universe;
    baseToken;
    receiptToken;
    getRate;
    gasEstimate() {
        return BigInt(110000n);
    }
    async encode([amountsIn], dest) {
        return new ContractCall_1.ContractCall((0, utils_1.parseHexStringIntoBuffer)(iCTokenWrapper.encodeFunctionData('deposit', [
            amountsIn.amount,
            dest.address
        ])), this.receiptToken.address, 0n, this.gasEstimate(), 'CompoundV2Wrapper mint ' + this.receiptToken.symbol);
    }
    async quote([amountsIn]) {
        return [
            this.receiptToken.from(amountsIn.amount)
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
        return `CompoundV2WrapperMint(${this.receiptToken.toString()})`;
    }
}
exports.MintCTokenWrapperAction = MintCTokenWrapperAction;
class BurnCTokenWrapperAction extends Action_1.Action {
    universe;
    baseToken;
    receiptToken;
    getRate;
    gasEstimate() {
        return BigInt(110000n);
    }
    async encode([amountsIn], dest) {
        return new ContractCall_1.ContractCall((0, utils_1.parseHexStringIntoBuffer)(iCTokenWrapper.encodeFunctionData('withdraw', [
            amountsIn.amount,
            dest.address,
        ])), this.receiptToken.address, 0n, this.gasEstimate(), 'CompoundV2Wrapper burn ' + this.receiptToken.symbol);
    }
    async quote([amountsIn]) {
        return [
            this.baseToken.from(amountsIn.amount)
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
        return `CompoundV2WrapperBurn(${this.receiptToken.toString()})`;
    }
}
exports.BurnCTokenWrapperAction = BurnCTokenWrapperAction;
//# sourceMappingURL=CTokenWrapper.js.map