import { Universe } from '../Universe';
import { DestinationOptions, InteractionConvention } from '../action/Action';
import { type Address } from '../base/Address';
import { Config } from '../configuration/ChainConfiguration';
import { type Token, type TokenQuantity } from '../entities/Token';
import { TokenAmounts } from '../entities/TokenAmounts';
import { BasketTokenSourcingRuleApplication } from './BasketTokenSourcingRules';
import { BaseSearcherResult, BurnRTokenSearcherResult, TradeSearcherResult } from './SearcherResult';
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
    increment(): void;
    readonly type = "MultipleSwaps";
    get proceedsOptions(): DestinationOptions;
    get interactionConvention(): InteractionConvention;
    get address(): Address;
    intoSwapPaths(universe: Universe<Config>): SwapPaths;
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
    findSingleInputToBasketGivenBasketUnit(inputQuantity: TokenQuantity, rToken: Token, basketUnit: TokenQuantity[], internalTradeSlippage: bigint): AsyncGenerator<{
        fullSwap: SwapPaths;
        trading: SwapPaths;
        minting: SwapPaths;
    }, void, unknown>;
    unwrapOnce(qty: TokenQuantity): Promise<SingleSwap>;
    recursivelyUnwrapQty(qty: TokenQuantity): Promise<SwapPath | null>;
    get hasExtendedSimulationSupport(): boolean;
    private checkIfSimulationSupported;
    get maxConcurrency(): number;
    get maxResults(): number;
    findRTokenIntoSingleTokenZapTx(rTokenQuantity: TokenQuantity, output: Token, signerAddress: Address, opts?: ToTransactionArgs): Promise<{
        failed: {
            searchResult: BaseSearcherResult;
            tx: ZapTransaction | null;
            error: any;
        }[];
        bestZapTx: {
            SearcherResult: BaseSearcherResult;
            tx: ZapTransaction;
        };
        alternatives: {
            SearcherResult: BaseSearcherResult;
            tx: ZapTransaction;
        }[];
    }>;
    private findBestTx;
    findRTokenIntoSingleTokenZap(rTokenQuantity: TokenQuantity, output: Token, signerAddress: Address, internalTradeSlippage: bigint): Promise<TradeSearcherResult | BurnRTokenSearcherResult>;
    findRTokenIntoSingleTokenZapViaRedeem(rTokenQuantity: TokenQuantity, output: Token, signerAddress: Address, slippage: bigint): Promise<BurnRTokenSearcherResult[]>;
    findRTokenIntoSingleTokenZapViaRedeem__(rTokenQuantity: TokenQuantity, output: Token, signerAddress: Address, slippage: bigint): AsyncGenerator<BurnRTokenSearcherResult, void, unknown>;
    findTokenZapViaIssueance(userInput: TokenQuantity, rToken: Token, signerAddress: Address, slippage: bigint): Promise<BaseSearcherResult[]>;
    findTokenZapViaTrade(userInput: TokenQuantity, rToken: Token, signerAddress: Address, slippage: bigint): Promise<TradeSearcherResult[]>;
    findSingleInputToRTokenZap(userInput: TokenQuantity, rToken: Token, signerAddress: Address, slippage: bigint): Promise<{
        quote: BaseSearcherResult;
        cost: {
            units: bigint;
            txFee: TokenQuantity;
            txFeeUsd: TokenQuantity;
        };
        netValue: TokenQuantity;
    }>;
    get config(): import("../configuration/ChainConfiguration").ConfigWithToken<{
        ERC20GAS: string;
    }>;
    get defaultInternalTradeSlippage(): bigint;
    findSingleInputToRTokenZapTx(userInput: TokenQuantity, rToken: Token, userAddress: Address, opts?: ToTransactionArgs): Promise<{
        failed: {
            searchResult: BaseSearcherResult;
            tx: ZapTransaction | null;
            error: any;
        }[];
        bestZapTx: {
            SearcherResult: BaseSearcherResult;
            tx: ZapTransaction;
        };
        alternatives: {
            SearcherResult: BaseSearcherResult;
            tx: ZapTransaction;
        }[];
    }>;
    private findSingleInputToRTokenZap_;
    externalQuoters(input: TokenQuantity, output: Token, destination: Address, dynamicInput: boolean, slippage: bigint, onResult?: (path: SwapPath) => void): Promise<SwapPath[]>;
    externalQuoters_(abort: AbortSignal, input: TokenQuantity, output: Token, destination: Address, dynamicInput: boolean, slippage: bigint, onResult: (path: SwapPath) => void): Promise<void>;
    internalQuoter(input: TokenQuantity, output: Token, destination: Address, maxHops?: number): Promise<SwapPath[]>;
    findSingleInputTokenSwap(input: TokenQuantity, output: Token, destination: Address, slippage: bigint, maxHops?: number, dynamicInput?: boolean): Promise<MultiChoicePath | null>;
}
export {};
