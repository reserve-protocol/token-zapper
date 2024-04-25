"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupConvexEdges = exports.ConvexUnstakeAndWithdraw = exports.ConvexDepositAndStake = void 0;
const Action_1 = require("./Action");
const Address_1 = require("../base/Address");
const Approval_1 = require("../base/Approval");
const IConvexWrapper__factory_1 = require("../contracts/factories/contracts/IConvexWrapper__factory");
const IBooster__factory_1 = require("../contracts/factories/contracts/IBooster__factory");
class ConvexPool {
    convexBooster;
    convexPoolId;
    curveLPToken;
    convexDepositToken;
    stakedConvexDepositToken;
    rewardsAddress;
    constructor(convexBooster, convexPoolId, curveLPToken, convexDepositToken, stakedConvexDepositToken, rewardsAddress) {
        this.convexBooster = convexBooster;
        this.convexPoolId = convexPoolId;
        this.curveLPToken = curveLPToken;
        this.convexDepositToken = convexDepositToken;
        this.stakedConvexDepositToken = stakedConvexDepositToken;
        this.rewardsAddress = rewardsAddress;
    }
    toString() {
        return `ConvexPool(id=${this.convexPoolId})`;
    }
}
const wrapperInterface = IConvexWrapper__factory_1.IConvexWrapper__factory.createInterface();
class ConvexDepositAndStake extends (0, Action_1.Action)('Convex') {
    universe;
    convexPool;
    async plan(planner, inputs, destination) {
        const lib = this.gen.Contract.createContract(IConvexWrapper__factory_1.IConvexWrapper__factory.connect(this.convexPool.stakedConvexDepositToken.address.address, this.universe.provider));
        planner.add(lib.deposit(inputs[0], destination.address));
        return [inputs[0]];
    }
    toString() {
        return `ConvexDepositAndStake(${this.convexPool})`;
    }
    async quote([amountIn]) {
        return [amountIn.into(this.outputToken[0])];
    }
    gasEstimate() {
        return 250000n;
    }
    constructor(universe, convexPool) {
        super(convexPool.stakedConvexDepositToken.address, [convexPool.curveLPToken], [convexPool.stakedConvexDepositToken], Action_1.InteractionConvention.ApprovalRequired, Action_1.DestinationOptions.Recipient, [
            new Approval_1.Approval(convexPool.curveLPToken, convexPool.stakedConvexDepositToken.address),
        ]);
        this.universe = universe;
        this.convexPool = convexPool;
    }
}
exports.ConvexDepositAndStake = ConvexDepositAndStake;
class ConvexUnstakeAndWithdraw extends (0, Action_1.Action)('Convex') {
    universe;
    convexPool;
    async plan(planner, inputs, destination) {
        const lib = this.gen.Contract.createContract(IConvexWrapper__factory_1.IConvexWrapper__factory.connect(this.convexPool.stakedConvexDepositToken.address.address, this.universe.provider));
        planner.add(lib.withdrawAndUnwrap(inputs[0]));
        return [inputs[0]];
    }
    toString() {
        return `ConvexUnstakeAndWithdraw(${this.convexPool})`;
    }
    async quote([amountIn]) {
        return [amountIn.into(this.outputToken[0])];
    }
    gasEstimate() {
        return 250000n;
    }
    constructor(universe, convexPool) {
        super(convexPool.stakedConvexDepositToken.address, [convexPool.stakedConvexDepositToken], [convexPool.curveLPToken], Action_1.InteractionConvention.None, Action_1.DestinationOptions.Recipient, []);
        this.universe = universe;
        this.convexPool = convexPool;
    }
}
exports.ConvexUnstakeAndWithdraw = ConvexUnstakeAndWithdraw;
/**
 * Sets up all the edges associated with a convex pool.
 * This also sets up the minting of the convex deposit token, despite this token not being that useful.
 * @param universe
 * @param stakedConvexToken The staked convex lp token
 */
const setupConvexEdges = async (universe, stakedConvexToken, convex) => {
    const convexBooster = IBooster__factory_1.IBooster__factory.connect(convex.address, universe.provider);
    const stkCVXTokenInst = IConvexWrapper__factory_1.IConvexWrapper__factory.connect(stakedConvexToken.address.address, universe.provider);
    const curveLPToken = await universe.getToken(Address_1.Address.from(await stkCVXTokenInst.curveToken()));
    const convexDepositToken = await universe.getToken(Address_1.Address.from(await stkCVXTokenInst.convexToken()));
    const convexPoolId = await stkCVXTokenInst.convexPoolId();
    const info = await convexBooster.poolInfo(convexPoolId.toBigInt());
    const crvRewards = Address_1.Address.from(info.crvRewards);
    const convexPool = new ConvexPool(convex, convexPoolId.toBigInt(), curveLPToken, convexDepositToken, stakedConvexToken, crvRewards);
    // Add one step actions that are actually used for the most part
    const depositAndStakeAction = new ConvexDepositAndStake(universe, convexPool);
    const unstakeAndWithdrawAction = new ConvexUnstakeAndWithdraw(universe, convexPool);
    universe.defineMintable(depositAndStakeAction, unstakeAndWithdrawAction);
    return {
        pool: convexPool,
        depositAndStakeAction,
        unstakeAndWithdrawAction,
    };
};
exports.setupConvexEdges = setupConvexEdges;
//# sourceMappingURL=Convex.js.map