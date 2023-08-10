import { ContractCall } from '../base/ContractCall';
import { parseHexStringIntoBuffer } from '../base/utils';
import { IZapperExecutor__factory, IZapper__factory } from '../contracts/factories/contracts/IZapper.sol';
export const zapperExecutorInterface = IZapperExecutor__factory.createInterface();
export const zapperInterface = IZapper__factory.createInterface();
export class TransactionBuilder {
    universe;
    constructor(universe) {
        this.universe = universe;
    }
    contractCalls = [];
    setupApprovals(approvals) {
        this.addCall(new ContractCall(parseHexStringIntoBuffer(zapperExecutorInterface.encodeFunctionData('setupApprovals', [
            approvals.map((i) => i.token.address.address),
            approvals.map((i) => i.spender.address),
        ])), this.universe.config.addresses.executorAddress, 0n, BigInt(approvals.length) * 25000n, `Setup approvals: ${approvals.map((i) => i.toString()).join(', ')}`));
    }
    drainERC20(tokens, destination) {
        this.addCall(new ContractCall(parseHexStringIntoBuffer(zapperExecutorInterface.encodeFunctionData('drainERC20s', [
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
//# sourceMappingURL=TransactionBuilder.js.map