import { Approval } from '../base/Approval';
import { Comet__factory } from '../contracts/factories/contracts/Compv3.sol/Comet__factory';
import { Action, DestinationOptions, InteractionConvention } from './Action';
export class MintCometAction extends Action {
    universe;
    baseToken;
    receiptToken;
    async plan(planner, inputs, destination, predicted) {
        const lib = this.gen.Contract.createContract(Comet__factory.connect(this.receiptToken.address.address, this.universe.provider));
        planner.add(lib.supply(this.baseToken.address.address, inputs[0]), `Comet mint: ${predicted.join(', ')} -> ${await this.quote(predicted)}`);
        const out = this.genUtils.erc20.balanceOf(this.universe, planner, this.output[0], destination);
        return [out];
    }
    gasEstimate() {
        return BigInt(110000n);
    }
    async quote([amountsIn]) {
        return [this.receiptToken.from(amountsIn.amount)];
    }
    constructor(universe, baseToken, receiptToken) {
        super(receiptToken.address, [baseToken], [receiptToken], InteractionConvention.ApprovalRequired, DestinationOptions.Callee, [new Approval(baseToken, receiptToken.address)]);
        this.universe = universe;
        this.baseToken = baseToken;
        this.receiptToken = receiptToken;
    }
    toString() {
        return `CompoundV3Mint(${this.receiptToken.toString()})`;
    }
}
export class BurnCometAction extends Action {
    universe;
    baseToken;
    receiptToken;
    async plan(planner, inputs, destination, predicted) {
        const lib = this.gen.Contract.createContract(Comet__factory.connect(this.receiptToken.address.address, this.universe.provider));
        planner.add(lib.withdrawTo(destination.address, this.baseToken.address.address, inputs[0]), `Comet burn: ${predicted.join(', ')} -> ${await this.quote(predicted)}`);
        const out = this.genUtils.erc20.balanceOf(this.universe, planner, this.output[0], destination);
        return [out];
    }
    gasEstimate() {
        return BigInt(110000n);
    }
    async quote([amountsIn]) {
        return [this.baseToken.from(amountsIn.amount)];
    }
    constructor(universe, baseToken, receiptToken) {
        super(receiptToken.address, [receiptToken], [baseToken], InteractionConvention.None, DestinationOptions.Recipient, []);
        this.universe = universe;
        this.baseToken = baseToken;
        this.receiptToken = receiptToken;
    }
    toString() {
        return `CommetWithdraw(${this.receiptToken.toString()})`;
    }
}
//# sourceMappingURL=Comet.js.map