import { Action, DestinationOptions, InteractionConvention } from './Action';
import { Address } from '../base/Address';
import { Approval } from '../base/Approval';
import { ContractCall } from '../base/ContractCall';
import { parseHexStringIntoBuffer } from '../base/utils';
import { IConvexWrapper__factory } from '../contracts/factories/contracts/IConvexWrapper__factory';
import { IBooster__factory } from '../contracts/factories/contracts/IBooster__factory';
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
const wrapperInterface = IConvexWrapper__factory.createInterface();
export class ConvexDepositAndStake extends Action {
    universe;
    convexPool;
    async plan(planner, inputs, destination) {
        const lib = this.gen.Contract.createContract(IConvexWrapper__factory.connect(this.convexPool.stakedConvexDepositToken.address.address, this.universe.provider));
        planner.add(lib.deposit(inputs[0], destination.address));
        return [inputs[0]];
    }
    toString() {
        return `ConvexDepositAndStake(${this.convexPool})`;
    }
    async quote([amountIn]) {
        return [amountIn.into(this.output[0])];
    }
    gasEstimate() {
        return 250000n;
    }
    async encode([amountsIn], destination) {
        return new ContractCall(parseHexStringIntoBuffer(wrapperInterface.encodeFunctionData('deposit', [
            amountsIn.amount,
            destination.address,
        ])), this.convexPool.stakedConvexDepositToken.address, 0n, this.gasEstimate(), `Deposit ${amountsIn} on Convex and stake on ${this.convexPool.rewardsAddress}`);
    }
    constructor(universe, convexPool) {
        super(convexPool.stakedConvexDepositToken.address, [convexPool.curveLPToken], [convexPool.stakedConvexDepositToken], InteractionConvention.ApprovalRequired, DestinationOptions.Recipient, [
            new Approval(convexPool.curveLPToken, convexPool.stakedConvexDepositToken.address),
        ]);
        this.universe = universe;
        this.convexPool = convexPool;
    }
}
export class ConvexUnstakeAndWithdraw extends Action {
    universe;
    convexPool;
    async plan(planner, inputs, destination) {
        const lib = this.gen.Contract.createContract(IConvexWrapper__factory.connect(this.convexPool.stakedConvexDepositToken.address.address, this.universe.provider));
        planner.add(lib.withdrawAndUnwrap(inputs[0]));
        return [inputs[0]];
    }
    toString() {
        return `ConvexUnstakeAndWithdraw(${this.convexPool})`;
    }
    async quote([amountIn]) {
        return [amountIn.into(this.output[0])];
    }
    gasEstimate() {
        return 250000n;
    }
    async encode([amountsIn]) {
        return new ContractCall(parseHexStringIntoBuffer(wrapperInterface.encodeFunctionData('withdrawAndUnwrap', [
            amountsIn.amount,
        ])), this.convexPool.stakedConvexDepositToken.address, 0n, this.gasEstimate(), `Unstake ${amountsIn} from rewards pool (${this.convexPool.rewardsAddress}), and withdraw from Convex returning ${this.output[0]} to caller`);
    }
    constructor(universe, convexPool) {
        super(convexPool.stakedConvexDepositToken.address, [convexPool.stakedConvexDepositToken], [convexPool.curveLPToken], InteractionConvention.None, DestinationOptions.Recipient, []);
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
    const stkCVXTokenInst = IConvexWrapper__factory.connect(stakedConvexToken.address.address, universe.provider);
    const curveLPToken = await universe.getToken(Address.from(await stkCVXTokenInst.curveToken()));
    const convexDepositToken = await universe.getToken(Address.from(await stkCVXTokenInst.convexToken()));
    const convexPoolId = await stkCVXTokenInst.convexPoolId();
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