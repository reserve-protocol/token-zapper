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
    async plan(planner, [input], _, [inputPredicted]) {
        if (this.underlying === this.universe.nativeToken) {
            const lib = this.gen.Contract.createContract(CEther__factory.connect(this.cToken.address.address, this.universe.provider));
            planner.add(lib.mint().withValue(input ?? inputPredicted.amount));
            return this.outputBalanceOf(this.universe, planner);
        }
        const lib = this.gen.Contract.createContract(ICToken__factory.connect(this.cToken.address.address, this.universe.provider));
        planner.add(lib.mint(input ?? inputPredicted.amount));
        return this.outputBalanceOf(this.universe, planner);
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
        return [this.cToken.fromBigInt(out)];
    }
    get outputSlippage() {
        return 30n;
    }
    constructor(universe, underlying, cToken, rate) {
        super(cToken.address, [underlying], [cToken], underlying === universe.nativeToken
            ? InteractionConvention.None
            : InteractionConvention.ApprovalRequired, DestinationOptions.Callee, underlying === universe.nativeToken
            ? []
            : [new Approval(underlying, cToken.address)]);
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
        return 30n;
    }
    async plan(planner, [input], dest, [inputPredicted]) {
        const lib = this.gen.Contract.createContract(ICToken__factory.connect(this.cToken.address.address, this.universe.provider));
        planner.add(lib.redeem(input ?? inputPredicted.amount));
        return this.outputBalanceOf(this.universe, planner);
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
        super(cToken.address, [cToken], [underlying], InteractionConvention.None, DestinationOptions.Callee, []);
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