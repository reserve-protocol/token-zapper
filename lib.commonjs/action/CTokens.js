"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BurnCTokenAction = exports.MintCTokenAction = void 0;
const Approval_1 = require("../base/Approval");
const CEther__factory_1 = require("../contracts/factories/contracts/ICToken.sol/CEther__factory");
const ICToken__factory_1 = require("../contracts/factories/contracts/ICToken.sol/ICToken__factory");
const Action_1 = require("./Action");
const ONEFP18 = 10n ** 18n;
class MintCTokenAction extends (0, Action_1.Action)('CompoundV2') {
    universe;
    underlying;
    cToken;
    rate;
    async plan(planner, inputs) {
        if (this.underlying === this.universe.nativeToken) {
            const lib = this.gen.Contract.createContract(CEther__factory_1.CEther__factory.connect(this.cToken.address.address, this.universe.provider));
            planner.add(lib.mint().withValue(inputs[0]));
            return [
                this.genUtils.erc20.balanceOf(this.universe, planner, this.outputToken[0], this.universe.config.addresses.executorAddress),
            ];
        }
        const lib = this.gen.Contract.createContract(ICToken__factory_1.ICToken__factory.connect(this.cToken.address.address, this.universe.provider));
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
        super(cToken.address, [underlying], [cToken], Action_1.InteractionConvention.ApprovalRequired, Action_1.DestinationOptions.Callee, [new Approval_1.Approval(underlying, cToken.address)]);
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
exports.MintCTokenAction = MintCTokenAction;
class BurnCTokenAction extends (0, Action_1.Action)('CompoundV2') {
    universe;
    underlying;
    cToken;
    rate;
    get outputSlippage() {
        return 3000000n;
    }
    async plan(planner, inputs) {
        const lib = this.gen.Contract.createContract(ICToken__factory_1.ICToken__factory.connect(this.cToken.address.address, this.universe.provider));
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
        super(cToken.address, [cToken], [underlying], Action_1.InteractionConvention.None, Action_1.DestinationOptions.Recipient, []);
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
exports.BurnCTokenAction = BurnCTokenAction;
//# sourceMappingURL=CTokens.js.map