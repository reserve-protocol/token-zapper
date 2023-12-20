import { parseHexStringIntoBuffer } from '../base/utils';
import { InteractionConvention, DestinationOptions, Action } from './Action';
import { ContractCall } from '../base/ContractCall';
import { Approval } from '../base/Approval';
import { IStargateRewardableWrapper__factory } from '../contracts/factories/contracts/IStargadeWrapper.sol/IStargateRewardableWrapper__factory';
/**
 * Used to mint/burn wrapped stargate tokens
 * They mint/burn 1:1
 */
const vaultInterface = IStargateRewardableWrapper__factory.createInterface();
export class StargateWrapperDepositAction extends Action {
    universe;
    underlying;
    stargateToken;
    async plan(planner, inputs, destination) {
        const wSGToken = this.gen.Contract.createContract(IStargateRewardableWrapper__factory.connect(this.stargateToken.address.address, this.universe.provider));
        const out = planner.add(wSGToken.deposit(inputs[0], destination.address));
        return [out];
    }
    gasEstimate() {
        return BigInt(200000n);
    }
    async encode([amountsIn], destination) {
        return new ContractCall(parseHexStringIntoBuffer(vaultInterface.encodeFunctionData('deposit', [
            amountsIn.amount,
            destination.address,
        ])), this.stargateToken.address, 0n, this.gasEstimate(), `Deposit ${amountsIn} into Stargate(${this.stargateToken.address}) vault receiving ${amountsIn.into(this.stargateToken)}`);
    }
    async quote([amountsIn]) {
        return [
            this.stargateToken.from(amountsIn.amount),
        ];
    }
    constructor(universe, underlying, stargateToken) {
        super(stargateToken.address, [underlying], [stargateToken], InteractionConvention.ApprovalRequired, DestinationOptions.Callee, [new Approval(underlying, stargateToken.address)]);
        this.universe = universe;
        this.underlying = underlying;
        this.stargateToken = stargateToken;
    }
    toString() {
        return `StargateWrapperDeposit(${this.stargateToken.toString()})`;
    }
}
export class StargateWrapperWithdrawAction extends Action {
    universe;
    underlying;
    stargateToken;
    gasEstimate() {
        return BigInt(200000n);
    }
    async plan(planner, inputs, destination) {
        const wSGToken = this.gen.Contract.createContract(IStargateRewardableWrapper__factory.connect(this.stargateToken.address.address, this.universe.provider));
        planner.add(wSGToken.withdraw(inputs[0], destination.address));
        const out = this.genUtils.erc20.balanceOf(this.universe, planner, this.output[0], destination);
        return [out];
    }
    async encode([amountsIn], destination) {
        return new ContractCall(parseHexStringIntoBuffer(vaultInterface.encodeFunctionData('withdraw', [
            amountsIn.amount,
            destination.address
        ])), this.stargateToken.address, 0n, this.gasEstimate(), `Withdraw ${amountsIn} from ERC4626(${this.stargateToken.address}) vault`);
    }
    async quote([amountsIn]) {
        return [
            this.underlying.from(amountsIn.amount),
        ];
    }
    constructor(universe, underlying, stargateToken) {
        super(stargateToken.address, [stargateToken], [underlying], InteractionConvention.None, DestinationOptions.Recipient, []);
        this.universe = universe;
        this.underlying = underlying;
        this.stargateToken = stargateToken;
    }
    toString() {
        return `StargateWrapperWithdraw(${this.stargateToken.toString()})`;
    }
}
//# sourceMappingURL=StargateWrapper.js.map