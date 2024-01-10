"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithdrawAction = exports.DepositAction = void 0;
const utils_1 = require("../base/utils");
const Action_1 = require("./Action");
const ContractCall_1 = require("../base/ContractCall");
const IWrappedNative__factory_1 = require("../contracts/factories/contracts/IWrappedNative__factory");
const gen = __importStar(require("../tx-gen/Planner"));
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
    async encode([amountsIn]) {
        return new ContractCall_1.ContractCall((0, utils_1.parseHexStringIntoBuffer)(iWrappedNativeIFace.encodeFunctionData('withdraw', [amountsIn.amount])), this.wrappedToken.address, 0n, this.gasEstimate(), 'Unwrap Native Token');
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