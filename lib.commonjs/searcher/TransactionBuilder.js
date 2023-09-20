"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionBuilder = exports.zapperInterface = exports.zapperExecutorInterface = void 0;
const ContractCall_1 = require("../base/ContractCall");
const utils_1 = require("../base/utils");
const IZapperExecutor__factory_1 = require("../contracts/factories/IZapper.sol/IZapperExecutor__factory");
const IZapper__factory_1 = require("../contracts/factories/IZapper.sol/IZapper__factory");
exports.zapperExecutorInterface = IZapperExecutor__factory_1.IZapperExecutor__factory.createInterface();
exports.zapperInterface = IZapper__factory_1.IZapper__factory.createInterface();
class TransactionBuilder {
    universe;
    constructor(universe) {
        this.universe = universe;
    }
    contractCalls = [];
    setupApprovals(approvals) {
        this.addCall(new ContractCall_1.ContractCall((0, utils_1.parseHexStringIntoBuffer)(exports.zapperExecutorInterface.encodeFunctionData('setupApprovals', [
            approvals.map((i) => i.token.address.address),
            approvals.map((i) => i.spender.address),
        ])), this.universe.config.addresses.executorAddress, 0n, BigInt(approvals.length) * 25000n, `Setup approvals: ${approvals.map((i) => i.toString()).join(', ')}`));
    }
    drainERC20(tokens, destination) {
        this.addCall(new ContractCall_1.ContractCall((0, utils_1.parseHexStringIntoBuffer)(exports.zapperExecutorInterface.encodeFunctionData('drainERC20s', [
            tokens.map((i) => i.address.address),
            destination.address,
        ])), this.universe.config.addresses.executorAddress, 0n, BigInt(tokens.length) * 50000n, 'Cleanup'));
    }
    addCall(call) {
        this.contractCalls.push(call);
    }
    gasEstimate() {
        return this.contractCalls.reduce((l, r) => l + r.gas, 0n);
    }
}
exports.TransactionBuilder = TransactionBuilder;
//# sourceMappingURL=TransactionBuilder.js.map