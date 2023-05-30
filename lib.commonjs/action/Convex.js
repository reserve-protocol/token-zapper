"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupConvexEdges = exports.ConvexUnstakeAndWithdraw = exports.ConvexWithdraw = exports.ConvexUnstake = exports.ConvexStake = exports.ConvexDeposit = exports.ConvexDepositAndStake = void 0;
const _1 = require(".");
const base_1 = require("../base");
const contracts_1 = require("../contracts");
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
const boosterInterface = contracts_1.IBooster__factory.createInterface();
const baseRewardsPoolInterface = contracts_1.IConvexBaseRewardsPool__factory.createInterface();
const wrapperInterface = contracts_1.IConvexWrapper__factory.createInterface();
class ConvexDepositAndStake extends _1.Action {
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
        return new base_1.ContractCall((0, base_1.parseHexStringIntoBuffer)(wrapperInterface.encodeFunctionData('deposit', [
            amountsIn.amount,
            destination.address,
        ])), this.convexPool.stakedConvexDepositToken.address, 0n, this.gasEstimate(), `Deposit ${amountsIn} on Convex and stake on ${this.convexPool.rewardsAddress}`);
    }
    constructor(convexPool) {
        super(convexPool.stakedConvexDepositToken.address, [convexPool.curveLPToken], [convexPool.stakedConvexDepositToken], _1.InteractionConvention.ApprovalRequired, _1.DestinationOptions.Callee, [
            new base_1.Approval(convexPool.curveLPToken, convexPool.stakedConvexDepositToken.address),
        ]);
        this.convexPool = convexPool;
    }
}
exports.ConvexDepositAndStake = ConvexDepositAndStake;
class ConvexDeposit extends _1.Action {
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
        return new base_1.ContractCall((0, base_1.parseHexStringIntoBuffer)(boosterInterface.encodeFunctionData('deposit', [
            this.convexPool.convexPoolId,
            amountsIn.amount,
            false,
        ])), this.convexPool.convexBooster, 0n, this.gasEstimate(), `Deposit ${amountsIn} on Convex`);
    }
    constructor(convexPool) {
        super(convexPool.convexDepositToken.address, [convexPool.curveLPToken], [convexPool.convexDepositToken], _1.InteractionConvention.ApprovalRequired, _1.DestinationOptions.Callee, [new base_1.Approval(convexPool.curveLPToken, convexPool.convexBooster)]);
        this.convexPool = convexPool;
    }
}
exports.ConvexDeposit = ConvexDeposit;
class ConvexStake extends _1.Action {
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
        return new base_1.ContractCall((0, base_1.parseHexStringIntoBuffer)(wrapperInterface.encodeFunctionData('stake', [
            amountsIn.amount,
            destination.address,
        ])), this.convexPool.stakedConvexDepositToken.address, 0n, this.gasEstimate(), `Stake ${amountsIn} on Convex and stake on ${this.convexPool.rewardsAddress}`);
    }
    constructor(convexPool) {
        super(convexPool.stakedConvexDepositToken.address, [convexPool.convexDepositToken], [convexPool.stakedConvexDepositToken], _1.InteractionConvention.ApprovalRequired, _1.DestinationOptions.Recipient, [
            new base_1.Approval(convexPool.convexDepositToken, convexPool.stakedConvexDepositToken.address),
        ]);
        this.convexPool = convexPool;
    }
}
exports.ConvexStake = ConvexStake;
class ConvexUnstake extends _1.Action {
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
        return new base_1.ContractCall((0, base_1.parseHexStringIntoBuffer)(wrapperInterface.encodeFunctionData('withdraw', [amountsIn.amount])), this.convexPool.stakedConvexDepositToken.address, 0n, this.gasEstimate(), `Unstake ${amountsIn} on ${this.convexPool.rewardsAddress}, returning deposit token (${this.convexPool.convexDepositToken}) to caller`);
    }
    constructor(convexPool) {
        super(convexPool.stakedConvexDepositToken.address, [convexPool.stakedConvexDepositToken], [convexPool.convexDepositToken], _1.InteractionConvention.None, _1.DestinationOptions.Callee, []);
        this.convexPool = convexPool;
    }
}
exports.ConvexUnstake = ConvexUnstake;
class ConvexWithdraw extends _1.Action {
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
        return new base_1.ContractCall((0, base_1.parseHexStringIntoBuffer)(boosterInterface.encodeFunctionData('withdraw', [
            this.convexPool.convexPoolId,
            amountsIn.amount,
        ])), this.convexPool.convexBooster, 0n, this.gasEstimate(), `Withdraw ${amountsIn} from Convex returning curve LP token (${this.convexPool.curveLPToken}) to caller`);
    }
    constructor(convexPool) {
        super(convexPool.stakedConvexDepositToken.address, [convexPool.convexDepositToken], [convexPool.curveLPToken], _1.InteractionConvention.None, _1.DestinationOptions.Callee, []);
        this.convexPool = convexPool;
    }
}
exports.ConvexWithdraw = ConvexWithdraw;
class ConvexUnstakeAndWithdraw extends _1.Action {
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
        return new base_1.ContractCall((0, base_1.parseHexStringIntoBuffer)(wrapperInterface.encodeFunctionData('withdrawAndUnwrap', [
            amountsIn.amount,
        ])), this.convexPool.stakedConvexDepositToken.address, 0n, this.gasEstimate(), `Unstake ${amountsIn} from rewards pool (${this.convexPool.rewardsAddress}), and withdraw from Convex returning ${this.output[0]} to caller`);
    }
    constructor(convexPool) {
        super(convexPool.stakedConvexDepositToken.address, [convexPool.stakedConvexDepositToken], [convexPool.curveLPToken], _1.InteractionConvention.None, _1.DestinationOptions.Callee, []);
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
const setupConvexEdges = async (universe, stakedConvexToken) => {
    const convexBooster = contracts_1.IBooster__factory.connect(universe.config.addresses.convex.address, universe.provider);
    const stkCVXTokenInst = contracts_1.IConvexWrapper__factory.connect(stakedConvexToken.address.address, universe.provider);
    const curveLPToken = await universe.getToken(base_1.Address.from(await stkCVXTokenInst.curveToken()));
    const convexDepositToken = await universe.getToken(base_1.Address.from(await stkCVXTokenInst.convexToken()));
    const convexPoolId = await stkCVXTokenInst.convexPoolId();
    const info = await convexBooster.poolInfo(convexPoolId.toBigInt());
    const crvRewards = base_1.Address.from(info.crvRewards);
    const convexPool = new ConvexPool(universe.config.addresses.convex, convexPoolId.toBigInt(), curveLPToken, convexDepositToken, stakedConvexToken, crvRewards);
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
exports.setupConvexEdges = setupConvexEdges;
//# sourceMappingURL=Convex.js.map