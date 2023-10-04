import { type PermitTransferFrom } from '@uniswap/permit2-sdk';
import { type Address } from '../base/Address';
import { type Token, type TokenQuantity } from '../entities/Token';
import { SwapPaths } from '../searcher/Swap';
import { type UniverseWithERC20GasTokenDefined } from './UniverseWithERC20GasTokenDefined';
import { ZapTransaction } from './ZapTransaction';
import { ZapperOutputStructOutput } from '../contracts/contracts/Zapper.sol/Zapper';
export declare class SearcherResult {
    readonly universe: UniverseWithERC20GasTokenDefined;
    readonly userInput: TokenQuantity;
    swaps: SwapPaths;
    readonly signer: Address;
    readonly outputToken: Token;
    readonly blockNumber: number;
    constructor(universe: UniverseWithERC20GasTokenDefined, userInput: TokenQuantity, swaps: SwapPaths, signer: Address, outputToken: Token);
    describe(): string[];
    valueOfDust(): Promise<TokenQuantity>;
    private encodeActions;
    simulate({ data, value, inputToken, gasLimit }: {
        data: string;
        value: bigint;
        inputToken: Token;
        gasLimit?: number;
    }): Promise<ZapperOutputStructOutput>;
    toTransaction(options?: Partial<{
        returnDust: boolean;
        gasLimit?: number;
        permit2: {
            permit: PermitTransferFrom;
            signature: string;
        };
    }>): Promise<ZapTransaction>;
}
