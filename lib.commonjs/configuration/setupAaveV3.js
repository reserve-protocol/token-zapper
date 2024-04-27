"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupAaveV3 = void 0;
const Address_1 = require("../base/Address");
const contracts_1 = require("../contracts");
const Action_1 = require("../action/Action");
const Approval_1 = require("../base/Approval");
const aaveMath_1 = require("../action/aaveMath");
const setupMintableWithRate_1 = require("./setupMintableWithRate");
const SAV3Tokens_1 = require("../action/SAV3Tokens");
const BaseAaveAction = (0, Action_1.Action)('AAVEV3');
class AaveV3ActionSupply extends BaseAaveAction {
    universe;
    reserve;
    get outputSlippage() {
        return 3000000n;
    }
    quote(amountsIn) {
        return Promise.resolve([this.outputToken[0].from(amountsIn[0].amount)]);
    }
    gasEstimate() {
        return BigInt(300000n);
    }
    async plan(planner, inputs, destination, predictedInputs) {
        const lib = this.gen.Contract.createContract(this.reserve.poolInst);
        planner.add(lib.supply(this.reserve.reserveToken.address.address, inputs[0], destination.address, 0), `AaveV3: supply ${predictedInputs} -> ${await this.quote(predictedInputs)}`);
        return [
            this.generateOutputTokenBalance(this.universe, planner, `bal_${this.outputToken[0].symbol}`),
        ];
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
    get outputSlippage() {
        return 3000000n;
    }
    gasEstimate() {
        return BigInt(300000n);
    }
    async quote([amountsIn]) {
        return [await this.reserve.intoAssets(amountsIn)];
    }
    async plan(planner, inputs, destination, predictedInputs) {
        const lib = this.gen.Contract.createContract(this.reserve.poolInst);
        ///(address asset, uint256 amount, address to)
        planner.add(lib.supply(this.reserve.reserveToken.address.address, inputs[0], destination.address), `AaveV3: withdraw ${predictedInputs} -> ${await this.quote(predictedInputs)}`);
        return [
            this.generateOutputTokenBalance(this.universe, planner, `bal_${this.outputToken[0].symbol}`),
        ];
    }
    constructor(universe, reserve) {
        super(reserve.aToken.address, [reserve.aToken], [reserve.reserveToken], Action_1.InteractionConvention.None, Action_1.DestinationOptions.Recipient, []);
        this.universe = universe;
        this.reserve = reserve;
    }
}
class AaveReserve {
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
        this.supply = new AaveV3ActionSupply(this.universe, this);
        this.withdraw = new AaveV3ActionWithdraw(this.universe, this);
    }
    toString() {
        return `AaveReserve(${this.reserveToken},${this.aToken})`;
    }
}
class AaveV3 {
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
        const reserve = new AaveReserve(this, reserveData, token, aToken, aTokenInst, variableDebtToken, async (shares) => {
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
    }
    static async from(poolInst, universe) {
        const reserveTokens = await Promise.all((await poolInst.getReservesList()).map(async (i) => universe.getToken(Address_1.Address.from(i))));
        const aaveOut = new AaveV3(poolInst, universe);
        await Promise.all(reserveTokens.map(async (token) => {
            return await aaveOut.addReserve(token);
        }));
        return aaveOut;
    }
    toString() {
        return `AaveV3([${this.reserves.join(', ')}])`;
    }
    async addWrapper(wrapper) {
        const wrapperInst = contracts_1.IStaticATokenV3LM__factory.connect(wrapper.address.address, this.universe.provider);
        const aToken = await this.universe.getToken(Address_1.Address.from(await wrapperInst.aToken()));
        const reserve = this.tokenToReserve.get(aToken);
        if (reserve == null) {
            console.warn(`No reserve found for aToken ${aToken.toString()}`);
            return;
        }
        await (0, setupMintableWithRate_1.setupMintableWithRate)(this.universe, contracts_1.IStaticATokenV3LM__factory, wrapper, async (rate, saInst) => {
            return {
                fetchRate: async () => (await saInst.rate()).toBigInt(),
                mint: new SAV3Tokens_1.MintSAV3TokensAction(this.universe, reserve.reserveToken, wrapper, rate),
                burn: new SAV3Tokens_1.BurnSAV3TokensAction(this.universe, reserve.reserveToken, wrapper, rate),
            };
        });
    }
}
const setupAaveV3 = async (universe, poolAddress, wrappers) => {
    const poolInst = contracts_1.IPool__factory.connect(poolAddress.address, universe.provider);
    const aaveInstance = await AaveV3.from(poolInst, universe);
    await Promise.all(wrappers.map(async (wrapper) => await aaveInstance.addWrapper(wrapper)));
    return aaveInstance;
};
exports.setupAaveV3 = setupAaveV3;
//# sourceMappingURL=setupAaveV3.js.map