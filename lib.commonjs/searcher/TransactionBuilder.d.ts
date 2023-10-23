import { type Universe } from '../Universe';
import { type Address } from '../base/Address';
import { type Approval } from '../base/Approval';
import { ContractCall } from '../base/ContractCall';
import { type Token } from '../entities/Token';
export declare const zapperExecutorInterface: import("../contracts/contracts/Zapper.sol/ZapperExecutor").ZapperExecutorInterface;
export declare const zapperInterface: import("../contracts/contracts/Zapper.sol/Zapper").ZapperInterface;
export declare class TransactionBuilder {
    readonly universe: Universe;
    constructor(universe: Universe);
    contractCalls: ContractCall[];
    setupApprovals(approvals: Approval[]): void;
    issueMaxRTokens(rToken: Token, destination: Address): void;
    drainERC20(tokens: Token[], destination: Address): void;
    addCall(call: ContractCall): void;
    gasEstimate(): bigint;
}
