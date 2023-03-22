import { ContractCall } from '../base/ContractCall';
import { IZapperExecutor__factory, IZapper__factory } from '../contracts';
import { parseHexStringIntoBuffer } from '../base/utils';
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
        ])), this.universe.config.addresses.executorAddress, 0n, `Setup approvals: ${approvals.map((i) => i.toString()).join(', ')}`));
    }
    drainERC20(tokens, destination) {
        this.addCall(new ContractCall(parseHexStringIntoBuffer(zapperExecutorInterface.encodeFunctionData('drainERC20s', [
            tokens.map((i) => i.address.address),
            destination.address,
        ])), this.universe.config.addresses.executorAddress, 0n, 'Cleanup'));
    }
    addCall(call) {
        this.contractCalls.push(call);
    }
}
//# sourceMappingURL=TransactionBuilder.js.map