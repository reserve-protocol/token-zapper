import { Address } from '../base/Address';
import { Action, DestinationOptions, InteractionConvention, } from '../action/Action';
import { Approval } from '../base/Approval';
import { rayMul } from '../action/aaveMath';
import { setupMintableWithRate } from './setupMintableWithRate';
import { BurnSAV3TokensAction, MintSAV3TokensAction, } from '../action/SAV3Tokens';
import { IAToken__factory, ILendingPool__factory, } from '../contracts/factories/contracts/AaveV2.sol';
import { IStaticATokenLM__factory } from '../contracts/factories/contracts/ISAtoken.sol';
const DataTypes = {};
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
        return 1n;
    }
    async quote(amountsIn) {
        return amountsIn.map((tok, i) => tok.into(this.outputToken[i]));
    }
}
class AaveV2ActionSupply extends BaseAaveV2Action {
    universe;
    reserve;
    gasEstimate() {
        return BigInt(300000n);
    }
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
    async plan(planner, inputs, destination, predictedInputs) {
        const lib = this.gen.Contract.createContract(this.reserve.poolInst);
        ///(address asset, uint256 amount, address to)
        planner.add(lib.withdraw(this.reserve.reserveToken.address.address, inputs[0], this.universe.execAddress.address), `AaveV3: withdraw ${predictedInputs} -> ${await this.quote(predictedInputs)}`);
        return null;
    }
    constructor(universe, reserve) {
        super(reserve.aToken.address, [reserve.aToken], [reserve.reserveToken], InteractionConvention.None, DestinationOptions.Recipient, []);
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
    async addWrapper(wrapper) {
        const wrapperInst = IStaticATokenLM__factory.connect(wrapper.address.address, this.universe.provider);
        const aToken = await this.universe.getToken(Address.from(await wrapperInst.ATOKEN()));
        const reserve = this.tokenToReserve.get(aToken);
        if (reserve == null) {
            console.warn(`No reserve found for aToken ${aToken.toString()}`);
            return;
        }
        await setupMintableWithRate(this.universe, IStaticATokenLM__factory, wrapper, async (rate, saInst) => {
            return {
                fetchRate: async () => (await saInst.rate()).toBigInt(),
                mint: new MintSAV3TokensAction(this.universe, reserve.reserveToken, wrapper, rate),
                burn: new BurnSAV3TokensAction(this.universe, reserve.reserveToken, wrapper, rate),
            };
        });
    }
}
export const setupAaveV2 = async (universe, config) => {
    const poolAddress = Address.from(config.pool);
    const poolInst = ILendingPool__factory.connect(poolAddress.address, universe.provider);
    const aaveInstance = await AaveV2Deployment.from(poolInst, universe);
    await Promise.all(config.wrappers
        .map(Address.from)
        .map(async (i) => await aaveInstance.addWrapper(await universe.getToken(i))));
    return aaveInstance;
};
//# sourceMappingURL=setupAaveV2.js.map