"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StargateWithdrawAction = exports.StargateDepositAction = void 0;
const Action_1 = require("./Action");
const Approval_1 = require("../base/Approval");
const contracts_1 = require("../contracts");
/**
 * Used to mint/burn stargate LP tokens
 * They mint/burn 1:1
 */
class StargateDepositAction extends (0, Action_1.Action)('Stargate') {
    universe;
    underlying;
    stargateToken;
    poolId;
    router;
    async plan(planner, inputs, destination) {
        const lib = this.gen.Contract.createContract(contracts_1.IStargateRouter__factory.connect(this.router.address, this.universe.provider));
        planner.add(lib.addLiquidity(this.poolId, inputs[0], destination.address));
        return this.outputBalanceOf(this.universe, planner);
    }
    gasEstimate() {
        return BigInt(200000n);
    }
    get outputSlippage() {
        return 1n;
    }
    async quote([amountsIn]) {
        return [this.stargateToken.from(amountsIn.amount)];
    }
    constructor(universe, underlying, stargateToken, poolId, router) {
        super(stargateToken.address, [underlying], [stargateToken], Action_1.InteractionConvention.ApprovalRequired, Action_1.DestinationOptions.Callee, [new Approval_1.Approval(underlying, router)]);
        this.universe = universe;
        this.underlying = underlying;
        this.stargateToken = stargateToken;
        this.poolId = poolId;
        this.router = router;
    }
    toString() {
        return `StargateDeposit(${this.stargateToken.toString()})`;
    }
}
exports.StargateDepositAction = StargateDepositAction;
class StargateWithdrawAction extends (0, Action_1.Action)('Stargate') {
    universe;
    underlying;
    stargateToken;
    poolId;
    router;
    get outputSlippage() {
        return 1n;
    }
    async plan(planner, inputs, destination) {
        const lib = this.gen.Contract.createContract(contracts_1.IStargateRouter__factory.connect(this.router.address, this.universe.provider));
        const out = planner.add(lib.instantRedeemLocal(this.poolId, inputs[0], destination.address));
        return [out];
    }
    gasEstimate() {
        return BigInt(200000n);
    }
    async quote([amountsIn]) {
        return [this.underlying.from(amountsIn.amount)];
    }
    constructor(universe, underlying, stargateToken, poolId, router) {
        super(stargateToken.address, [stargateToken], [underlying], Action_1.InteractionConvention.ApprovalRequired, Action_1.DestinationOptions.Recipient, []);
        this.universe = universe;
        this.underlying = underlying;
        this.stargateToken = stargateToken;
        this.poolId = poolId;
        this.router = router;
    }
    toString() {
        return `StargateWithdraw(${this.stargateToken.toString()})`;
    }
}
exports.StargateWithdrawAction = StargateWithdrawAction;
//# sourceMappingURL=Stargate.js.map