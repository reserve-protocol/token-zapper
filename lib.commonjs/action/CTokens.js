"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BurnCTokenAction = exports.MintCTokenAction = void 0;
const utils_1 = require("../base/utils");
const Action_1 = require("./Action");
const ContractCall_1 = require("../base/ContractCall");
const Approval_1 = require("../base/Approval");
const ICToken__factory_1 = require("../contracts/factories/contracts/ICToken.sol/ICToken__factory");
const CEther__factory_1 = require("../contracts/factories/contracts/ICToken.sol/CEther__factory");
const iCTokenInterface = ICToken__factory_1.ICToken__factory.createInterface();
const iCEtherInterface = CEther__factory_1.CEther__factory.createInterface();
const ONEFP18 = 10n ** 18n;
class MintCTokenAction extends Action_1.Action {
    universe;
    underlying;
    cToken;
    rate;
    gasEstimate() {
        return BigInt(175000n);
    }
    rateScale;
    async encode([amountsIn]) {
        if (this.underlying === this.universe.nativeToken) {
            return new ContractCall_1.ContractCall((0, utils_1.parseHexStringIntoBuffer)(iCEtherInterface.encodeFunctionData('mint')), this.cToken.address, amountsIn.amount, this.gasEstimate(), 'Mint CEther');
        }
        return new ContractCall_1.ContractCall((0, utils_1.parseHexStringIntoBuffer)(iCTokenInterface.encodeFunctionData('mint', [amountsIn.amount])), this.cToken.address, 0n, this.gasEstimate(), `Deposit ${amountsIn} into ${this.cToken.symbol}`);
    }
    async quote([amountsIn]) {
        await this.universe.refresh(this.address);
        let out = (amountsIn.amount * this.rateScale) / this.rate.value / this.underlying.scale;
        // out = out - out / 3_000_000n;
        return [
            this.cToken.fromBigInt(out),
        ];
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
class BurnCTokenAction extends Action_1.Action {
    universe;
    underlying;
    cToken;
    rate;
    get outputSlippage() {
        return 3000000n;
    }
    gasEstimate() {
        return BigInt(175000n);
    }
    rateScale;
    async encode([amountsIn]) {
        return new ContractCall_1.ContractCall((0, utils_1.parseHexStringIntoBuffer)(iCTokenInterface.encodeFunctionData('redeem', [amountsIn.amount])), this.cToken.address, 0n, this.gasEstimate(), 'Burn ' + this.cToken.symbol);
    }
    async quote([amountsIn]) {
        await this.universe.refresh(this.address);
        let out = (amountsIn.amount * this.rate.value * this.underlying.scale) / this.rateScale;
        return [
            this.underlying.fromBigInt(out),
        ];
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