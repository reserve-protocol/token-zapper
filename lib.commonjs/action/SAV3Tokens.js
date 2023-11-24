"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BurnSAV3TokensAction = exports.MintSAV3TokensAction = void 0;
const utils_1 = require("../base/utils");
const Action_1 = require("./Action");
const ContractCall_1 = require("../base/ContractCall");
const Approval_1 = require("../base/Approval");
const IStaticAV3TokenLM__factory_1 = require("../contracts/factories/contracts/ISAV3Token.sol/IStaticAV3TokenLM__factory");
const ray = 10n ** 27n;
const halfRay = ray / 2n;
const rayMul = (a, b) => {
    return (halfRay + a * b) / ray;
};
function rayDiv(a, b) {
    const halfB = b / 2n;
    return (halfB + a * ray) / b;
}
const saTokenInterface = IStaticAV3TokenLM__factory_1.IStaticAV3TokenLM__factory.createInterface();
class MintSAV3TokensAction extends Action_1.Action {
    universe;
    underlying;
    saToken;
    rate;
    get outputSlippage() {
        return 3000000n;
    }
    gasEstimate() {
        return BigInt(300000n);
    }
    async encode([amountsIn], destination) {
        return new ContractCall_1.ContractCall((0, utils_1.parseHexStringIntoBuffer)(saTokenInterface.encodeFunctionData('deposit', [
            amountsIn.amount,
            destination.address,
            0,
            true,
        ])), this.saToken.address, 0n, this.gasEstimate(), `Mint(${this.saToken}, input: ${amountsIn}, destination: ${destination})`);
    }
    async quote([amountsIn]) {
        await this.universe.refresh(this.address);
        const x = rayDiv(amountsIn.into(this.saToken).amount, this.rate.value);
        return [
            this.saToken.fromBigInt(x),
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
        return `SAV3TokenMint(${this.saToken.toString()})`;
    }
}
exports.MintSAV3TokensAction = MintSAV3TokensAction;
class BurnSAV3TokensAction extends Action_1.Action {
    universe;
    underlying;
    saToken;
    rate;
    get outputSlippage() {
        return 3000000n;
    }
    gasEstimate() {
        return BigInt(300000n);
    }
    async encode([amountsIn], destination) {
        return new ContractCall_1.ContractCall((0, utils_1.parseHexStringIntoBuffer)(saTokenInterface.encodeFunctionData('withdraw', [
            amountsIn.amount,
            destination.address,
            this.universe.config.addresses.executorAddress.address
        ])), this.saToken.address, 0n, this.gasEstimate(), 'Burn ' + this.saToken.name);
    }
    async quote([amountsIn]) {
        await this.universe.refresh(this.address);
        return [
            this.saToken
                .fromBigInt(rayMul(amountsIn.amount, this.rate.value))
                .into(this.underlying),
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
        return `SAV3TokenBurn(${this.saToken.toString()})`;
    }
}
exports.BurnSAV3TokensAction = BurnSAV3TokensAction;
//# sourceMappingURL=SAV3Tokens.js.map