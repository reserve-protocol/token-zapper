import { type Universe } from '../Universe';
import { type Address } from '../base/Address';
import { type Approval } from '../base/Approval';
import { ContractCall } from '../base/ContractCall';
import { type Token } from '../entities/Token';
export declare const zapperExecutorInterface: import("../contracts/contracts/IZapper.sol/IZapperExecutor").IZapperExecutorInterface;
export declare const zapperInterface: import("../contracts/contracts/IZapper.sol/IZapper").IZapperInterface;
export declare class TransactionBuilder {
    readonly universe: Universe;
    constructor(universe: Universe);
    contractCalls: ContractCall[];
    setupApprovals(approvals: Approval[]): void;
    drainERC20(tokens: Token[], destination: Address): void;
    addCall(call: ContractCall): void;
    gasEstimate(): bigint;
}
//# sourceMappingURL=TransactionBuilder.d.ts.map