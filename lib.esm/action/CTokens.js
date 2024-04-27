import { Approval } from '../base/Approval';
import { CEther__factory } from '../contracts/factories/contracts/ICToken.sol/CEther__factory';
import { ICToken__factory } from '../contracts/factories/contracts/ICToken.sol/ICToken__factory';
import { Action, DestinationOptions, InteractionConvention } from './Action';
const ONEFP18 = 10n ** 18n;
export class MintCTokenAction extends Action('CompoundV2') {
    universe;
    underlying;
    cToken;
    rate;
    async plan(planner, inputs) {
        if (this.underlying === this.universe.nativeToken) {
            const lib = this.gen.Contract.createContract(CEther__factory.connect(this.cToken.address.address, this.universe.provider));
            planner.add(lib.mint().withValue(inputs[0]));
            return [
                this.genUtils.erc20.balanceOf(this.universe, planner, this.outputToken[0], this.universe.config.addresses.executorAddress),
            ];
        }
        const lib = this.gen.Contract.createContract(ICToken__factory.connect(this.cToken.address.address, this.universe.provider));
        planner.add(lib.mint(inputs[0]));
        return [
            this.genUtils.erc20.balanceOf(this.universe, planner, this.outputToken[0], this.universe.config.addresses.executorAddress),
        ];
    }
    gasEstimate() {
        return BigInt(175000n);
    }
    rateScale;
    async quote([amountsIn]) {
        await this.universe.refresh(this.address);
        let out = (amountsIn.amount * this.rateScale) /
            this.rate.value /
            this.underlying.scale;
        // out = out - out / 3_000_000n;
        return [this.cToken.fromBigInt(out)];
    }
    get outputSlippage() {
        return 3000000n;
    }
    constructor(universe, underlying, cToken, rate) {
        super(cToken.address, [underlying], [cToken], InteractionConvention.ApprovalRequired, DestinationOptions.Callee, [new Approval(underlying, cToken.address)]);
        this.universe = universe;
        this.underlying = underlying;
        this.cToken = cToken;
        this.rate = rate;
        this.rateScale = ONEFP18 * underlying.scale;
    }
    toString() {
        return `CTokenMint(${this.cToken.toString()})`;
    }
}
export class BurnCTokenAction extends Action('CompoundV2') {
    universe;
    underlying;
    cToken;
    rate;
    get outputSlippage() {
        return 3000000n;
    }
    async plan(planner, inputs) {
        const lib = this.gen.Contract.createContract(ICToken__factory.connect(this.cToken.address.address, this.universe.provider));
        planner.add(lib.redeem(inputs[0]));
        return [
            this.genUtils.erc20.balanceOf(this.universe, planner, this.outputToken[0], this.universe.config.addresses.executorAddress),
        ];
    }
    gasEstimate() {
        return BigInt(175000n);
    }
    rateScale;
    async quote([amountsIn]) {
        await this.universe.refresh(this.address);
        let out = (amountsIn.amount * this.rate.value * this.underlying.scale) /
            this.rateScale;
        return [this.underlying.fromBigInt(out)];
    }
    constructor(universe, underlying, cToken, rate) {
        super(cToken.address, [cToken], [underlying], InteractionConvention.None, DestinationOptions.Recipient, []);
        this.universe = universe;
        this.underlying = underlying;
        this.cToken = cToken;
        this.rate = rate;
        this.rateScale = ONEFP18 * underlying.scale;
    }
    toString() {
        return `CTokenBurn(${this.cToken.toString()})`;
    }
}
//# sourceMappingURL=CTokens.js.map