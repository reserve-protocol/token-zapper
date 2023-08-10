import { type Provider } from '@ethersproject/providers';
import { type Address } from '../base/Address';
import { type Token } from '../entities/Token';
export declare class ApprovalsStore {
    private readonly provider;
    constructor(provider: Provider);
    private readonly cache;
    queryAllowance(token: Token, owner: Address, spender: Address): Promise<import("ethers").BigNumber>;
    needsApproval(token: Token, owner: Address, spender: Address, amount: bigint): Promise<boolean>;
}
export declare class MokcApprovalsStore extends ApprovalsStore {
    constructor();
    needsApproval(token: Token, owner: Address, spender: Address, amount: bigint): Promise<boolean>;
}
