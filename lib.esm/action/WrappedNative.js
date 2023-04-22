import { IWrappedNative__factory } from '../contracts';
import { parseHexStringIntoBuffer } from '../base/utils';
import { InteractionConvention, DestinationOptions, Action } from './Action';
import { ContractCall } from '../base/ContractCall';
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