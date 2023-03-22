"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BurnSATokensAction = exports.MintSATokensAction = void 0;
const contracts_1 = require("../contracts");
const utils_1 = require("../base/utils");
const Action_1 = require("./Action");
const ContractCall_1 = require("../base/ContractCall");
const Approval_1 = require("../base/Approval");
const ray = 10n ** 27n;
const halfRay = ray / 2n;
const rayMul = (a, b) => {
    return (halfRay + a * b) / ray;
};
function rayDiv(a, b) {
    const halfB = b / 2n;
    return (halfB + a * ray) / b;
}
const saTokenInterface = contracts_1.IStaticATokenLM__factory.createInterface();
class MintSATokensAction extends Action_1.Action {
    universe;
    underlying;
    saToken;
    rate;
    async encode([amountsIn], destination) {
        return new ContractCall_1.ContractCall((0, utils_1.parseHexStringIntoBuffer)(saTokenInterface.encodeFunctionData('deposit', [
            destination.address,
            amountsIn.amount,
            0,
            true,
        ])), this.saToken.address, 0n, 'Mint ' + this.saToken.name);
    }
    async quote([amountsIn]) {
        return [
            this.saToken.quantityFromBigInt(rayDiv(amountsIn.convertTo(this.saToken).amount, this.rate.value)),
        ];
    }
    constructor(universe, underlying, saToken, rate) {
        super(saToken.address, [underlying], [saToken], Action_1.InteractionConvention.ApprovalRequired, Action_1.DestinationOptions.Recipient, [new Approval_1.Approval(underlying, saToken.address)]);
        this.universe = universe;
        this.underlying = underlying;
        this.saToken = saToken;
        this.rate = rate;
    }
    toString() {
        return `SATokenMint(${this.saToken.toString()})`;
    }
}
exports.MintSATokensAction = MintSATokensAction;
class BurnSATokensAction extends Action_1.Action {
    universe;
    underlying;
    saToken;
    rate;
    async encode([amountsIn], destination) {
        return new ContractCall_1.ContractCall((0, utils_1.parseHexStringIntoBuffer)(saTokenInterface.encodeFunctionData('withdraw', [
            destination.address,
            amountsIn.amount,
            true,
        ])), this.saToken.address, 0n, 'Burn ' + this.saToken.name);
    }
    async quote([amountsIn]) {
        return [
            this.saToken
                .quantityFromBigInt(rayMul(amountsIn.amount, this.rate.value))
                .convertTo(this.underlying),
        ];
    }
    constructor(universe, underlying, saToken, rate) {
        super(saToken.address, [saToken], [underlying], Action_1.InteractionConvention.None, Action_1.DestinationOptions.Recipient, []);
        this.universe = universe;
        this.underlying = underlying;
        this.saToken = saToken;
        this.rate = rate;
    }
    toString() {
        return `SATokenBurn(${this.saToken.toString()})`;
    }
}
exports.BurnSATokensAction = BurnSATokensAction;
//# sourceMappingURL=SATokens.js.map