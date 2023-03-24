import { type Address } from '../base/Address';
import { SwapPaths } from '../searcher/Swap';
import { type Token } from '../entities/Token';
import { type Universe } from '../Universe';
import { ZapTransaction } from './ZapTransaction';
import { PermitTransferFrom } from '@uniswap/permit2-sdk';
export declare class SearcherResult {
    readonly universe: Universe;
    readonly swaps: SwapPaths;
    readonly signer: Address;
    readonly rToken: Token;
    constructor(universe: Universe, swaps: SwapPaths, signer: Address, rToken: Token);
    describe(): string[];
    private encodeActions;
    toTransaction(options?: Partial<{
        returnDust: boolean;
        permit2: {
            permit: PermitTransferFrom;
            signature: string;
        };
    }>): Promise<ZapTransaction>;
}
