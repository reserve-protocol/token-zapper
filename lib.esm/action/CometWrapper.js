import { Approval } from '../base/Approval';
import { WrappedComet__factory } from '../contracts/factories/contracts/Compv3.sol/WrappedComet__factory';
import { Action, DestinationOptions, InteractionConvention } from './Action';
export class MintCometWrapperAction extends Action('ReserveWrapper(CompoundV3)') {
    universe;
    baseToken;
    receiptToken;
    getRate;
    async plan(planner, inputs, destination, predicted) {
        const lib = this.gen.Contract.createContract(WrappedComet__factory.connect(this.receiptToken.address.address, this.universe.provider));
        planner.add(lib.deposit(inputs[0]), `CometWrapper mint: ${predicted.join(', ')} -> ${await this.quote(predicted)}`);
        return this.outputBalanceOf(this.universe, planner);
    }
    gasEstimate() {
        return BigInt(150000n);
    }
    async quote([amountsIn]) {
        return await this.quoteCache.get(amountsIn);
    }
    quoteCache;
    constructor(universe, baseToken, receiptToken, getRate) {
        super(receiptToken.address, [baseToken], [receiptToken], InteractionConvention.ApprovalRequired, DestinationOptions.Callee, [new Approval(baseToken, receiptToken.address)]);
        this.universe = universe;
        this.baseToken = baseToken;
        this.receiptToken = receiptToken;
        this.getRate = getRate;
        const inst = WrappedComet__factory.connect(this.receiptToken.address.address, this.universe.provider);
        this.quoteCache = this.universe.createCache(async (qty) => {
            return [
                this.receiptToken.from(await inst.convertDynamicToStatic(qty.amount)),
            ];
        });
    }
    toString() {
        return `CompoundV3WrapperMint(${this.receiptToken.toString()})`;
    }
    get outputSlippage() {
        return 1n;
    }
}
export class BurnCometWrapperAction extends Action('ReserveWrapper(CompoundV3)') {
    universe;
    baseToken;
    receiptToken;
    getRate;
    async plan(planner, inputs, destination, predicted) {
        const lib = this.gen.Contract.createContract(WrappedComet__factory.connect(this.receiptToken.address.address, this.universe.provider));
        const amount = planner.add(lib.convertStaticToDynamic(inputs[0]));
        planner.add(lib.withdrawTo(destination.address, amount), `CometWrapper burn: ${predicted.join(', ')} -> ${await this.quote(predicted)}`);
        return this.outputBalanceOf(this.universe, planner);
    }
    gasEstimate() {
        return BigInt(150000n);
    }
    async quote([amountsIn]) {
        return await this.quoteCache.get(amountsIn);
    }
    quoteCache;
    constructor(universe, baseToken, receiptToken, getRate) {
        super(receiptToken.address, [receiptToken], [baseToken], InteractionConvention.None, DestinationOptions.Callee, []);
        this.universe = universe;
        this.baseToken = baseToken;
        this.receiptToken = receiptToken;
        this.getRate = getRate;
        const inst = WrappedComet__factory.connect(this.receiptToken.address.address, this.universe.provider);
        this.quoteCache = this.universe.createCache(async (qty) => {
            return [
                this.receiptToken.from(await inst.convertStaticToDynamic(qty.amount)),
            ];
        });
    }
    toString() {
        return `CompoundV3Burn(${this.receiptToken.toString()})`;
    }
    get outputSlippage() {
        return 1n;
    }
}
//# sourceMappingURL=CometWrapper.js.map