import { InteractionConvention, DestinationOptions, Action } from './Action';
import { IWrappedNative__factory } from '../contracts/factories/contracts/IWrappedNative__factory';
import * as gen from '../tx-gen/Planner';
const iWrappedNativeIFace = IWrappedNative__factory.createInterface();
export class DepositAction extends Action("WETH") {
    universe;
    wrappedToken;
    gasEstimate() {
        return 25000n;
    }
    async plan(planner, inputs, destination) {
        const wethlib = gen.Contract.createContract(IWrappedNative__factory.connect(this.wrappedToken.address.address, this.universe.provider));
        planner.add(wethlib.deposit().withValue(inputs[0]));
        return [inputs[0]];
    }
    async quote([qty]) {
        return [qty.into(this.wrappedToken)];
    }
    constructor(universe, wrappedToken) {
        super(wrappedToken.address, [universe.nativeToken], [wrappedToken], InteractionConvention.None, DestinationOptions.Callee, []);
        this.universe = universe;
        this.wrappedToken = wrappedToken;
    }
    toString() {
        return `Wrap(${this.universe.nativeToken.toString()})`;
    }
}
export class WithdrawAction extends Action("WETH") {
    universe;
    wrappedToken;
    gasEstimate() {
        return 25000n;
    }
    async plan(planner, inputs, destination) {
        const wethlib = gen.Contract.createContract(IWrappedNative__factory.connect(this.wrappedToken.address.address, this.universe.provider));
        planner.add(wethlib.withdraw(inputs[0]));
        return [inputs[0]];
    }
    async quote([qty]) {
        return [qty.into(this.universe.nativeToken)];
    }
    constructor(universe, wrappedToken) {
        super(wrappedToken.address, [wrappedToken], [universe.nativeToken], InteractionConvention.None, DestinationOptions.Callee, []);
        this.universe = universe;
        this.wrappedToken = wrappedToken;
    }
    toString() {
        return `Unwrap(${this.wrappedToken.toString()})`;
    }
}
//# sourceMappingURL=WrappedNative.js.map