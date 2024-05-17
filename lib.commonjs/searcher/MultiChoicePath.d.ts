import { Universe } from '../Universe';
import { DestinationOptions, InteractionConvention } from '../action/Action';
import { type Address } from '../base/Address';
import { Config } from '../configuration/ChainConfiguration';
import { type Token, type TokenQuantity } from '../entities/Token';
import { TokenAmounts } from '../entities/TokenAmounts';
import { BaseSearcherResult } from './SearcherResult';
import { SingleSwap, SwapPath, SwapPaths } from './Swap';
import { ToTransactionArgs } from './ToTransactionArgs';
import { type UniverseWithERC20GasTokenDefined } from './UniverseWithERC20GasTokenDefined';
import { ZapTransaction } from './ZapTransaction';
import { Searcher } from './Searcher';
export declare const resolveTradeConflicts: (searcher: Searcher<any>, abortSignal: AbortSignal, inTrades: SwapPath[]) => Promise<SwapPath[]>;
export declare const generateAllPermutations: (universe: UniverseWithERC20GasTokenDefined, arr: MultiChoicePath[], precursorTokens: Set<Token>) => Promise<SwapPath[][]>;
export declare const createConcurrentStreamingSeacher: (searcher: Searcher<UniverseWithERC20GasTokenDefined>, toTxArgs: ToTransactionArgs) => {
    abortController: AbortController;
    onResult: (result: BaseSearcherResult) => Promise<void>;
    resultReadyPromise: Promise<unknown>;
    getResults: (startTime: number) => {
        failed: {
            searchResult: BaseSearcherResult;
            tx: ZapTransaction;
        }[];
        bestZapTx: {
            searchResult: BaseSearcherResult;
            tx: ZapTransaction;
        };
        alternatives: {
            searchResult: BaseSearcherResult;
            tx: ZapTransaction;
        }[];
        timeTaken: number;
    };
};
export declare const chunkifyIterable: <T>(iterable: Iterable<T>, chunkSize: number, abort: AbortSignal) => Generator<T[], void, unknown>;
export declare class MultiChoicePath implements SwapPath {
    readonly universe: UniverseWithERC20GasTokenDefined;
    readonly paths: SwapPath[];
    private index;
    constructor(universe: UniverseWithERC20GasTokenDefined, paths: SwapPath[]);
    get hasMultipleChoices(): boolean;
    get supportsDynamicInput(): boolean;
    intoSwapPaths(universe: Universe<Config>): SwapPaths;
    increment(): void;
    readonly type = "MultipleSwaps";
    get proceedsOptions(): DestinationOptions;
    get interactionConvention(): InteractionConvention;
    get address(): Address;
    get addressInUse(): Set<Address>;
    get oneUsePrZap(): boolean;
    exchange(tokenAmounts: TokenAmounts): Promise<void>;
    compare(other: SwapPath): number;
    cost(universe: Universe<Config>): Promise<{
        units: bigint;
        txFee: TokenQuantity;
        txFeeUsd: TokenQuantity;
    }>;
    netValue(universe: Universe<Config>): Promise<TokenQuantity>;
    get gasUnits(): bigint;
    get path(): SwapPath;
    get inputs(): TokenQuantity[];
    get steps(): SingleSwap[];
    get outputs(): TokenQuantity[];
    get outputValue(): TokenQuantity;
    get destination(): Address;
    toString(): string;
    describe(): string[];
}
