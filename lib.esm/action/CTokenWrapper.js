import { Approval } from '../base/Approval';
import { CTokenWrapper__factory } from '../contracts/factories/contracts/ICToken.sol/CTokenWrapper__factory';
import { Action, DestinationOptions, InteractionConvention } from './Action';
const iCTokenWrapper = CTokenWrapper__factory.createInterface();
export class MintCTokenWrapperAction extends Action("ReserveWrapper(CompoundV2)") {
    universe;
    baseToken;
    receiptToken;
    getRate;
    async plan(planner, inputs, destination) {
        const lib = this.gen.Contract.createContract(CTokenWrapper__factory.connect(this.receiptToken.address.address, this.universe.provider));
        const dep = lib.deposit(inputs[0], destination.address);
        planner.add(dep);
        return this.outputBalanceOf(this.universe, planner);
    }
    gasEstimate() {
        return BigInt(250000n);
    }
    async quote([amountsIn]) {
        return [this.receiptToken.from(amountsIn.amount)];
    }
    constructor(universe, baseToken, receiptToken, getRate) {
        super(receiptToken.address, [baseToken], [receiptToken], InteractionConvention.ApprovalRequired, DestinationOptions.Callee, [new Approval(baseToken, receiptToken.address)]);
        this.universe = universe;
        this.baseToken = baseToken;
        this.receiptToken = receiptToken;
        this.getRate = getRate;
    }
    toString() {
        return `CompoundV2WrapperMint(${this.receiptToken.toString()})`;
    }
}
export class BurnCTokenWrapperAction extends Action("ReserveWrapper(CompoundV2)") {
    universe;
    baseToken;
    receiptToken;
    getRate;
    async plan(planner, inputs, destination) {
        const lib = this.gen.Contract.createContract(CTokenWrapper__factory.connect(this.receiptToken.address.address, this.universe.provider));
        planner.add(lib.withdraw(inputs[0], destination.address));
        return this.outputBalanceOf(this.universe, planner);
    }
    gasEstimate() {
        return BigInt(250000n);
    }
    async quote([amountsIn]) {
        return [this.baseToken.from(amountsIn.amount)];
    }
    constructor(universe, baseToken, receiptToken, getRate) {
        super(receiptToken.address, [receiptToken], [baseToken], InteractionConvention.None, DestinationOptions.Callee, []);
        this.universe = universe;
        this.baseToken = baseToken;
        this.receiptToken = receiptToken;
        this.getRate = getRate;
    }
    toString() {
        return `CompoundV2WrapperBurn(${this.receiptToken.toString()})`;
    }
}
//# sourceMappingURL=CTokenWrapper.js.map