import { Universe } from '../Universe';
import { DestinationOptions, InteractionConvention } from '../action/Action';
import { type Address } from '../base/Address';
import { Config } from '../configuration/ChainConfiguration';
import { type Token, type TokenQuantity } from '../entities/Token';
import { TokenAmounts } from '../entities/TokenAmounts';
import { BasketTokenSourcingRuleApplication } from './BasketTokenSourcingRules';
import { BaseSearcherResult, RedeemZap, MintZap, ZapViaATrade } from './SearcherResult';
import { SingleSwap, SwapPath, SwapPaths } from './Swap';
import { ToTransactionArgs } from './ToTransactionArgs';
import { type UniverseWithERC20GasTokenDefined } from './UniverseWithERC20GasTokenDefined';
import { ZapTransaction } from './ZapTransaction';
declare class MultiChoicePath implements SwapPath {
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
    recursivelyUnwrapQty(qty: TokenQuantity): Promise<SwapPath | null>;
    get hasExtendedSimulationSupport(): boolean;
    private checkIfSimulationSupported;
    get maxConcurrency(): number;
    get minResults(): number;
    findRTokenIntoSingleTokenZapTx(rTokenQuantity: TokenQuantity, output: Token, signerAddress: Address, opts?: ToTransactionArgs): Promise<{
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
    }>;
    findRTokenIntoSingleTokenZap(rTokenQuantity: TokenQuantity, output: Token, signerAddress: Address, internalTradeSlippage: bigint): Promise<BaseSearcherResult>;
    findRTokenIntoSingleTokenZapViaRedeem(rTokenQuantity: TokenQuantity, output: Token, signerAddress: Address, slippage: bigint, abortSignal: AbortSignal, startTime?: number): Promise<RedeemZap[]>;
    findRTokenIntoSingleTokenZapViaRedeem__(rTokenQuantity: TokenQuantity, output: Token, signerAddress: Address, slippage: bigint, onResult: (result: RedeemZap) => Promise<void>, abortSignal: AbortSignal, startTime: number): Promise<void>;
    findTokenZapViaIssueance(userInput: TokenQuantity, rToken: Token, signerAddress: Address, slippage: bigint, abortSignal: AbortSignal): Promise<BaseSearcherResult[]>;
    findTokenZapViaTrade(userInput: TokenQuantity, rToken: Token, signerAddress: Address, slippage: bigint, abortSignal: AbortSignal, startTime?: number): Promise<ZapViaATrade[]>;
    findSingleInputToRTokenZap(userInput: TokenQuantity, rToken: Token, signerAddress: Address, slippage: bigint): Promise<{
        quote: MintZap | ZapViaATrade;
        cost: {
            units: bigint;
            txFee: TokenQuantity;
            txFeeUsd: TokenQuantity;
        };
        netValue: TokenQuantity;
    }>;
    get perf(): import("./PerformanceMonitor").PerformanceMonitor;
    get config(): import("../configuration/ChainConfiguration").ConfigWithToken<{
        ERC20GAS: string;
    }>;
    get defaultInternalTradeSlippage(): bigint;
    findSingleInputToRTokenZapTx(userInput: TokenQuantity, rToken: Token, userAddress: Address, opts?: ToTransactionArgs): Promise<{
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
    findSingleInputTokenSwap_(input: TokenQuantity, output: Token, destination: Address, slippage: bigint, abort: AbortSignal, maxHops: number | undefined, dynamicInput: boolean | undefined, onResult: (result: SwapPath) => Promise<void>): Promise<void>;
}
export {};
