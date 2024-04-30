"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BurnSATokensAction = exports.MintSATokensAction = void 0;
const Action_1 = require("./Action");
const Approval_1 = require("../base/Approval");
const IStaticATokenLM__factory_1 = require("../contracts/factories/contracts/ISAtoken.sol/IStaticATokenLM__factory");
const aaveMath_1 = require("./aaveMath");
class MintSATokensAction extends (0, Action_1.Action)('AaveV2') {
    universe;
    underlying;
    saToken;
    rate;
    get outputSlippage() {
        return 1n;
    }
    async plan(planner, [input], _, [predicted]) {
        const lib = this.gen.Contract.createContract(IStaticATokenLM__factory_1.IStaticATokenLM__factory.connect(this.saToken.address.address, this.universe.provider));
        const out = planner.add(lib.deposit(this.universe.execAddress.address, input ?? predicted.amount, 0, true), undefined, `bal_${this.outputToken[0].symbol}`);
        return [out];
    }
    gasEstimate() {
        return BigInt(300000n);
    }
    async quote([amountsIn]) {
        await this.universe.refresh(this.address);
        return [
            this.saToken.fromBigInt((0, aaveMath_1.rayDiv)(amountsIn.into(this.saToken).amount, this.rate.value)),
        ];
    }
    constructor(universe, underlying, saToken, rate) {
        super(saToken.address, [underlying], [saToken], Action_1.InteractionConvention.ApprovalRequired, Action_1.DestinationOptions.Callee, [new Approval_1.Approval(underlying, saToken.address)]);
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
class BurnSATokensAction extends (0, Action_1.Action)('AaveV2') {
    universe;
    underlying;
    saToken;
    rate;
    get outputSlippage() {
        return 1n;
    }
    async plan(planner, [input], _, [predicted]) {
        const lib = this.gen.Contract.createContract(IStaticATokenLM__factory_1.IStaticATokenLM__factory.connect(this.saToken.address.address, this.universe.provider));
        const out = planner.add(lib.withdraw(this.universe.execAddress.address, input ?? predicted.amount, true), undefined, `bal_${this.outputToken[0].symbol}`);
        return [out];
    }
    gasEstimate() {
        return BigInt(300000n);
    }
    async quote([amountsIn]) {
        await this.universe.refresh(this.address);
        return [
            this.saToken
                .fromBigInt((0, aaveMath_1.rayMul)(amountsIn.amount, this.rate.value))
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
        return `SATokenBurn(${this.saToken.toString()})`;
    }
}
exports.BurnSATokensAction = BurnSATokensAction;
//# sourceMappingURL=SATokens.js.map