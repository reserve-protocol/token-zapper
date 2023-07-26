import { type Address } from '../base/Address';
import { SwapPaths } from '../searcher/Swap';
import { type Token, type TokenQuantity } from '../entities/Token';
import { Universe } from '../Universe';
import { ZapTransaction } from './ZapTransaction';
import { PermitTransferFrom } from '@uniswap/permit2-sdk';
export declare class SearcherResult {
    readonly universe: Universe;
    readonly userInput: TokenQuantity;
    readonly swaps: SwapPaths;
    readonly signer: Address;
    readonly outputToken: Token;
    readonly blockNumber: number;
    constructor(universe: Universe, userInput: TokenQuantity, swaps: SwapPaths, signer: Address, outputToken: Token);
    describe(): string[];
    valueOfDust(): Promise<TokenQuantity>;
    private encodeActions;
    toTransaction(options?: Partial<{
        returnDust: boolean;
        permit2: {
            permit: PermitTransferFrom;
            signature: string;
        };
    }>): Promise<ZapTransaction>;
}
