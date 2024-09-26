import { Address } from '../base/Address';
import { Action, DestinationOptions, InteractionConvention, } from '../action/Action';
import { AaveV2Wrapper } from '../action/SATokens';
import { rayMul } from '../action/aaveMath';
import { Approval } from '../base/Approval';
import { DefaultMap } from '../base/DefaultMap';
import { IAToken__factory, ILendingPool__factory, } from '../contracts/factories/contracts/AaveV2.sol';
class BaseAaveV2Action extends Action('AAVEV2') {
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
        super(reserve.aToken.address, [reserve.reserveToken], [reserve.aToken], InteractionConvention.ApprovalRequired, DestinationOptions.Recipient, [new Approval(reserve.reserveToken, reserve.aToken.address)]);
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
        super(reserve.aToken.address, [reserve.aToken], [reserve.reserveToken], InteractionConvention.None, DestinationOptions.Recipient, []);
        this.universe = universe;
        this.reserve = reserve;
    }
}
export class AaveV2Reserve {
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
export class AaveV2Deployment {
    poolInst;
    universe;
    reserves = [];
    tokenToReserve = new Map();
    get addresss() {
        return Address.from(this.poolInst.address);
    }
    async addReserve(token) {
        const reserveData = await this.poolInst.getReserveData(token.address.address);
        const { aTokenAddress, variableDebtTokenAddress } = reserveData;
        const [aToken, variableDebtToken] = await Promise.all([
            this.universe.getToken(Address.from(aTokenAddress)),
            this.universe.getToken(Address.from(variableDebtTokenAddress)),
        ]);
        const aTokenInst = IAToken__factory.connect(aTokenAddress, this.universe.provider);
        const reserve = new AaveV2Reserve(this, reserveData, token, aToken, aTokenInst, variableDebtToken, async (shares) => {
            const factor = await this.poolInst.getReserveNormalizedIncome(token.address.address);
            return token.from(rayMul(shares.amount, factor.toBigInt()));
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
        const reserveTokens = await Promise.all((await poolInst.getReservesList()).map(async (i) => universe.getToken(Address.from(i))));
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
    wrapperTokens = new DefaultMap((wrapper) => AaveV2Wrapper.create(this, wrapper).then((w) => {
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
export const setupAaveV2 = async (universe, config) => {
    const poolAddress = Address.from(config.pool);
    const poolInst = ILendingPool__factory.connect(poolAddress.address, universe.provider);
    const aaveInstance = await AaveV2Deployment.from(poolInst, universe);
    const wrappers = await Promise.all(config.wrappers.map(Address.from).map((addr) => universe.getToken(addr)));
    await Promise.all(wrappers.map(async (i) => await aaveInstance.addWrapper(i)));
    return aaveInstance;
};
//# sourceMappingURL=setupAaveV2.js.map