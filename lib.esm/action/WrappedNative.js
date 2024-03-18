import { parseHexStringIntoBuffer } from '../base/utils';
import { InteractionConvention, DestinationOptions, Action } from './Action';
import { ContractCall } from '../base/ContractCall';
import { IWrappedNative__factory } from '../contracts/factories/contracts/IWrappedNative__factory';
import * as gen from '../tx-gen/Planner';
const iWrappedNativeIFace = IWrappedNative__factory.createInterface();
export class DepositAction extends Action {
    universe;
    wrappedToken;
    gasEstimate() {
        return 25000n;
    }
    async encode([amountsIn]) {
        return new ContractCall(parseHexStringIntoBuffer(iWrappedNativeIFace.encodeFunctionData('deposit')), this.wrappedToken.address, amountsIn.amount, this.gasEstimate(), 'Wrap Native Token');
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
export class WithdrawAction extends Action {
    universe;
    wrappedToken;
    gasEstimate() {
        return 25000n;
    }
    async encode([amountsIn]) {
        return new ContractCall(parseHexStringIntoBuffer(iWrappedNativeIFace.encodeFunctionData('withdraw', [amountsIn.amount])), this.wrappedToken.address, 0n, this.gasEstimate(), 'Unwrap Native Token');
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