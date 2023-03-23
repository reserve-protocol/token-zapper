import { type Address } from '../base/Address';
import { SwapPaths } from '../searcher/Swap';
import { type Token } from '../entities/Token';
import { type Universe } from '../Universe';
import { ZapTransaction } from './ZapTransaction';
export declare class SearcherResult {
    readonly universe: Universe;
    readonly swaps: SwapPaths;
    readonly signer: Address;
    readonly rToken: Token;
    constructor(universe: Universe, swaps: SwapPaths, signer: Address, rToken: Token);
    describe(): string[];
    private encodeActions;
    toTransaction(): Promise<ZapTransaction>;
}
//# sourceMappingURL=SearcherResult.d.ts.map