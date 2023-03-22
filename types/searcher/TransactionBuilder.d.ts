import { ContractCall } from '../base/ContractCall';
import { type Approval } from '../base/Approval';
import { type Address } from '../base/Address';
import { type Token } from '../entities/Token';
import { type Universe } from '../Universe';
export declare const zapperExecutorInterface: import("../contracts/contracts/IZapper.sol/IZapperExecutor").IZapperExecutorInterface;
export declare const zapperInterface: import("../contracts/contracts/IZapper.sol/IZapper").IZapperInterface;
export declare class TransactionBuilder {
    readonly universe: Universe;
    constructor(universe: Universe);
    contractCalls: ContractCall[];
    setupApprovals(approvals: Approval[]): void;
    drainERC20(tokens: Token[], destination: Address): void;
    addCall(call: ContractCall): void;
}
//# sourceMappingURL=TransactionBuilder.d.ts.map