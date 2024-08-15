import { Action, DestinationOptions, InteractionConvention } from './Action';
import { Address } from '../base/Address';
import { Approval } from '../base/Approval';
import { ConvexStakingWrapper__factory, IBooster__factory } from '../contracts';
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
export class ConvexDepositAndStake extends Action('Convex') {
    universe;
    convexPool;
    async plan(planner, inputs, destination) {
        const lib = this.gen.Contract.createContract(ConvexStakingWrapper__factory.connect(this.convexPool.stakedConvexDepositToken.address.address, this.universe.provider));
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
        super(convexPool.stakedConvexDepositToken.address, [convexPool.curveLPToken], [convexPool.stakedConvexDepositToken], InteractionConvention.ApprovalRequired, DestinationOptions.Callee, [
            new Approval(convexPool.curveLPToken, convexPool.stakedConvexDepositToken.address),
        ]);
        this.universe = universe;
        this.convexPool = convexPool;
    }
}
export class ConvexUnstakeAndWithdraw extends Action('Convex') {
    universe;
    convexPool;
    get outputSlippage() {
        return 0n;
    }
    async plan(planner, [input], _, [predicted]) {
        const lib = this.gen.Contract.createContract(ConvexStakingWrapper__factory.connect(this.convexPool.stakedConvexDepositToken.address.address, this.universe.provider));
        planner.add(lib.withdrawAndUnwrap(input ?? predicted.amount));
        return this.outputBalanceOf(this.universe, planner);
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
        super(convexPool.stakedConvexDepositToken.address, [convexPool.stakedConvexDepositToken], [convexPool.curveLPToken], InteractionConvention.None, DestinationOptions.Callee, []);
        this.universe = universe;
        this.convexPool = convexPool;
    }
}
/**
 * Sets up all the edges associated with a convex pool.
 * This also sets up the minting of the convex deposit token, despite this token not being that useful.
 * @param universe
 * @param stakedConvexToken The staked convex lp token
 */
export const setupConvexEdges = async (universe, stakedConvexToken, convex) => {
    const convexBooster = IBooster__factory.connect(convex.address, universe.provider);
    const stkCVXTokenInst = ConvexStakingWrapper__factory.connect(stakedConvexToken.address.address, universe.provider);
    const curveLPToken = await universe.getToken(Address.from(await stkCVXTokenInst.curveToken()));
    const convexDepositToken = await universe.getToken(Address.from(await stkCVXTokenInst.convexToken()));
    const convexPoolId = await stkCVXTokenInst.callStatic.convexPoolId();
    const info = await convexBooster.poolInfo(convexPoolId.toBigInt());
    const crvRewards = Address.from(info.crvRewards);
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
//# sourceMappingURL=Convex.js.map