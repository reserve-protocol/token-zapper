"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StargateWithdrawAction = exports.StargateDepositAction = void 0;
const utils_1 = require("../base/utils");
const Action_1 = require("./Action");
const ContractCall_1 = require("../base/ContractCall");
const Approval_1 = require("../base/Approval");
const contracts_1 = require("../contracts");
/**
 * Used to mint/burn stargate LP tokens
 * They mint/burn 1:1
 */
const routerInterface = contracts_1.IStargateRouter__factory.createInterface();
class StargateDepositAction extends Action_1.Action {
    universe;
    underlying;
    stargateToken;
    poolId;
    router;
    async plan(planner, inputs, destination) {
        const lib = this.gen.Contract.createContract(contracts_1.IStargateRouter__factory.connect(this.router.address, this.universe.provider));
        planner.add(lib.addLiquidity(this.poolId, inputs[0], destination.address));
        return [
            this.genUtils.erc20.balanceOf(this.universe, planner, this.output[0], destination),
        ];
    }
    gasEstimate() {
        return BigInt(200000n);
    }
    async encode([amountsIn], destination) {
        return new ContractCall_1.ContractCall((0, utils_1.parseHexStringIntoBuffer)(routerInterface.encodeFunctionData('addLiquidity', [
            this.poolId,
            amountsIn.amount,
            destination.address,
        ])), this.router, 0n, this.gasEstimate(), `Deposit ${amountsIn} into Stargate via router (${this.router}) receiving ${amountsIn.into(this.stargateToken)}`);
    }
    async quote([amountsIn]) {
        let slipapgeAmt = amountsIn.amount / 100000n;
        if (slipapgeAmt <= 100n) {
            slipapgeAmt = 100n;
        }
        return [this.stargateToken.from(amountsIn.amount - slipapgeAmt)];
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
class StargateWithdrawAction extends Action_1.Action {
    universe;
    underlying;
    stargateToken;
    poolId;
    router;
    async plan(planner, inputs, destination) {
        const lib = this.gen.Contract.createContract(contracts_1.IStargateRouter__factory.connect(this.router.address, this.universe.provider));
        const out = planner.add(lib.instantRedeemLocal(this.poolId, inputs[0], destination.address));
        return [out];
    }
    gasEstimate() {
        return BigInt(200000n);
    }
    async encode([amountsIn], destination) {
        return new ContractCall_1.ContractCall((0, utils_1.parseHexStringIntoBuffer)(routerInterface.encodeFunctionData('instantRedeemLocal', [
            this.poolId,
            amountsIn.amount,
            destination.address,
        ])), this.router, 0n, this.gasEstimate(), `Redeem ${amountsIn} from Stargate via router (${this.router}) receiving ${amountsIn.into(this.underlying)}`);
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