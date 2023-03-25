"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BurnCTokenAction = exports.MintCTokenAction = void 0;
const contracts_1 = require("../contracts");
const utils_1 = require("../base/utils");
const Action_1 = require("./Action");
const ContractCall_1 = require("../base/ContractCall");
const Approval_1 = require("../base/Approval");
const iCTokenInterface = contracts_1.ICToken__factory.createInterface();
const iCEtherInterface = contracts_1.CEther__factory.createInterface();
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
        return new ContractCall_1.ContractCall((0, utils_1.parseHexStringIntoBuffer)(iCTokenInterface.encodeFunctionData('mint', [amountsIn.amount])), this.cToken.address, 0n, this.gasEstimate(), 'Mint ' + this.cToken.symbol);
    }
    async quote([amountsIn]) {
        await this.universe.refresh(this.address);
        return [
            this.cToken.quantityFromBigInt((amountsIn.amount * this.rateScale) /
                this.rate.value /
                this.underlying.scale),
        ];
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
    gasEstimate() {
        return BigInt(175000n);
    }
    rateScale;
    async encode([amountsIn]) {
        return new ContractCall_1.ContractCall((0, utils_1.parseHexStringIntoBuffer)(iCTokenInterface.encodeFunctionData('redeem', [amountsIn.amount])), this.cToken.address, 0n, this.gasEstimate(), 'Burn ' + this.cToken.symbol);
    }
    async quote([amountsIn]) {
        await this.universe.refresh(this.address);
        return [
            this.underlying.quantityFromBigInt((amountsIn.amount * this.rate.value * this.underlying.scale) /
                this.rateScale),
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