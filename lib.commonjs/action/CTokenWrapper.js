"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BurnCTokenWrapperAction = exports.MintCTokenWrapperAction = void 0;
const Approval_1 = require("../base/Approval");
const CTokenWrapper__factory_1 = require("../contracts/factories/contracts/ICToken.sol/CTokenWrapper__factory");
const Action_1 = require("./Action");
const iCTokenWrapper = CTokenWrapper__factory_1.CTokenWrapper__factory.createInterface();
class MintCTokenWrapperAction extends Action_1.Action {
    universe;
    baseToken;
    receiptToken;
    getRate;
    async plan(planner, inputs, destination) {
        const lib = this.gen.Contract.createContract(CTokenWrapper__factory_1.CTokenWrapper__factory.connect(this.receiptToken.address.address, this.universe.provider));
        const dep = lib.deposit(inputs[0], destination.address);
        planner.add(dep);
        const out = this.genUtils.erc20.balanceOf(this.universe, planner, this.outputToken[0], destination);
        return [out];
    }
    gasEstimate() {
        return BigInt(110000n);
    }
    async quote([amountsIn]) {
        return [this.receiptToken.from(amountsIn.amount)];
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
    async plan(planner, inputs, destination) {
        const lib = this.gen.Contract.createContract(CTokenWrapper__factory_1.CTokenWrapper__factory.connect(this.receiptToken.address.address, this.universe.provider));
        planner.add(lib.withdraw(inputs[0], destination.address));
        const out = this.genUtils.erc20.balanceOf(this.universe, planner, this.outputToken[0], destination);
        return [out];
    }
    gasEstimate() {
        return BigInt(110000n);
    }
    async quote([amountsIn]) {
        return [this.baseToken.from(amountsIn.amount)];
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