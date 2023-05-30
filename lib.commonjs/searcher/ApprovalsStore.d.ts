import { type Address } from '../base/Address';
import { type ethers } from 'ethers';
import { type Token } from '../entities/Token';
export declare class ApprovalsStore {
    readonly provider: ethers.providers.Provider;
    constructor(provider: ethers.providers.Provider);
    private readonly cache;
    needsApproval(token: Token, owner: Address, spender: Address, amount: bigint): Promise<boolean>;
}
