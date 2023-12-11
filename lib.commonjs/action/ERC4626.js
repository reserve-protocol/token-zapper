"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERC4626WithdrawAction = exports.ERC4626DepositAction = exports.ERC4626TokenVault = void 0;
const Approval_1 = require("../base/Approval");
const ContractCall_1 = require("../base/ContractCall");
const utils_1 = require("../base/utils");
const IERC4626__factory_1 = require("../contracts/factories/contracts/IERC4626__factory");
const Action_1 = require("./Action");
const vaultInterface = IERC4626__factory_1.IERC4626__factory.createInterface();
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
class ERC4626DepositAction extends Action_1.Action {
    universe;
    underlying;
    shareToken;
    get outputSlippage() {
        return 3000000n;
    }
    gasEstimate() {
        return BigInt(200000n);
    }
    async encode([amountsIn], destination) {
        return new ContractCall_1.ContractCall((0, utils_1.parseHexStringIntoBuffer)(vaultInterface.encodeFunctionData('deposit', [
            amountsIn.amount,
            destination.address,
        ])), this.shareToken.address, 0n, this.gasEstimate(), `Deposit ${amountsIn} into ERC4626(${this.shareToken.address}) vault`);
    }
    async quote([amountsIn]) {
        const x = (await IERC4626__factory_1.IERC4626__factory.connect(this.shareToken.address.address, this.universe.provider).previewDeposit(amountsIn.amount)).toBigInt();
        return [
            this.shareToken.from(x)
        ];
    }
    constructor(universe, underlying, shareToken) {
        super(shareToken.address, [underlying], [shareToken], Action_1.InteractionConvention.ApprovalRequired, Action_1.DestinationOptions.Callee, [new Approval_1.Approval(underlying, shareToken.address)]);
        this.universe = universe;
        this.underlying = underlying;
        this.shareToken = shareToken;
    }
    toString() {
        return `ERC4626Deposit(${this.shareToken.toString()})`;
    }
}
exports.ERC4626DepositAction = ERC4626DepositAction;
class ERC4626WithdrawAction extends Action_1.Action {
    universe;
    underlying;
    shareToken;
    gasEstimate() {
        return BigInt(200000n);
    }
    async encode([amountsIn], destination) {
        return new ContractCall_1.ContractCall((0, utils_1.parseHexStringIntoBuffer)(vaultInterface.encodeFunctionData('redeem', [
            amountsIn.amount,
            destination.address,
            this.universe.config.addresses.executorAddress.address,
        ])), this.shareToken.address, 0n, this.gasEstimate(), `Withdraw ${amountsIn} from ERC4626(${this.shareToken.address}) vault`);
    }
    async quote([amountsIn]) {
        return [
            this.underlying.from(await IERC4626__factory_1.IERC4626__factory.connect(this.shareToken.address.address, this.universe.provider).previewRedeem(amountsIn.amount)),
        ];
    }
    constructor(universe, underlying, shareToken) {
        super(shareToken.address, [shareToken], [underlying], Action_1.InteractionConvention.None, Action_1.DestinationOptions.Recipient, []);
        this.universe = universe;
        this.underlying = underlying;
        this.shareToken = shareToken;
    }
    toString() {
        return `ERC4626Withdraw(${this.shareToken.toString()})`;
    }
    get outputSliptepage() {
        return 3000000n;
    }
}
exports.ERC4626WithdrawAction = ERC4626WithdrawAction;
//# sourceMappingURL=ERC4626.js.map