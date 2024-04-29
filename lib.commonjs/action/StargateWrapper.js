"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StargateWrapperWithdrawAction = exports.StargateWrapperDepositAction = void 0;
const Action_1 = require("./Action");
const Approval_1 = require("../base/Approval");
const IStargateRewardableWrapper__factory_1 = require("../contracts/factories/contracts/IStargadeWrapper.sol/IStargateRewardableWrapper__factory");
/**
 * Used to mint/burn wrapped stargate tokens
 * They mint/burn 1:1
 */
const vaultInterface = IStargateRewardableWrapper__factory_1.IStargateRewardableWrapper__factory.createInterface();
class StargateWrapperDepositAction extends (0, Action_1.Action)("ReserveWrapper(Stargate)") {
    universe;
    underlying;
    stargateToken;
    async plan(planner, inputs, destination) {
        const wSGToken = this.gen.Contract.createContract(IStargateRewardableWrapper__factory_1.IStargateRewardableWrapper__factory.connect(this.stargateToken.address.address, this.universe.provider));
        const out = planner.add(wSGToken.deposit(inputs[0], destination.address));
        return [out];
    }
    gasEstimate() {
        return BigInt(200000n);
    }
    async quote([amountsIn]) {
        return [
            this.stargateToken.from(amountsIn.amount),
        ];
    }
    constructor(universe, underlying, stargateToken) {
        super(stargateToken.address, [underlying], [stargateToken], Action_1.InteractionConvention.ApprovalRequired, Action_1.DestinationOptions.Callee, [new Approval_1.Approval(underlying, stargateToken.address)]);
        this.universe = universe;
        this.underlying = underlying;
        this.stargateToken = stargateToken;
    }
    toString() {
        return `StargateWrapperDeposit(${this.stargateToken.toString()})`;
    }
}
exports.StargateWrapperDepositAction = StargateWrapperDepositAction;
class StargateWrapperWithdrawAction extends (0, Action_1.Action)("ReserveWrapper(Stargate)") {
    universe;
    underlying;
    stargateToken;
    gasEstimate() {
        return BigInt(200000n);
    }
    async plan(planner, inputs, destination) {
        const wSGToken = this.gen.Contract.createContract(IStargateRewardableWrapper__factory_1.IStargateRewardableWrapper__factory.connect(this.stargateToken.address.address, this.universe.provider));
        planner.add(wSGToken.withdraw(inputs[0], destination.address));
        const out = this.genUtils.erc20.balanceOf(this.universe, planner, this.outputToken[0], destination);
        return [out];
    }
    async quote([amountsIn]) {
        return [
            this.underlying.from(amountsIn.amount),
        ];
    }
    constructor(universe, underlying, stargateToken) {
        super(stargateToken.address, [stargateToken], [underlying], Action_1.InteractionConvention.None, Action_1.DestinationOptions.Recipient, []);
        this.universe = universe;
        this.underlying = underlying;
        this.stargateToken = stargateToken;
    }
    toString() {
        return `StargateWrapperWithdraw(${this.stargateToken.toString()})`;
    }
}
exports.StargateWrapperWithdrawAction = StargateWrapperWithdrawAction;
//# sourceMappingURL=StargateWrapper.js.map