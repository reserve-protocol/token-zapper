import { InteractionConvention, DestinationOptions, Action } from './Action';
import { Approval } from '../base/Approval';
import { IStargateRouter__factory } from '../contracts';
/**
 * Used to mint/burn stargate LP tokens
 * They mint/burn 1:1
 */
const routerInterface = IStargateRouter__factory.createInterface();
export class StargateDepositAction extends Action {
    universe;
    underlying;
    stargateToken;
    poolId;
    router;
    async plan(planner, inputs, destination) {
        const lib = this.gen.Contract.createContract(IStargateRouter__factory.connect(this.router.address, this.universe.provider));
        planner.add(lib.addLiquidity(this.poolId, inputs[0], destination.address));
        return [
            this.genUtils.erc20.balanceOf(this.universe, planner, this.outputToken[0], destination),
        ];
    }
    gasEstimate() {
        return BigInt(200000n);
    }
    async quote([amountsIn]) {
        let slipapgeAmt = amountsIn.amount / 100000n;
        if (slipapgeAmt <= 100n) {
            slipapgeAmt = 100n;
        }
        return [this.stargateToken.from(amountsIn.amount - slipapgeAmt)];
    }
    constructor(universe, underlying, stargateToken, poolId, router) {
        super(stargateToken.address, [underlying], [stargateToken], InteractionConvention.ApprovalRequired, DestinationOptions.Callee, [new Approval(underlying, router)]);
        this.universe = universe;
        this.underlying = underlying;
        this.stargateToken = stargateToken;
        this.poolId = poolId;
        this.router = router;
    }
    toString() {
        return `StargateDeposit(${this.stargateToken.toString()})`;
    }
}
export class StargateWithdrawAction extends Action {
    universe;
    underlying;
    stargateToken;
    poolId;
    router;
    async plan(planner, inputs, destination) {
        const lib = this.gen.Contract.createContract(IStargateRouter__factory.connect(this.router.address, this.universe.provider));
        const out = planner.add(lib.instantRedeemLocal(this.poolId, inputs[0], destination.address));
        return [out];
    }
    gasEstimate() {
        return BigInt(200000n);
    }
    async quote([amountsIn]) {
        return [this.underlying.from(amountsIn.amount)];
    }
    constructor(universe, underlying, stargateToken, poolId, router) {
        super(stargateToken.address, [stargateToken], [underlying], InteractionConvention.ApprovalRequired, DestinationOptions.Recipient, []);
        this.universe = universe;
        this.underlying = underlying;
        this.stargateToken = stargateToken;
        this.poolId = poolId;
        this.router = router;
    }
    toString() {
        return `StargateWithdraw(${this.stargateToken.toString()})`;
    }
}
//# sourceMappingURL=Stargate.js.map