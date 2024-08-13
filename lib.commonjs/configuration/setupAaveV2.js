"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupAaveV2 = exports.AaveV2Deployment = exports.AaveV2Reserve = void 0;
const Address_1 = require("../base/Address");
const Action_1 = require("../action/Action");
const SATokens_1 = require("../action/SATokens");
const aaveMath_1 = require("../action/aaveMath");
const Approval_1 = require("../base/Approval");
const DefaultMap_1 = require("../base/DefaultMap");
const AaveV2_sol_1 = require("../contracts/factories/contracts/AaveV2.sol");
class BaseAaveV2Action extends (0, Action_1.Action)('AAVEV2') {
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
    get outToken() {
        return this.outputToken[0];
    }
    async quote(amountsIn) {
        return amountsIn.map((tok, i) => tok.into(this.outToken).sub(this.outToken.fromBigInt(1n)));
    }
    gasEstimate() {
        return BigInt(300000n);
    }
}
class AaveV2ActionSupply extends BaseAaveV2Action {
    universe;
    reserve;
    async plan(planner, inputs, destination, predictedInputs) {
        const lib = this.gen.Contract.createContract(this.reserve.poolInst);
        planner.add(lib.supply(this.reserve.reserveToken.address.address, inputs[0], this.universe.execAddress.address, 0), `AaveV2: supply ${predictedInputs} -> ${await this.quote(predictedInputs)}`);
        return null;
    }
    constructor(universe, reserve) {
        super(reserve.aToken.address, [reserve.reserveToken], [reserve.aToken], Action_1.InteractionConvention.ApprovalRequired, Action_1.DestinationOptions.Recipient, [new Approval_1.Approval(reserve.reserveToken, reserve.aToken.address)]);
        this.universe = universe;
        this.reserve = reserve;
    }
}
class AaveV2ActionWithdraw extends BaseAaveV2Action {
    universe;
    reserve;
    gasEstimate() {
        return BigInt(300000n);
    }
    get outputSlippage() {
        return 1n;
    }
    async quote([amountsIn]) {
        return [await this.reserve.intoAssets(amountsIn)];
    }
    async plan(planner, inputs, _, predictedInputs) {
        const lib = this.gen.Contract.createContract(this.reserve.poolInst);
        ///(address asset, uint256 amount, address to)
        planner.add(lib.withdraw(this.reserve.reserveToken.address.address, inputs[0], this.universe.execAddress.address), `AaveV2: withdraw ${predictedInputs} -> ${await this.quote(predictedInputs)}`);
        return null;
    }
    constructor(universe, reserve) {
        super(reserve.aToken.address, [reserve.aToken], [reserve.reserveToken], Action_1.InteractionConvention.None, Action_1.DestinationOptions.Recipient, []);
        this.universe = universe;
        this.reserve = reserve;
    }
}
class AaveV2Reserve {
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
    constructor(aave, reserveData, reserveToken, aToken, aTokenInst, variableDebtToken, intoAssets) {
        this.aave = aave;
        this.reserveData = reserveData;
        this.reserveToken = reserveToken;
        this.aToken = aToken;
        this.aTokenInst = aTokenInst;
        this.variableDebtToken = variableDebtToken;
        this.intoAssets = intoAssets;
        this.supply = new AaveV2ActionSupply(this.universe, this);
        this.withdraw = new AaveV2ActionWithdraw(this.universe, this);
        this.universe.defineMintable(this.supply, this.withdraw, false);
    }
    async queryRate() {
        return (await this.aave.poolInst.callStatic.getReserveNormalizedIncome(this.reserveToken.address.address, { blockTag: "pending" })).toBigInt();
    }
    toString() {
        return `AaveReserve(underlying=${this.reserveToken},aToken=${this.aToken})`;
    }
}
exports.AaveV2Reserve = AaveV2Reserve;
class AaveV2Deployment {
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
        const aTokenInst = AaveV2_sol_1.IAToken__factory.connect(aTokenAddress, this.universe.provider);
        const reserve = new AaveV2Reserve(this, reserveData, token, aToken, aTokenInst, variableDebtToken, async (shares) => {
            const factor = await this.poolInst.getReserveNormalizedIncome(token.address.address);
            return token.from((0, aaveMath_1.rayMul)(shares.amount, factor.toBigInt()));
        });
        this.reserves.push(reserve);
        this.tokenToReserve.set(reserve.aToken, reserve);
        this.universe.addAction(reserve.supply);
        this.universe.addAction(reserve.withdraw);
        return reserve;
    }
    constructor(poolInst, universe) {
        this.poolInst = poolInst;
        this.universe = universe;
        this.rateCache = universe.createCache(async (reserve) => await reserve.queryRate(), 1);
    }
    static async from(poolInst, universe) {
        const reserveTokens = await Promise.all((await poolInst.getReservesList()).map(async (i) => universe.getToken(Address_1.Address.from(i))));
        const aaveOut = new AaveV2Deployment(poolInst, universe);
        await Promise.all(reserveTokens.map(async (token) => {
            return await aaveOut.addReserve(token);
        }));
        return aaveOut;
    }
    toString() {
        return `AaveV3([${this.reserves.join(', ')}])`;
    }
    rateCache;
    async getRateForReserve(reserve) {
        return await this.rateCache.get(reserve);
    }
    wrappers = [];
    wrapperTokens = new DefaultMap_1.DefaultMap((wrapper) => SATokens_1.AaveV2Wrapper.create(this, wrapper).then((w) => {
        this.wrappers.push(w);
        return w;
    }));
    async addWrapper(wrapper) {
        return await this.wrapperTokens.get(wrapper);
    }
    describe() {
        const out = [];
        out.push('AaveV2Deployment {');
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
exports.AaveV2Deployment = AaveV2Deployment;
const setupAaveV2 = async (universe, config) => {
    const poolAddress = Address_1.Address.from(config.pool);
    const poolInst = AaveV2_sol_1.ILendingPool__factory.connect(poolAddress.address, universe.provider);
    const aaveInstance = await AaveV2Deployment.from(poolInst, universe);
    const wrappers = await Promise.all(config.wrappers.map(Address_1.Address.from).map((addr) => universe.getToken(addr)));
    await Promise.all(wrappers.map(async (i) => await aaveInstance.addWrapper(i)));
    return aaveInstance;
};
exports.setupAaveV2 = setupAaveV2;
//# sourceMappingURL=setupAaveV2.js.map