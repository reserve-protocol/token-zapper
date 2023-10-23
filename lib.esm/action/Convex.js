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
const boosterInterface = IBooster__factory.createInterface();
const wrapperInterface = IConvexWrapper__factory.createInterface();
export class ConvexDepositAndStake extends Action {
    convexPool;
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
    constructor(convexPool) {
        super(convexPool.stakedConvexDepositToken.address, [convexPool.curveLPToken], [convexPool.stakedConvexDepositToken], InteractionConvention.ApprovalRequired, DestinationOptions.Callee, [
            new Approval(convexPool.curveLPToken, convexPool.stakedConvexDepositToken.address),
        ]);
        this.convexPool = convexPool;
    }
}
export class ConvexDeposit extends Action {
    convexPool;
    toString() {
        return `ConvexDeposit(${this.convexPool})`;
    }
    async quote([amountIn]) {
        return [amountIn.into(this.output[0])];
    }
    gasEstimate() {
        return 250000n;
    }
    async encode([amountsIn]) {
        return new ContractCall(parseHexStringIntoBuffer(boosterInterface.encodeFunctionData('deposit', [
            this.convexPool.convexPoolId,
            amountsIn.amount,
            false,
        ])), this.convexPool.convexBooster, 0n, this.gasEstimate(), `Deposit ${amountsIn} on Convex`);
    }
    constructor(convexPool) {
        super(convexPool.convexDepositToken.address, [convexPool.curveLPToken], [convexPool.convexDepositToken], InteractionConvention.ApprovalRequired, DestinationOptions.Callee, [new Approval(convexPool.curveLPToken, convexPool.convexBooster)]);
        this.convexPool = convexPool;
    }
}
export class ConvexStake extends Action {
    convexPool;
    toString() {
        return `ConvexStake(${this.convexPool})`;
    }
    async quote([amountIn]) {
        return [amountIn.into(this.output[0])];
    }
    gasEstimate() {
        return 250000n;
    }
    async encode([amountsIn], destination) {
        return new ContractCall(parseHexStringIntoBuffer(wrapperInterface.encodeFunctionData('stake', [
            amountsIn.amount,
            destination.address,
        ])), this.convexPool.stakedConvexDepositToken.address, 0n, this.gasEstimate(), `Stake ${amountsIn} on Convex and stake on ${this.convexPool.rewardsAddress}`);
    }
    constructor(convexPool) {
        super(convexPool.stakedConvexDepositToken.address, [convexPool.convexDepositToken], [convexPool.stakedConvexDepositToken], InteractionConvention.ApprovalRequired, DestinationOptions.Recipient, [
            new Approval(convexPool.convexDepositToken, convexPool.stakedConvexDepositToken.address),
        ]);
        this.convexPool = convexPool;
    }
}
export class ConvexUnstake extends Action {
    convexPool;
    toString() {
        return `ConvexUnstake(${this.convexPool})`;
    }
    async quote([amountIn]) {
        return [amountIn.into(this.output[0])];
    }
    gasEstimate() {
        return 250000n;
    }
    async encode([amountsIn]) {
        return new ContractCall(parseHexStringIntoBuffer(wrapperInterface.encodeFunctionData('withdraw', [amountsIn.amount])), this.convexPool.stakedConvexDepositToken.address, 0n, this.gasEstimate(), `Unstake ${amountsIn} on ${this.convexPool.rewardsAddress}, returning deposit token (${this.convexPool.convexDepositToken}) to caller`);
    }
    constructor(convexPool) {
        super(convexPool.stakedConvexDepositToken.address, [convexPool.stakedConvexDepositToken], [convexPool.convexDepositToken], InteractionConvention.None, DestinationOptions.Callee, []);
        this.convexPool = convexPool;
    }
}
export class ConvexWithdraw extends Action {
    convexPool;
    toString() {
        return `ConvexWithdraw(${this.convexPool})`;
    }
    async quote([amountIn]) {
        return [amountIn.into(this.output[0])];
    }
    gasEstimate() {
        return 250000n;
    }
    async encode([amountsIn]) {
        return new ContractCall(parseHexStringIntoBuffer(boosterInterface.encodeFunctionData('withdraw', [
            this.convexPool.convexPoolId,
            amountsIn.amount,
        ])), this.convexPool.convexBooster, 0n, this.gasEstimate(), `Withdraw ${amountsIn} from Convex returning curve LP token (${this.convexPool.curveLPToken}) to caller`);
    }
    constructor(convexPool) {
        super(convexPool.stakedConvexDepositToken.address, [convexPool.convexDepositToken], [convexPool.curveLPToken], InteractionConvention.None, DestinationOptions.Callee, []);
        this.convexPool = convexPool;
    }
}
export class ConvexUnstakeAndWithdraw extends Action {
    convexPool;
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
    constructor(convexPool) {
        super(convexPool.stakedConvexDepositToken.address, [convexPool.stakedConvexDepositToken], [convexPool.curveLPToken], InteractionConvention.None, DestinationOptions.Callee, []);
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
    // Define canonical way mint deposit token
    const depositAction = new ConvexDeposit(convexPool);
    const withdrawAction = new ConvexWithdraw(convexPool);
    universe.defineMintable(depositAction, withdrawAction);
    // Define canonical way to mint staked token
    const stakeAction = new ConvexStake(convexPool);
    const unstakeAction = new ConvexUnstake(convexPool);
    universe.defineMintable(stakeAction, unstakeAction);
    // Add one step actions that are actually used for the most part
    const depositAndStakeAction = new ConvexDepositAndStake(convexPool);
    const unstakeAndWithdrawAction = new ConvexUnstakeAndWithdraw(convexPool);
    universe.addAction(unstakeAndWithdrawAction);
    universe.addAction(depositAndStakeAction);
    return {
        pool: convexPool,
        depositAction,
        withdrawAction,
        stakeAction,
        unstakeAction,
        depositAndStakeAction,
        unstakeAndWithdrawAction,
    };
};
//# sourceMappingURL=Convex.js.map