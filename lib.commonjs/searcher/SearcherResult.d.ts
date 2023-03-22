import { type Address } from '../base/Address';
import { SwapPaths } from '../searcher/Swap';
import { type Universe } from '../Universe';
import { ApprovalsStore } from './ApprovalsStore';
import { ZapTransaction } from './ZapTransaction';
export declare class SearcherResult {
    readonly universe: Universe;
    readonly approvals: ApprovalsStore;
    readonly swaps: SwapPaths;
    readonly signer: Address;
    constructor(universe: Universe, approvals: ApprovalsStore, swaps: SwapPaths, signer: Address);
    describe(): string[];
    private encodeActions;
    toTransaction(): Promise<ZapTransaction>;
}
