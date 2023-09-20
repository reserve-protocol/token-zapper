import { type PermitTransferFrom } from '@uniswap/permit2-sdk';
import { type Address } from '../base/Address';
import { type Token, type TokenQuantity } from '../entities/Token';
import { type SwapPaths } from '../searcher/Swap';
import { type UniverseWithERC20GasTokenDefined } from './UniverseWithERC20GasTokenDefined';
import { ZapTransaction } from './ZapTransaction';
export declare class SearcherResult {
    readonly universe: UniverseWithERC20GasTokenDefined;
    readonly userInput: TokenQuantity;
    readonly swaps: SwapPaths;
    readonly signer: Address;
    readonly outputToken: Token;
    readonly blockNumber: number;
    constructor(universe: UniverseWithERC20GasTokenDefined, userInput: TokenQuantity, swaps: SwapPaths, signer: Address, outputToken: Token);
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
