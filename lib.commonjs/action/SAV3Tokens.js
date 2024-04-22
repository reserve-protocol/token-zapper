"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BurnSAV3TokensAction = exports.MintSAV3TokensAction = void 0;
const Approval_1 = require("../base/Approval");
const IStaticAV3TokenLM__factory_1 = require("../contracts/factories/contracts/ISAV3Token.sol/IStaticAV3TokenLM__factory");
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
class MintSAV3TokensAction extends Action_1.Action {
    universe;
    underlying;
    saToken;
    rate;
    get outputSlippage() {
        return 3000000n;
    }
    async plan(planner, inputs, destination, predicted) {
        const lib = this.gen.Contract.createContract(IStaticAV3TokenLM__factory_1.IStaticAV3TokenLM__factory.connect(this.output[0].address.address, this.universe.provider));
        planner.add(lib.deposit(inputs[0], destination.address, 0, true), `AaveV3 mint: ${predicted.join(', ')} -> ${await this.quote(predicted)}`);
        const out = this.genUtils.erc20.balanceOf(this.universe, planner, this.output[0], destination);
        return [out];
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
    inst;
    get outputSlippage() {
        return 3000000n;
    }
    async plan(planner, inputs, destination, predicted) {
        const lib = this.gen.Contract.createContract(IStaticAV3TokenLM__factory_1.IStaticAV3TokenLM__factory.connect(this.input[0].address.address, this.universe.provider));
        planner.add(lib.redeem(inputs[0], destination.address, this.universe.execAddress.address, true), `AaveV3 burn: ${predicted.join(', ')} -> ${await this.quote(predicted)}`);
        const out = this.genUtils.erc20.balanceOf(this.universe, planner, this.output[0], destination);
        return [out];
    }
    gasEstimate() {
        return BigInt(300000n);
    }
    async quote([amountsIn]) {
        IStaticAV3TokenLM__factory_1.IStaticAV3TokenLM__factory.connect(this.input[0].address.address, this.universe.provider);
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
        this.inst = IStaticAV3TokenLM__factory_1.IStaticAV3TokenLM__factory.connect(saToken.address.address, universe.provider);
    }
    toString() {
        return `SAV3TokenBurn(${this.saToken.toString()})`;
    }
}
exports.BurnSAV3TokensAction = BurnSAV3TokensAction;
//# sourceMappingURL=SAV3Tokens.js.map