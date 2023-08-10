import { parseHexStringIntoBuffer } from '../base/utils';
import { InteractionConvention, DestinationOptions, Action } from './Action';
import { ContractCall } from '../base/ContractCall';
import { Approval } from '../base/Approval';
import { IERC4626__factory } from '../contracts/factories/IERC4626__factory';
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
    gasEstimate() {
        return BigInt(200000n);
    }
    async encode([amountsIn], destination) {
        return new ContractCall(parseHexStringIntoBuffer(vaultInterface.encodeFunctionData('deposit', [
            amountsIn.amount,
            destination.address,
        ])), this.shareToken.address, 0n, this.gasEstimate(), `Deposit ${amountsIn} into ERC4626(${this.shareToken.address}) vault`);
    }
    async quote([amountsIn]) {
        return [
            this.shareToken.from(await IERC4626__factory.connect(this.shareToken.address.address, this.universe.provider).previewDeposit(amountsIn.amount)),
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
    gasEstimate() {
        return BigInt(200000n);
    }
    async encode([amountsIn], destination) {
        return new ContractCall(parseHexStringIntoBuffer(vaultInterface.encodeFunctionData('withdraw', [
            amountsIn.amount,
            destination.address,
            this.universe.config.addresses.executorAddress.address,
        ])), this.shareToken.address, 0n, this.gasEstimate(), `Withdraw ${amountsIn} from ERC4626(${this.shareToken.address}) vault`);
    }
    async quote([amountsIn]) {
        return [
            this.shareToken.from(await IERC4626__factory.connect(this.shareToken.address.address, this.universe.provider).previewDeposit(amountsIn.amount)),
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
}
//# sourceMappingURL=ERC4626.js.map