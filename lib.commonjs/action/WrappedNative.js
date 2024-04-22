"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithdrawAction = exports.DepositAction = void 0;
const tslib_1 = require("tslib");
const Action_1 = require("./Action");
const IWrappedNative__factory_1 = require("../contracts/factories/contracts/IWrappedNative__factory");
const gen = tslib_1.__importStar(require("../tx-gen/Planner"));
const iWrappedNativeIFace = IWrappedNative__factory_1.IWrappedNative__factory.createInterface();
class DepositAction extends Action_1.Action {
    universe;
    wrappedToken;
    gasEstimate() {
        return 25000n;
    }
    async plan(planner, inputs, destination) {
        const wethlib = gen.Contract.createContract(IWrappedNative__factory_1.IWrappedNative__factory.connect(this.wrappedToken.address.address, this.universe.provider));
        planner.add(wethlib.deposit().withValue(inputs[0]));
        return [inputs[0]];
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
    async plan(planner, inputs, destination) {
        const wethlib = gen.Contract.createContract(IWrappedNative__factory_1.IWrappedNative__factory.connect(this.wrappedToken.address.address, this.universe.provider));
        planner.add(wethlib.withdraw(inputs[0]));
        return [inputs[0]];
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