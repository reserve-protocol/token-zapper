"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AaveV3Wrapper = exports.BurnSAV3TokensAction = exports.MintSAV3TokensAction = void 0;
const Address_1 = require("../base/Address");
const Approval_1 = require("../base/Approval");
const IStaticATokenV3LM__factory_1 = require("../contracts/factories/contracts/AaveV3.sol/IStaticATokenV3LM__factory");
const Planner_1 = require("../tx-gen/Planner");
const Action_1 = require("./Action");
const aaveMath_1 = require("./aaveMath");
class BaseAaveV3 extends (0, Action_1.Action)('SAV3Token') {
    get reserve() {
        return this.wrapper.reserve;
    }
    async plan(planner, inputs, _, predicted) {
        const inp = inputs[0] ?? predicted[0].amount;
        planner.add(this.planAction(inp), `IStaticATokenV3LM.${this.actionName}(${predicted.join(', ')}) # -> ${await this.quote(predicted)}`);
        return null;
    }
    get outputSlippage() {
        return 0n;
    }
    get saToken() {
        return this.wrapper.saToken;
    }
    get underlyingToken() {
        return this.reserve.reserveToken;
    }
    get returnsOutput() {
        return false;
    }
    get supportsDynamicInput() {
        return true;
    }
    gasEstimate() {
        return BigInt(300000n);
    }
    get lib() {
        return this.wrapper.wrapperLib;
    }
    get universe() {
        return this.wrapper.universe;
    }
    async getRate() {
        return await this.reserve.aave.getRateForReserve(this.reserve);
    }
    toString() {
        return `${this.protocol}.${this.actionName}(${this.inputToken.join(', ')} -> ${this.outputToken.join(', ')})`;
    }
}
class MintSAV3TokensAction extends BaseAaveV3 {
    wrapper;
    actionName = 'deposit';
    planAction(input) {
        return this.lib.deposit(input, this.reserve.universe.execAddress.address, 0, true);
    }
    async quote([amountsIn]) {
        const rate = await this.getRate();
        const x = (0, aaveMath_1.rayDiv)(amountsIn.amount, rate);
        return [this.outputToken[0].fromBigInt(x)];
    }
    constructor(wrapper) {
        super(wrapper.saToken.address, [wrapper.reserveToken], [wrapper.saToken], Action_1.InteractionConvention.ApprovalRequired, Action_1.DestinationOptions.Callee, [new Approval_1.Approval(wrapper.reserveToken, wrapper.saToken.address)]);
        this.wrapper = wrapper;
    }
}
exports.MintSAV3TokensAction = MintSAV3TokensAction;
class BurnSAV3TokensAction extends BaseAaveV3 {
    wrapper;
    actionName = 'redeem';
    planAction(input) {
        return this.lib.redeem(input, this.reserve.universe.execAddress.address, this.universe.execAddress.address, true);
    }
    get outputSlippage() {
        return 1n;
    }
    async quote([amountsIn]) {
        const rate = await this.getRate();
        const x = (0, aaveMath_1.rayMul)(amountsIn.amount, rate);
        return [this.outputToken[0].fromBigInt(x)];
    }
    constructor(wrapper) {
        super(wrapper.saToken.address, [wrapper.saToken], [wrapper.reserveToken], Action_1.InteractionConvention.None, Action_1.DestinationOptions.Callee, []);
        this.wrapper = wrapper;
    }
}
exports.BurnSAV3TokensAction = BurnSAV3TokensAction;
class AaveV3Wrapper {
    reserve;
    saToken;
    wrapperInst;
    mint;
    burn;
    wrapperLib;
    get reserveToken() {
        return this.reserve.reserveToken;
    }
    get universe() {
        return this.reserve.universe;
    }
    constructor(reserve, saToken, wrapperInst) {
        this.reserve = reserve;
        this.saToken = saToken;
        this.wrapperInst = wrapperInst;
        this.mint = new MintSAV3TokensAction(this);
        this.burn = new BurnSAV3TokensAction(this);
        this.wrapperLib = Planner_1.Contract.createContract(this.wrapperInst);
        this.universe.defineMintable(this.mint, this.burn, true);
    }
    static async create(aaveV3, saToken) {
        const wrapperInst = IStaticATokenV3LM__factory_1.IStaticATokenV3LM__factory.connect(saToken.address.address, aaveV3.universe.provider);
        const aToken = await aaveV3.universe.getToken(Address_1.Address.from(await wrapperInst.aToken()));
        const reserve = aaveV3.tokenToReserve.get(aToken);
        if (reserve == null) {
            throw new Error(`No reserve found for ${aToken}`);
        }
        return new AaveV3Wrapper(reserve, saToken, wrapperInst);
    }
    toString() {
        return `IStaticATokenV3LM(${this.saToken}[${this.saToken.address.toShortString()}], ${this.reserveToken})`;
    }
}
exports.AaveV3Wrapper = AaveV3Wrapper;
//# sourceMappingURL=SAV3Tokens.js.map