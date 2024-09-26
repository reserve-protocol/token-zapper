import { Universe } from '..';
import { type Address } from '../base/Address';
import { ArbitrumUniverse } from '../configuration/arbitrum';
import { BaseUniverse } from '../configuration/base';
import { Config } from '../configuration/ChainConfiguration';
import { EthereumUniverse } from '../configuration/ethereum';
import { type Token, type TokenQuantity } from '../entities/Token';
import { BasketTokenSourcingRuleApplication } from './BasketTokenSourcingRules';
import { MultiChoicePath } from './MultiChoicePath';
import { SingleSwap, SwapPath, SwapPaths } from './Swap';
import { ToTransactionArgs } from './ToTransactionArgs';
/**
 * Takes some base basket set representing a unit of output, and converts it into some
 * precursor set, in which the while basket can be derived via mints.
 *
 * It does this recursively to handle cases where tokens are minted from other tokens
 * or in the case that RTokens are part of the basket.
 *
 * Function produces two outputs, a token quantity set representing the sum of the basket as
 * fraction of the whole
 *
 * So (0.22 saUSDT, 1100 cUSDT, 0.5 USDT) becomes 1.0 USDT
 *
 * The second output is a tree which can be traversed to DF to produce a set of minting operations
 * producing the basket from the precursor set.
 */
export declare const findPrecursorTokenSet: (universe: EthereumUniverse | ArbitrumUniverse | BaseUniverse, userInputQuantity: TokenQuantity, rToken: Token, unitBasket: TokenQuantity[], searcher: Searcher<EthereumUniverse | ArbitrumUniverse | BaseUniverse>) => Promise<{
    rules: BasketTokenSourcingRuleApplication;
    initialTrade: {
        input: TokenQuantity;
        output: Token;
    } | null;
}>;
export declare class Searcher<const SearcherUniverse extends Universe<Config>> {
    readonly universe: SearcherUniverse;
    private readonly defaultSearcherOpts;
    constructor(universe: SearcherUniverse);
    /**
     * @note This helper will find some set of operations converting a 'inputQuantity' into
     * a token basket represented via 'basketUnit' param.
     *
     * It does this by first finding the smallest set of tokens that can be used to derive the whole basket.
     *
     * Then it trades the inputQuantity for the tokens in the 'precursor' set.
     *
     * Lastly it mints the basket set.
     *
     * @param inputQuantity the token quantity to convert into the token basket
     * @param basketUnit a token quantity set representing one unit of output
     **/
    findSingleInputToBasketGivenBasketUnit(inputQuantity: TokenQuantity, rToken: Token, basketUnit: TokenQuantity[], internalTradeSlippage: bigint, onResult: (result: {
        inputQuantity: TokenQuantity;
        firstTrade: SwapPath | null;
        trading: SwapPaths;
        minting: SwapPaths;
    }) => Promise<void>, abortSignal: AbortSignal): Promise<void>;
    unwrapOnce(qty: TokenQuantity): Promise<SingleSwap>;
    private recursivelyUnwrapQty;
    get hasExtendedSimulationSupport(): boolean;
    private checkIfSimulationSupported;
    get maxConcurrency(): number;
    get minResults(): number;
    redeem(rTokenQuantity: TokenQuantity, output: Token, signerAddress: Address, opts?: ToTransactionArgs): Promise<{
        failed: {
            searchResult: import("./SearcherResult").BaseSearcherResult;
            tx: import("./ZapTransaction").ZapTransaction;
        }[];
        bestZapTx: {
            searchResult: import("./SearcherResult").BaseSearcherResult;
            tx: import("./ZapTransaction").ZapTransaction;
        };
        alternatives: {
            searchResult: import("./SearcherResult").BaseSearcherResult;
            tx: import("./ZapTransaction").ZapTransaction;
        }[];
        timeTaken: number;
    }>;
    private findRTokenIntoSingleTokenZapViaRedeem__;
    private findTokenZapViaTrade;
    get perf(): import("./PerformanceMonitor").PerformanceMonitor;
    get config(): Config;
    get defaultInternalTradeSlippage(): bigint;
    zapIntoRTokenYieldPosition(userInput: TokenQuantity, rToken: Token, yieldPosition: Token, userAddress: Address, opts?: Omit<ToTransactionArgs, 'endPosition'>): Promise<{
        failed: {
            searchResult: import("./SearcherResult").BaseSearcherResult;
            tx: import("./ZapTransaction").ZapTransaction;
        }[];
        bestZapTx: {
            searchResult: import("./SearcherResult").BaseSearcherResult;
            tx: import("./ZapTransaction").ZapTransaction;
        };
        alternatives: {
            searchResult: import("./SearcherResult").BaseSearcherResult;
            tx: import("./ZapTransaction").ZapTransaction;
        }[];
        timeTaken: number;
    }>;
    zapIntoRToken(userInput: TokenQuantity, rToken: Token, userAddress: Address, opts?: ToTransactionArgs): Promise<{
        failed: {
            searchResult: import("./SearcherResult").BaseSearcherResult;
            tx: import("./ZapTransaction").ZapTransaction;
        }[];
        bestZapTx: {
            searchResult: import("./SearcherResult").BaseSearcherResult;
            tx: import("./ZapTransaction").ZapTransaction;
        };
        alternatives: {
            searchResult: import("./SearcherResult").BaseSearcherResult;
            tx: import("./ZapTransaction").ZapTransaction;
        }[];
        timeTaken: number;
    }>;
    private findSingleInputToRTokenZap_;
    externalQuoters_(input: TokenQuantity, output: Token, onResult: (path: SwapPath) => Promise<void>, opts: {
        abort: AbortSignal;
        dynamicInput: boolean;
        slippage: bigint;
    }): Promise<void>;
    internalQuoter(input: TokenQuantity, output: Token, destination: Address, onResult: (result: SwapPath) => Promise<void>, maxHops?: number): Promise<void>;
    findSingleInputTokenSwap(dynamicInput: boolean, input: TokenQuantity, output: Token, destination: Address, slippage: bigint, abort: AbortSignal, maxHops: number): Promise<MultiChoicePath>;
    tokenPrices: Map<Token, TokenQuantity>;
    fairPrice(qty: TokenQuantity): Promise<TokenQuantity | null>;
    findSingleInputTokenSwap_(input: TokenQuantity, output: Token, destination: Address, slippage: bigint, abort: AbortSignal, maxHops: number, dynamicInput: boolean, onResult: (result: SwapPath) => Promise<void>, rejectRatio?: number): Promise<void>;
    debugLog(...args: any[]): void;
}
