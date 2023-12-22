import { parseHexStringIntoBuffer } from '../base/utils';
import { InteractionConvention, DestinationOptions, Action } from './Action';
import { ContractCall } from '../base/ContractCall';
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
    gasEstimate() {
        return BigInt(200000n);
    }
    async encode([amountsIn], destination) {
        return new ContractCall(parseHexStringIntoBuffer(routerInterface.encodeFunctionData('addLiquidity', [
            this.poolId,
            amountsIn.amount,
            destination.address,
        ])), this.router, 0n, this.gasEstimate(), `Deposit ${amountsIn} into Stargate via router (${this.router}) receiving ${amountsIn.into(this.stargateToken)}`);
    }
    async quote([amountsIn]) {
        let slipapgeAmt = amountsIn.amount / 100000n;
        if (slipapgeAmt <= 100n) {
            slipapgeAmt = 100n;
        }
        return [
            this.stargateToken.from(amountsIn.amount - slipapgeAmt),
        ];
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
    gasEstimate() {
        return BigInt(200000n);
    }
    async encode([amountsIn], destination) {
        return new ContractCall(parseHexStringIntoBuffer(routerInterface.encodeFunctionData('instantRedeemLocal', [
            this.poolId,
            amountsIn.amount,
            destination.address
        ])), this.router, 0n, this.gasEstimate(), `Redeem ${amountsIn} from Stargate via router (${this.router}) receiving ${amountsIn.into(this.underlying)}`);
    }
    async quote([amountsIn]) {
        return [
            this.underlying.from(amountsIn.amount),
        ];
    }
    constructor(universe, underlying, stargateToken, poolId, router) {
        super(stargateToken.address, [stargateToken], [underlying], InteractionConvention.None, DestinationOptions.Recipient, []);
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