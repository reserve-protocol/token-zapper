import { type Address } from '../base/Address';
import { type Token, type TokenQuantity } from '../entities/Token';
import { BasketTokenSourcingRuleApplication } from './BasketTokenSourcingRules';
import { MultiChoicePath } from './MultiChoicePath';
import { SingleSwap, SwapPath, SwapPaths } from './Swap';
import { ToTransactionArgs } from './ToTransactionArgs';
import { type UniverseWithERC20GasTokenDefined } from './UniverseWithERC20GasTokenDefined';
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
export declare const findPrecursorTokenSet: (universe: UniverseWithERC20GasTokenDefined, userInputQuantity: TokenQuantity, rToken: Token, unitBasket: TokenQuantity[], searcher: Searcher<UniverseWithERC20GasTokenDefined>) => Promise<BasketTokenSourcingRuleApplication>;
export declare class Searcher<const SearcherUniverse extends UniverseWithERC20GasTokenDefined> {
    private readonly universe;
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
    get config(): import("../configuration/ChainConfiguration").ConfigWithToken<{
        ERC20GAS: string;
        WBTC: string;
    }>;
    get defaultInternalTradeSlippage(): bigint;
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
    externalQuoters(input: TokenQuantity, output: Token, dynamicInput: boolean, slippage: bigint, abort: AbortSignal): Promise<SwapPath[]>;
    externalQuoters_(input: TokenQuantity, output: Token, onResult: (path: SwapPath) => Promise<void>, opts: {
        abort: AbortSignal;
        dynamicInput: boolean;
        slippage: bigint;
    }): Promise<void>;
    internalQuoter(input: TokenQuantity, output: Token, destination: Address, onResult: (result: SwapPath) => Promise<void>, maxHops?: number): Promise<void>;
    findSingleInputTokenSwap(input: TokenQuantity, output: Token, destination: Address, slippage: bigint, abort: AbortSignal, maxHops?: number, dynamicInput?: boolean): Promise<MultiChoicePath>;
    findSingleInputTokenSwap_(input: TokenQuantity, output: Token, destination: Address, slippage: bigint, abort: AbortSignal, maxHops: number | undefined, dynamicInput: boolean | undefined, onResult: (result: SwapPath) => Promise<void>, rejectRatio?: number): Promise<void>;
}
