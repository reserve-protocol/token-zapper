import { Address } from '../base/Address';
import { IAToken__factory, IPool__factory, IStaticATokenV3LM__factory, } from '../contracts';
import { Action, DestinationOptions, InteractionConvention, } from '../action/Action';
import { Approval } from '../base/Approval';
import { rayMul } from '../action/aaveMath';
import { setupMintableWithRate } from './setupMintableWithRate';
import { BurnSAV3TokensAction, MintSAV3TokensAction, } from '../action/SAV3Tokens';
const BaseAaveAction = Action('AAVEV3');
class AaveV3ActionSupply extends BaseAaveAction {
    universe;
    reserve;
    get outputSlippage() {
        return 1n;
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
        return this.outputBalanceOf(this.universe, planner);
    }
    constructor(universe, reserve) {
        super(reserve.aToken.address, [reserve.reserveToken], [reserve.aToken], InteractionConvention.ApprovalRequired, DestinationOptions.Recipient, [new Approval(reserve.reserveToken, reserve.aToken.address)]);
        this.universe = universe;
        this.reserve = reserve;
    }
}
class AaveV3ActionWithdraw extends BaseAaveAction {
    universe;
    reserve;
    get outputSlippage() {
        return 1n;
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
        planner.add(lib.withdraw(this.reserve.reserveToken.address.address, inputs[0], destination.address), `AaveV3: withdraw ${predictedInputs} -> ${await this.quote(predictedInputs)}`);
        return this.outputBalanceOf(this.universe, planner);
    }
    constructor(universe, reserve) {
        super(reserve.aToken.address, [reserve.aToken], [reserve.reserveToken], InteractionConvention.None, DestinationOptions.Recipient, []);
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
        return `AaveReserve(underlying=${this.reserveToken},aToken=${this.aToken})`;
    }
}
class AaveV3 {
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
        const reserve = new AaveReserve(this, reserveData, token, aToken, aTokenInst, variableDebtToken, async (shares) => {
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
    }
    static async from(poolInst, universe) {
        const reserveTokens = await Promise.all((await poolInst.getReservesList()).map(async (i) => universe.getToken(Address.from(i))));
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
        const wrapperInst = IStaticATokenV3LM__factory.connect(wrapper.address.address, this.universe.provider);
        const aToken = await this.universe.getToken(Address.from(await wrapperInst.aToken()));
        const reserve = this.tokenToReserve.get(aToken);
        if (reserve == null) {
            console.warn(`No reserve found for aToken ${aToken.toString()}`);
            return;
        }
        console.log(reserve.toString());
        await setupMintableWithRate(this.universe, IStaticATokenV3LM__factory, wrapper, async (rate, saInst) => {
            return {
                fetchRate: async () => (await saInst.rate()).toBigInt(),
                mint: new MintSAV3TokensAction(this.universe, reserve.reserveToken, wrapper, rate),
                burn: new BurnSAV3TokensAction(this.universe, reserve.reserveToken, wrapper, rate),
            };
        });
    }
}
export const setupAaveV3 = async (universe, poolAddress, wrappers) => {
    const poolInst = IPool__factory.connect(poolAddress.address, universe.provider);
    const aaveInstance = await AaveV3.from(poolInst, universe);
    await Promise.all(wrappers.map(async (wrapper) => await aaveInstance.addWrapper(wrapper)));
    return aaveInstance;
};
//# sourceMappingURL=setupAaveV3.js.map