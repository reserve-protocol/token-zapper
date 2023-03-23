import { type Address } from '../base/Address';
import { SwapPaths } from '../searcher/Swap';
import { type Token } from '../entities/Token';
import { type Universe } from '../Universe';
import { ApprovalsStore } from './ApprovalsStore';
import { ZapTransaction } from './ZapTransaction';
export declare class SearcherResult {
    readonly universe: Universe;
    readonly approvals: ApprovalsStore;
    readonly swaps: SwapPaths;
    readonly signer: Address;
    readonly rToken: Token;
    constructor(universe: Universe, approvals: ApprovalsStore, swaps: SwapPaths, signer: Address, rToken: Token);
    describe(): string[];
    private encodeActions;
    toTransaction(): Promise<ZapTransaction>;
}
//# sourceMappingURL=SearcherResult.d.ts.map