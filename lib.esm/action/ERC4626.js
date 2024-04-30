import { Approval } from '../base/Approval';
import { IERC4626__factory } from '../contracts/factories/@openzeppelin/contracts/interfaces/IERC4626__factory';
import { Action, DestinationOptions, InteractionConvention } from './Action';
export class ERC4626TokenVault {
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
export const ERC4626DepositAction = (proto) => class ERC4626DepositAction extends Action(proto) {
    universe;
    underlying;
    shareToken;
    slippage;
    get outputSlippage() {
        return this.slippage;
    }
    async plan(planner, inputs, destination) {
        const lib = this.gen.Contract.createContract(IERC4626__factory.connect(this.shareToken.address.address, this.universe.provider));
        const out = planner.add(lib.deposit(inputs[0], destination.address));
        return [out];
    }
    gasEstimate() {
        return BigInt(200000n);
    }
    async quote([amountsIn]) {
        const x = (await IERC4626__factory.connect(this.shareToken.address.address, this.universe.provider).previewDeposit(amountsIn.amount)).toBigInt();
        return [this.shareToken.from(x)];
    }
    constructor(universe, underlying, shareToken, slippage) {
        super(shareToken.address, [underlying], [shareToken], InteractionConvention.ApprovalRequired, DestinationOptions.Callee, [new Approval(underlying, shareToken.address)]);
        this.universe = universe;
        this.underlying = underlying;
        this.shareToken = shareToken;
        this.slippage = slippage;
    }
    toString() {
        return `ERC4626Deposit(${this.shareToken.toString()})`;
    }
};
export const ERC4626WithdrawAction = (proto) => class ERC4626WithdrawAction extends Action(proto) {
    universe;
    underlying;
    shareToken;
    slippage;
    async plan(planner, inputs, destination, predicted) {
        const lib = this.gen.Contract.createContract(IERC4626__factory.connect(this.shareToken.address.address, this.universe.provider));
        planner.add(lib.redeem(inputs[0] ?? predicted[0].amount, destination.address, this.universe.config.addresses.executorAddress.address));
        return this.outputBalanceOf(this.universe, planner);
    }
    gasEstimate() {
        return BigInt(200000n);
    }
    async quote([amountsIn]) {
        return [
            this.underlying.from(await IERC4626__factory.connect(this.shareToken.address.address, this.universe.provider).previewRedeem(amountsIn.amount)),
        ];
    }
    constructor(universe, underlying, shareToken, slippage) {
        super(shareToken.address, [shareToken], [underlying], InteractionConvention.None, DestinationOptions.Recipient, []);
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
//# sourceMappingURL=ERC4626.js.map