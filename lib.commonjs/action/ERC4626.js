"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERC4626WithdrawAction = exports.ERC4626DepositAction = exports.ERC4626TokenVault = void 0;
const Approval_1 = require("../base/Approval");
const IERC4626__factory_1 = require("../contracts/factories/@openzeppelin/contracts/interfaces/IERC4626__factory");
const Action_1 = require("./Action");
class ERC4626TokenVault {
    shareToken;
    underlying;
    constructor(shareToken, underlying) {
        this.shareToken = shareToken;
        this.underlying = underlying;
    }
    get address() {
        return this.shareToken.address;
    }
}
exports.ERC4626TokenVault = ERC4626TokenVault;
const ERC4626DepositAction = (proto) => class ERC4626DepositAction extends (0, Action_1.Action)(proto) {
    universe;
    underlying;
    shareToken;
    slippage;
    get outputSlippage() {
        return this.slippage;
    }
    async plan(planner, inputs, destination) {
        const lib = this.gen.Contract.createContract(IERC4626__factory_1.IERC4626__factory.connect(this.shareToken.address.address, this.universe.provider));
        const out = planner.add(lib.deposit(inputs[0], destination.address));
        return [out];
    }
    gasEstimate() {
        return BigInt(200000n);
    }
    async quote([amountsIn]) {
        const x = (await IERC4626__factory_1.IERC4626__factory.connect(this.shareToken.address.address, this.universe.provider).previewDeposit(amountsIn.amount)).toBigInt();
        return [this.shareToken.from(x)];
    }
    constructor(universe, underlying, shareToken, slippage) {
        super(shareToken.address, [underlying], [shareToken], Action_1.InteractionConvention.ApprovalRequired, Action_1.DestinationOptions.Callee, [new Approval_1.Approval(underlying, shareToken.address)]);
        this.universe = universe;
        this.underlying = underlying;
        this.shareToken = shareToken;
        this.slippage = slippage;
    }
    toString() {
        return `ERC4626Deposit(${this.shareToken.toString()})`;
    }
};
exports.ERC4626DepositAction = ERC4626DepositAction;
const ERC4626WithdrawAction = (proto) => class ERC4626WithdrawAction extends (0, Action_1.Action)(proto) {
    universe;
    underlying;
    shareToken;
    slippage;
    async plan(planner, inputs, destination, predicted) {
        const lib = this.gen.Contract.createContract(IERC4626__factory_1.IERC4626__factory.connect(this.shareToken.address.address, this.universe.provider));
        planner.add(lib.redeem(inputs[0] ?? predicted[0].amount, destination.address, this.universe.config.addresses.executorAddress.address));
        return this.outputBalanceOf(this.universe, planner);
    }
    gasEstimate() {
        return BigInt(200000n);
    }
    async quote([amountsIn]) {
        return [
            this.underlying.from(await IERC4626__factory_1.IERC4626__factory.connect(this.shareToken.address.address, this.universe.provider).previewRedeem(amountsIn.amount)),
        ];
    }
    constructor(universe, underlying, shareToken, slippage) {
        super(shareToken.address, [shareToken], [underlying], Action_1.InteractionConvention.None, Action_1.DestinationOptions.Callee, []);
        this.universe = universe;
        this.underlying = underlying;
        this.shareToken = shareToken;
        this.slippage = slippage;
    }
    toString() {
        return `ERC4626Withdraw(${this.shareToken.toString()})`;
    }
    get outputSliptepage() {
        return this.slippage;
    }
};
exports.ERC4626WithdrawAction = ERC4626WithdrawAction;
//# sourceMappingURL=ERC4626.js.map