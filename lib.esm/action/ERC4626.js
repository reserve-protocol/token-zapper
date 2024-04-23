import { Approval } from '../base/Approval';
import { IERC4626__factory } from '../contracts/factories/contracts/IERC4626__factory';
import { Action, DestinationOptions, InteractionConvention } from './Action';
const vaultInterface = IERC4626__factory.createInterface();
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
export class ERC4626DepositAction extends Action {
    universe;
    underlying;
    shareToken;
    get outputSlippage() {
        return 3000000n;
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
        return [
            this.shareToken.from(x)
        ];
    }
    constructor(universe, underlying, shareToken) {
        super(shareToken.address, [underlying], [shareToken], InteractionConvention.ApprovalRequired, DestinationOptions.Callee, [new Approval(underlying, shareToken.address)]);
        this.universe = universe;
        this.underlying = underlying;
        this.shareToken = shareToken;
    }
    toString() {
        return `ERC4626Deposit(${this.shareToken.toString()})`;
    }
}
export class ERC4626WithdrawAction extends Action {
    universe;
    underlying;
    shareToken;
    async plan(planner, inputs, destination) {
        const lib = this.gen.Contract.createContract(IERC4626__factory.connect(this.shareToken.address.address, this.universe.provider));
        const out = planner.add(lib.redeem(inputs[0], destination.address, this.universe.config.addresses.executorAddress.address));
        return [out];
    }
    gasEstimate() {
        return BigInt(200000n);
    }
    async quote([amountsIn]) {
        return [
            this.underlying.from(await IERC4626__factory.connect(this.shareToken.address.address, this.universe.provider).previewRedeem(amountsIn.amount)),
        ];
    }
    constructor(universe, underlying, shareToken) {
        super(shareToken.address, [shareToken], [underlying], InteractionConvention.None, DestinationOptions.Recipient, []);
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
//# sourceMappingURL=ERC4626.js.map