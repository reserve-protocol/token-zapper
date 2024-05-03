"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BurnSAV3TokensAction = exports.MintSAV3TokensAction = void 0;
const Approval_1 = require("../base/Approval");
const IStaticATokenV3LM__factory_1 = require("../contracts/factories/contracts/AaveV3.sol/IStaticATokenV3LM__factory");
const Action_1 = require("./Action");
const ray = 10n ** 27n;
const halfRay = ray / 2n;
const rayMul = (a, b) => {
    return (halfRay + a * b) / ray;
};
function rayDiv(a, b) {
    const halfB = b / 2n;
    return (halfB + a * ray) / b;
}
class MintSAV3TokensAction extends (0, Action_1.Action)('AaveV3') {
    universe;
    underlying;
    saToken;
    rate;
    get outputSlippage() {
        return 1n;
    }
    async plan(planner, inputs, destination, predicted) {
        const inp = inputs[0] ?? predicted[0].amount;
        const lib = this.gen.Contract.createContract(IStaticATokenV3LM__factory_1.IStaticATokenV3LM__factory.connect(this.outputToken[0].address.address, this.universe.provider));
        planner.add(lib.deposit(inp, this.universe.execAddress.address, 0, true), `AaveV3 mint: ${predicted.join(', ')} -> ${await this.quote(predicted)}`);
        return this.outputBalanceOf(this.universe, planner);
    }
    gasEstimate() {
        return BigInt(300000n);
    }
    async quote([amountsIn]) {
        await this.universe.refresh(this.address);
        const x = rayDiv(amountsIn.into(this.saToken).amount, this.rate.value);
        return [this.saToken.fromBigInt(x)];
    }
    constructor(universe, underlying, saToken, rate) {
        super(saToken.address, [underlying], [saToken], Action_1.InteractionConvention.ApprovalRequired, Action_1.DestinationOptions.Callee, [new Approval_1.Approval(underlying, saToken.address)]);
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
class BurnSAV3TokensAction extends (0, Action_1.Action)('AaveV3') {
    universe;
    underlying;
    saToken;
    rate;
    get outputSlippage() {
        return 1n;
    }
    async plan(planner, inputs, destination, predicted) {
        const lib = this.gen.Contract.createContract(IStaticATokenV3LM__factory_1.IStaticATokenV3LM__factory.connect(this.inputToken[0].address.address, this.universe.provider));
        planner.add(lib.redeem(inputs[0], destination.address, this.universe.execAddress.address, true), `AaveV3 burn: ${predicted.join(', ')} -> ${await this.quote(predicted)}`);
        return this.outputBalanceOf(this.universe, planner);
    }
    gasEstimate() {
        return BigInt(300000n);
    }
    async quote([amountsIn]) {
        IStaticATokenV3LM__factory_1.IStaticATokenV3LM__factory.connect(this.inputToken[0].address.address, this.universe.provider);
        await this.universe.refresh(this.address);
        return [
            this.saToken
                .fromBigInt(rayMul(amountsIn.amount, this.rate.value))
                .into(this.underlying),
        ];
    }
    constructor(universe, underlying, saToken, rate) {
        super(saToken.address, [saToken], [underlying], Action_1.InteractionConvention.None, Action_1.DestinationOptions.Callee, []);
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