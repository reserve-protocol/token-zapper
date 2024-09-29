"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERC4626WithdrawAction = exports.ERC4626DepositAction = exports.ETHTokenVaultDepositAction = exports.ERC4626TokenVault = void 0;
const Approval_1 = require("../base/Approval");
const contracts_1 = require("../contracts");
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
const ETHTokenVaultDepositAction = (proto) => class ETHTokenVaultDepositAction extends (0, Action_1.Action)(proto) {
    universe;
    underlying;
    shareToken;
    slippage;
    get supportsDynamicInput() {
        return true;
    }
    get outputSlippage() {
        return this.slippage;
    }
    get returnsOutput() {
        return true;
    }
    async plan(planner, inputs, destination, predicted) {
        const lib = this.gen.Contract.createContract(this.inst);
        const out = planner.add(lib
            .deposit(destination.address)
            .withValue(inputs[0] || predicted[0].amount));
        return [out];
    }
    gasEstimate() {
        return BigInt(200000n);
    }
    async _quote(amountIn) {
        const x = (await this.inst.callStatic.previewDeposit(amountIn)).toBigInt();
        return [this.outputToken[0].fromBigInt(x)];
    }
    inst;
    quoteCache;
    async quote([amountIn]) {
        return await this.quoteCache.get(amountIn.amount);
    }
    constructor(universe, underlying, shareToken, slippage) {
        super(shareToken.address, [underlying], [shareToken], Action_1.InteractionConvention.ApprovalRequired, Action_1.DestinationOptions.Recipient, [new Approval_1.Approval(underlying, shareToken.address)]);
        this.universe = universe;
        this.underlying = underlying;
        this.shareToken = shareToken;
        this.slippage = slippage;
        this.inst = contracts_1.ETHTokenVault__factory.connect(this.shareToken.address.address, this.universe.provider);
        this.quoteCache = this.universe.createCache(async (a) => await this._quote(a), 1);
    }
    toString() {
        return `ETHTokenVaultDeposit(${this.shareToken.toString()})`;
    }
};
exports.ETHTokenVaultDepositAction = ETHTokenVaultDepositAction;
const ERC4626DepositAction = (proto) => class ERC4626DepositAction extends (0, Action_1.Action)(proto) {
    universe;
    underlying;
    shareToken;
    slippage;
    get supportsDynamicInput() {
        return true;
    }
    get outputSlippage() {
        return this.slippage;
    }
    get returnsOutput() {
        return true;
    }
    async plan(planner, inputs, destination, predicted) {
        const lib = this.gen.Contract.createContract(IERC4626__factory_1.IERC4626__factory.connect(this.shareToken.address.address, this.universe.provider));
        const out = planner.add(lib.deposit(inputs[0] || predicted[0].amount, destination.address));
        return [out];
    }
    gasEstimate() {
        return BigInt(200000n);
    }
    async _quote(amountIn) {
        const x = (await this.inst.callStatic.previewDeposit(amountIn)).toBigInt();
        return [this.outputToken[0].fromBigInt(x)];
    }
    inst;
    quoteCache;
    async quote([amountIn]) {
        return await this.quoteCache.get(amountIn.amount);
    }
    constructor(universe, underlying, shareToken, slippage) {
        super(shareToken.address, [underlying], [shareToken], Action_1.InteractionConvention.ApprovalRequired, Action_1.DestinationOptions.Recipient, [new Approval_1.Approval(underlying, shareToken.address)]);
        this.universe = universe;
        this.underlying = underlying;
        this.shareToken = shareToken;
        this.slippage = slippage;
        this.inst = IERC4626__factory_1.IERC4626__factory.connect(this.shareToken.address.address, this.universe.provider);
        this.quoteCache = this.universe.createCache(async (a) => await this._quote(a), 1);
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
    get returnsOutput() {
        return true;
    }
    async plan(planner, inputs, destination, predicted) {
        const inputBal = inputs[0] ?? predicted[0].amount;
        if (this.shareToken.address.address ===
            '0x9D39A5DE30e57443BfF2A8307A4256c8797A3497') {
            const lib = this.gen.Contract.createContract(contracts_1.IStakedEthenaUSD__factory.connect(this.shareToken.address.address, this.universe.provider));
            planner.add(lib.cooldownShares(inputBal));
            return this.outputBalanceOf(this.universe, planner);
        }
        const lib = this.gen.Contract.createContract(IERC4626__factory_1.IERC4626__factory.connect(this.shareToken.address.address, this.universe.provider));
        planner.add(lib.redeem(inputBal, this.universe.config.addresses.executorAddress.address, this.universe.config.addresses.executorAddress.address));
        return this.outputBalanceOf(this.universe, planner);
    }
    gasEstimate() {
        return BigInt(200000n);
    }
    async _quote(amountIn) {
        const x = (await this.inst.previewRedeem(amountIn)).toBigInt();
        return [this.outputToken[0].fromBigInt(x)];
    }
    inst;
    quoteCache;
    async quote([amountIn]) {
        return await this.quoteCache.get(amountIn.amount);
    }
    constructor(universe, underlying, shareToken, slippage) {
        super(shareToken.address, [shareToken], [underlying], Action_1.InteractionConvention.None, Action_1.DestinationOptions.Callee, []);
        this.universe = universe;
        this.underlying = underlying;
        this.shareToken = shareToken;
        this.slippage = slippage;
        this.inst = IERC4626__factory_1.IERC4626__factory.connect(this.shareToken.address.address, this.universe.provider);
        this.quoteCache = this.universe.createCache(async (a) => await this._quote(a), 1);
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