"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BurnCometAction = exports.MintCometAction = void 0;
const Approval_1 = require("../base/Approval");
const Comet__factory_1 = require("../contracts/factories/contracts/Compv3.sol/Comet__factory");
const Action_1 = require("./Action");
class MintCometAction extends Action_1.Action {
    universe;
    baseToken;
    receiptToken;
    async plan(planner, inputs, destination, predicted) {
        const lib = this.gen.Contract.createContract(Comet__factory_1.Comet__factory.connect(this.receiptToken.address.address, this.universe.provider));
        planner.add(lib.supply(this.baseToken.address.address, inputs[0]), `Comet mint: ${predicted.join(', ')} -> ${await this.quote(predicted)}`);
        const out = this.genUtils.erc20.balanceOf(this.universe, planner, this.output[0], destination);
        return [out];
    }
    gasEstimate() {
        return BigInt(110000n);
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
    async plan(planner, inputs, destination, predicted) {
        const lib = this.gen.Contract.createContract(Comet__factory_1.Comet__factory.connect(this.receiptToken.address.address, this.universe.provider));
        planner.add(lib.withdrawTo(destination.address, this.baseToken.address.address, inputs[0]), `Comet burn: ${predicted.join(', ')} -> ${await this.quote(predicted)}`);
        const out = this.genUtils.erc20.balanceOf(this.universe, planner, this.output[0], destination);
        return [out];
    }
    gasEstimate() {
        return BigInt(110000n);
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