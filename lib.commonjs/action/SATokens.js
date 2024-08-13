"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AaveV2Wrapper = exports.BurnSAV2TokensAction = exports.MintSAV2TokensAction = void 0;
const Address_1 = require("../base/Address");
const Action_1 = require("./Action");
const Approval_1 = require("../base/Approval");
const IStaticATokenLM__factory_1 = require("../contracts/factories/contracts/ISAtoken.sol/IStaticATokenLM__factory");
const Planner_1 = require("../tx-gen/Planner");
const aaveMath_1 = require("./aaveMath");
class BaseAaveV2 extends (0, Action_1.Action)('SAV2Token') {
    get reserve() {
        return this.wrapper.reserve;
    }
    async plan(planner, inputs, _, predicted) {
        const inp = inputs[0] ?? predicted[0].amount;
        planner.add(this.planAction(inp), `IStaticATokenLM.${this.actionName}(${predicted.join(', ')}) # -> ${await this.quote(predicted)}`);
        return null;
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
    get outputSlippage() {
        return 0n;
    }
    toString() {
        return `${this.protocol}.${this.actionName}(${this.inputToken.join(', ')} -> ${this.outputToken.join(', ')})`;
    }
}
class MintSAV2TokensAction extends BaseAaveV2 {
    wrapper;
    actionName = 'deposit';
    planAction(input) {
        return this.lib.deposit(this.universe.execAddress.address, input, 0, true);
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
exports.MintSAV2TokensAction = MintSAV2TokensAction;
class BurnSAV2TokensAction extends BaseAaveV2 {
    wrapper;
    actionName = 'withdraw';
    get outputSlippage() {
        return 1n;
    }
    planAction(input) {
        return this.lib.withdraw(this.universe.execAddress.address, input, true);
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
exports.BurnSAV2TokensAction = BurnSAV2TokensAction;
class AaveV2Wrapper {
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
        this.mint = new MintSAV2TokensAction(this);
        this.burn = new BurnSAV2TokensAction(this);
        this.wrapperLib = Planner_1.Contract.createContract(this.wrapperInst);
        this.universe.defineMintable(this.mint, this.burn, true);
    }
    static async create(aave, saToken) {
        const wrapperInst = IStaticATokenLM__factory_1.IStaticATokenLM__factory.connect(saToken.address.address, aave.universe.provider);
        const aToken = await aave.universe.getToken(Address_1.Address.from(await wrapperInst.ATOKEN()));
        const reserve = aave.tokenToReserve.get(aToken);
        if (reserve == null) {
            throw new Error(`No reserve found for ${aToken}`);
        }
        return new AaveV2Wrapper(reserve, saToken, wrapperInst);
    }
    toString() {
        return `IStaticATokenLM(${this.saToken}[${this.saToken.address.toShortString()}], ${this.reserveToken})`;
    }
}
exports.AaveV2Wrapper = AaveV2Wrapper;
//# sourceMappingURL=SATokens.js.map