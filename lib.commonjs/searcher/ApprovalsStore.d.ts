import { type Provider } from '@ethersproject/providers';
import { type Address } from '../base/Address';
import { type Token } from '../entities/Token';
import { type Universe } from '../Universe';
export declare class ApprovalsStore {
    private readonly provider;
    constructor(provider: Provider);
    private readonly cache;
    queryAllowance(token: Token, owner: Address, spender: Address): Promise<import("ethers").BigNumber>;
    queryBalance(token: Token, owner: Address, universe: Universe): Promise<import("../entities/Token").TokenQuantity>;
    needsApproval(token: Token, owner: Address, spender: Address, amount: bigint): Promise<boolean>;
}
