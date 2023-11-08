"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithdrawAction = exports.DepositAction = void 0;
const utils_1 = require("../base/utils");
const Action_1 = require("./Action");
const ContractCall_1 = require("../base/ContractCall");
const IWrappedNative__factory_1 = require("../contracts/factories/contracts/IWrappedNative__factory");
const iWrappedNativeIFace = IWrappedNative__factory_1.IWrappedNative__factory.createInterface();
class DepositAction extends Action_1.Action {
    universe;
    wrappedToken;
    gasEstimate() {
        return 25000n;
    }
    async encode([amountsIn]) {
        return new ContractCall_1.ContractCall((0, utils_1.parseHexStringIntoBuffer)(iWrappedNativeIFace.encodeFunctionData('deposit')), this.wrappedToken.address, amountsIn.amount, this.gasEstimate(), 'Wrap Native Token');
    }
    async quote([qty]) {
        return [qty.into(this.wrappedToken)];
    }
    constructor(universe, wrappedToken) {
        super(wrappedToken.address, [universe.nativeToken], [wrappedToken], Action_1.InteractionConvention.None, Action_1.DestinationOptions.Callee, []);
        this.universe = universe;
        this.wrappedToken = wrappedToken;
    }
    toString() {
        return `Wrap(${this.universe.nativeToken.toString()})`;
    }
}
exports.DepositAction = DepositAction;
class WithdrawAction extends Action_1.Action {
    universe;
    wrappedToken;
    gasEstimate() {
        return 25000n;
    }
    async encode([amountsIn]) {
        return new ContractCall_1.ContractCall((0, utils_1.parseHexStringIntoBuffer)(iWrappedNativeIFace.encodeFunctionData('withdraw', [amountsIn.amount])), this.wrappedToken.address, 0n, this.gasEstimate(), 'Unwrap Native Token');
    }
    async quote([qty]) {
        return [qty.into(this.universe.nativeToken)];
    }
    constructor(universe, wrappedToken) {
        super(wrappedToken.address, [wrappedToken], [universe.nativeToken], Action_1.InteractionConvention.None, Action_1.DestinationOptions.Callee, []);
        this.universe = universe;
        this.wrappedToken = wrappedToken;
    }
    toString() {
        return `Unwrap(${this.wrappedToken.toString()})`;
    }
}
exports.WithdrawAction = WithdrawAction;
//# sourceMappingURL=WrappedNative.js.map