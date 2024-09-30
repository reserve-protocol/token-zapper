import { Address } from '../base/Address';
import { Action, DestinationOptions, InteractionConvention } from './Action';
import { Approval } from '../base/Approval';
import { IStaticATokenLM__factory } from '../contracts/factories/contracts/ISAtoken.sol/IStaticATokenLM__factory';
import { Contract } from '../tx-gen/Planner';
import { rayDiv, rayMul } from './aaveMath';
class BaseAaveV2 extends Action('SAV2Token') {
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
export class MintSAV2TokensAction extends BaseAaveV2 {
    wrapper;
    actionName = 'deposit';
    planAction(input) {
        return this.lib.deposit(this.universe.execAddress.address, input, 0, true);
    }
    async quote([amountsIn]) {
        const rate = await this.getRate();
        const x = rayDiv(amountsIn.amount, rate);
        return [this.outputToken[0].fromBigInt(x)];
    }
    constructor(wrapper) {
        super(wrapper.saToken.address, [wrapper.reserveToken], [wrapper.saToken], InteractionConvention.ApprovalRequired, DestinationOptions.Callee, [new Approval(wrapper.reserveToken, wrapper.saToken.address)]);
        this.wrapper = wrapper;
    }
}
export class BurnSAV2TokensAction extends BaseAaveV2 {
    wrapper;
    actionName = 'withdraw';
    planAction(input) {
        return this.lib.withdraw(this.universe.execAddress.address, input, true);
    }
    async quote([amountsIn]) {
        const rate = await this.getRate();
        const x = rayMul(amountsIn.amount, rate);
        return [this.outputToken[0].fromBigInt(x)];
    }
    constructor(wrapper) {
        super(wrapper.saToken.address, [wrapper.saToken], [wrapper.reserveToken], InteractionConvention.None, DestinationOptions.Callee, []);
        this.wrapper = wrapper;
    }
}
export class AaveV2Wrapper {
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
        this.wrapperLib = Contract.createContract(this.wrapperInst);
        this.universe.defineMintable(this.mint, this.burn, true);
    }
    static async create(aave, saToken) {
        const wrapperInst = IStaticATokenLM__factory.connect(saToken.address.address, aave.universe.provider);
        const aToken = await aave.universe.getToken(Address.from(await wrapperInst.ATOKEN()));
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
//# sourceMappingURL=SATokens.js.map