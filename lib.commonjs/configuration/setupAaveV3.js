"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupAaveV3 = exports.AaveV3Deployment = exports.AaveV3Reserve = void 0;
const Address_1 = require("../base/Address");
const contracts_1 = require("../contracts");
const Action_1 = require("../action/Action");
const SAV3Tokens_1 = require("../action/SAV3Tokens");
const aaveMath_1 = require("../action/aaveMath");
const Approval_1 = require("../base/Approval");
const DefaultMap_1 = require("../base/DefaultMap");
class BaseAaveAction extends (0, Action_1.Action)('AAVEV3') {
    get outToken() {
        return this.outputToken[0];
    }
    async quote(amountsIn) {
        return amountsIn.map((tok, i) => tok.into(this.outToken).sub(this.outToken.fromBigInt(1n)));
    }
    get supportsDynamicInput() {
        return true;
    }
    get oneUsePrZap() {
        return false;
    }
    get returnsOutput() {
        return false;
    }
    get outputSlippage() {
        return 0n;
    }
    toString() {
        return `${this.actionName}(${this.inputToken.join(',')} -> ${this.outputToken.join(',')})`;
    }
}
class AaveV3ActionSupply extends BaseAaveAction {
    universe;
    reserve;
    gasEstimate() {
        return BigInt(300000n);
    }
    async plan(planner, inputs, destination, predictedInputs) {
        const lib = this.gen.Contract.createContract(this.reserve.poolInst);
        planner.add(lib.supply(this.reserve.reserveToken.address.address, inputs[0], this.universe.execAddress.address, 0), `AaveV3: supply ${predictedInputs} -> ${await this.quote(predictedInputs)}`);
        return null;
    }
    get actionName() {
        return 'Supply';
    }
    constructor(universe, reserve) {
        super(reserve.aToken.address, [reserve.reserveToken], [reserve.aToken], Action_1.InteractionConvention.ApprovalRequired, Action_1.DestinationOptions.Recipient, [new Approval_1.Approval(reserve.reserveToken, reserve.aToken.address)]);
        this.universe = universe;
        this.reserve = reserve;
    }
}
class AaveV3ActionWithdraw extends BaseAaveAction {
    universe;
    reserve;
    gasEstimate() {
        return BigInt(300000n);
    }
    get actionName() {
        return 'Withdraw';
    }
    async quote([amountsIn]) {
        return [await this.reserve.intoAssets(amountsIn)];
    }
    get outputSlippage() {
        return 1000n;
    }
    async plan(planner, inputs, _, predictedInputs) {
        const lib = this.gen.Contract.createContract(this.reserve.poolInst);
        planner.add(lib.withdraw(this.reserve.reserveToken.address.address, inputs[0], this.universe.execAddress.address), `AaveV3: withdraw ${predictedInputs} -> ${await this.quote(predictedInputs)}`);
        return null;
    }
    constructor(universe, reserve) {
        super(reserve.aToken.address, [reserve.aToken], [reserve.reserveToken], Action_1.InteractionConvention.None, Action_1.DestinationOptions.Recipient, []);
        this.universe = universe;
        this.reserve = reserve;
    }
}
class AaveV3Reserve {
    aave;
    reserveData;
    reserveToken;
    aToken;
    aTokenInst;
    variableDebtToken;
    intoAssets;
    supply;
    withdraw;
    get universe() {
        return this.aave.universe;
    }
    get poolInst() {
        return this.aave.poolInst;
    }
    async queryRate() {
        return (await this.aave.poolInst.callStatic.getReserveNormalizedIncome(this.reserveToken.address.address, { blockTag: "pending" })).toBigInt();
    }
    constructor(aave, reserveData, reserveToken, aToken, aTokenInst, variableDebtToken, intoAssets) {
        this.aave = aave;
        this.reserveData = reserveData;
        this.reserveToken = reserveToken;
        this.aToken = aToken;
        this.aTokenInst = aTokenInst;
        this.variableDebtToken = variableDebtToken;
        this.intoAssets = intoAssets;
        this.supply = new AaveV3ActionSupply(this.universe, this);
        this.withdraw = new AaveV3ActionWithdraw(this.universe, this);
        this.universe.defineMintable(this.supply, this.withdraw, false);
    }
    toString() {
        return `AaveV3Reserve(underlying=${this.reserveToken},aToken=${this.aToken})`;
    }
}
exports.AaveV3Reserve = AaveV3Reserve;
class AaveV3Deployment {
    poolInst;
    universe;
    reserves = [];
    tokenToReserve = new Map();
    get addresss() {
        return Address_1.Address.from(this.poolInst.address);
    }
    async addReserve(token) {
        const reserveData = await this.poolInst.getReserveData(token.address.address);
        const { aTokenAddress, variableDebtTokenAddress } = reserveData;
        const [aToken, variableDebtToken] = await Promise.all([
            this.universe.getToken(Address_1.Address.from(aTokenAddress)),
            this.universe.getToken(Address_1.Address.from(variableDebtTokenAddress)),
        ]);
        const aTokenInst = contracts_1.IAToken__factory.connect(aTokenAddress, this.universe.provider);
        const reserve = new AaveV3Reserve(this, reserveData, token, aToken, aTokenInst, variableDebtToken, async (shares) => {
            const factor = await this.poolInst.getReserveNormalizedIncome(token.address.address);
            return token.from((0, aaveMath_1.rayMul)(shares.amount, factor.toBigInt()));
        });
        this.reserves.push(reserve);
        this.tokenToReserve.set(reserve.aToken, reserve);
        this.universe.addAction(reserve.supply);
        this.universe.addAction(reserve.withdraw);
        return reserve;
    }
    rateCache;
    async getRateForReserve(reserve) {
        return await this.rateCache.get(reserve);
    }
    constructor(poolInst, universe) {
        this.poolInst = poolInst;
        this.universe = universe;
        this.rateCache = universe.createCache(async (reserve) => await reserve.queryRate(), 1);
    }
    async getRateForAToken(aToken) {
        const reserve = this.tokenToReserve.get(aToken);
        if (reserve == null) {
            throw new Error(`No reserve found for aToken ${aToken.toString()}`);
        }
        return await this.rateCache.get(reserve);
    }
    static async from(poolInst, universe) {
        const reserveTokens = await Promise.all((await poolInst.getReservesList()).map(async (i) => universe.getToken(Address_1.Address.from(i))));
        const aaveOut = new AaveV3Deployment(poolInst, universe);
        await Promise.all(reserveTokens.map(async (token) => {
            return await aaveOut.addReserve(token);
        }));
        return aaveOut;
    }
    toString() {
        return `AaveV3([${this.reserves.join(', ')}])`;
    }
    wrappers = [];
    wrapperTokens = new DefaultMap_1.DefaultMap((wrapper) => SAV3Tokens_1.AaveV3Wrapper.create(this, wrapper).then((w) => {
        this.wrappers.push(w);
        return w;
    }));
    async addWrapper(wrapper) {
        return await this.wrapperTokens.get(wrapper);
    }
    describe() {
        const out = [];
        out.push('AaveV3Deployment {');
        out.push(`  pool: ${this.poolInst.address}`);
        out.push(`  reserves: [`);
        out.push(...this.reserves.map((i) => `    ${i.toString()}`));
        out.push(`  ]`);
        out.push(`  wrappers: [`);
        out.push(...this.wrappers.map((i) => `    ${i.toString()}`));
        out.push(`  ]`);
        out.push('}');
        return out;
    }
}
exports.AaveV3Deployment = AaveV3Deployment;
const setupAaveV3 = async (universe, config) => {
    const poolAddress = Address_1.Address.from(config.pool);
    const poolInst = contracts_1.IPool__factory.connect(poolAddress.address, universe.provider);
    const aaveInstance = await AaveV3Deployment.from(poolInst, universe);
    const wrappers = await Promise.all(config.wrappers.map(Address_1.Address.from).map((addr) => universe.getToken(addr)));
    await Promise.all(wrappers.map(async (i) => await aaveInstance.addWrapper(i)));
    return aaveInstance;
};
exports.setupAaveV3 = setupAaveV3;
//# sourceMappingURL=setupAaveV3.js.map