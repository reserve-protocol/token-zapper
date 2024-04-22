"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BurnSATokensAction = exports.MintSATokensAction = void 0;
const Action_1 = require("./Action");
const Approval_1 = require("../base/Approval");
const IStaticATokenLM__factory_1 = require("../contracts/factories/contracts/ISAtoken.sol/IStaticATokenLM__factory");
const ray = 10n ** 27n;
const halfRay = ray / 2n;
const rayMul = (a, b) => {
    return (halfRay + a * b) / ray;
};
function rayDiv(a, b) {
    const halfB = b / 2n;
    return (halfB + a * ray) / b;
}
const saTokenInterface = IStaticATokenLM__factory_1.IStaticATokenLM__factory.createInterface();
class MintSATokensAction extends Action_1.Action {
    universe;
    underlying;
    saToken;
    rate;
    get outputSlippage() {
        return 3000000n;
    }
    async plan(planner, inputs, destination) {
        const lib = this.gen.Contract.createContract(IStaticATokenLM__factory_1.IStaticATokenLM__factory.connect(this.saToken.address.address, this.universe.provider));
        const out = planner.add(lib.deposit(destination.address, inputs[0], 0, true), undefined, `bal_${this.outputToken[0].symbol}`);
        return [out];
    }
    gasEstimate() {
        return BigInt(300000n);
    }
    async quote([amountsIn]) {
        await this.universe.refresh(this.address);
        return [
            this.saToken.fromBigInt(rayDiv(amountsIn.into(this.saToken).amount, this.rate.value)),
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
    get outputSlippage() {
        return 3000000n;
    }
    async plan(planner, inputs, destination) {
        const lib = this.gen.Contract.createContract(IStaticATokenLM__factory_1.IStaticATokenLM__factory.connect(this.saToken.address.address, this.universe.provider));
        const out = planner.add(lib.withdraw(destination.address, inputs[0], true), undefined, `bal_${this.outputToken[0].symbol}`);
        return [out];
    }
    gasEstimate() {
        return BigInt(300000n);
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
        return `SATokenBurn(${this.saToken.toString()})`;
    }
}
exports.BurnSATokensAction = BurnSATokensAction;
//# sourceMappingURL=SATokens.js.map