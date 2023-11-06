"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StargateWrapperWithdrawAction = exports.StargateWrapperDepositAction = void 0;
const utils_1 = require("../base/utils");
const Action_1 = require("./Action");
const ContractCall_1 = require("../base/ContractCall");
const Approval_1 = require("../base/Approval");
const IStargateRewardableWrapper__factory_1 = require("../contracts/factories/contracts/IStargadeWrapper.sol/IStargateRewardableWrapper__factory");
/**
 * Used to mint/burn wrapped stargate tokens
 * They mint/burn 1:1
 */
const vaultInterface = IStargateRewardableWrapper__factory_1.IStargateRewardableWrapper__factory.createInterface();
class StargateWrapperDepositAction extends Action_1.Action {
    universe;
    underlying;
    stargateToken;
    gasEstimate() {
        return BigInt(200000n);
    }
    async encode([amountsIn], destination) {
        return new ContractCall_1.ContractCall((0, utils_1.parseHexStringIntoBuffer)(vaultInterface.encodeFunctionData('deposit', [
            amountsIn.amount,
            destination.address,
        ])), this.stargateToken.address, 0n, this.gasEstimate(), `Deposit ${amountsIn} into Stargate(${this.stargateToken.address}) vault receiving ${amountsIn.into(this.stargateToken)}`);
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
class StargateWrapperWithdrawAction extends Action_1.Action {
    universe;
    underlying;
    stargateToken;
    gasEstimate() {
        return BigInt(200000n);
    }
    async encode([amountsIn], destination) {
        return new ContractCall_1.ContractCall((0, utils_1.parseHexStringIntoBuffer)(vaultInterface.encodeFunctionData('withdraw', [
            amountsIn.amount,
            destination.address
        ])), this.stargateToken.address, 0n, this.gasEstimate(), `Withdraw ${amountsIn} from ERC4626(${this.stargateToken.address}) vault`);
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