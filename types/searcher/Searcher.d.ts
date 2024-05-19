import { type Address } from '../base/Address';
import { ArbitrumUniverse } from '../configuration/arbitrum';
import { BaseUniverse } from '../configuration/base';
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
export declare const findPrecursorTokenSet: (universe: EthereumUniverse | ArbitrumUniverse | BaseUniverse, userInputQuantity: TokenQuantity, rToken: Token, unitBasket: TokenQuantity[], searcher: Searcher<EthereumUniverse | ArbitrumUniverse | BaseUniverse>) => Promise<BasketTokenSourcingRuleApplication>;
export declare class Searcher<const SearcherUniverse extends ArbitrumUniverse | EthereumUniverse | BaseUniverse> {
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
        /**
         * PHASE 2: Trade inputQuantity into precursor set
         */
        timeTaken: number;
    }>;
    private findRTokenIntoSingleTokenZapViaRedeem__;
    private findTokenZapViaTrade;
    get perf(): import("./PerformanceMonitor").PerformanceMonitor;
    get config(): {
        readonly requoteTolerance: number;
        readonly routerDeadline: number;
        readonly searcherMinRoutesToProduce: number;
        readonly searcherMaxRoutesToProduce: number;
        readonly searchConcurrency: number;
        readonly defaultInternalTradeSlippage: bigint;
        readonly maxSearchTimeMs: number;
        readonly zapMaxValueLoss: number;
        readonly zapMaxDustProduced: number;
        readonly blocktime: 2000;
        readonly blockGasLimit: bigint;
        readonly simulateZapTransaction?: import("../configuration/ZapSimulation").SimulateZapTransactionFunction | undefined;
        readonly chainId: 8453;
        readonly nativeToken: {
            readonly symbol: "ETH";
            readonly decimals: 18;
            readonly name: "Ether";
        };
        readonly addresses: {
            readonly commonTokens: {
                readonly USDC: Address;
                readonly USDbC: Address;
                readonly DAI: Address;
                readonly WETH: Address;
                readonly ERC20GAS: Address;
                readonly cbETH: Address;
                readonly wstETH: Address;
            };
            readonly rTokens: {
                readonly hyUSD: Address;
                readonly bsd: Address;
                readonly iUSD: Address;
                readonly MATT: Address;
            };
            readonly facadeAddress: Address;
            readonly oldFacadeAddress: Address;
            readonly executorAddress: Address;
            readonly zapperAddress: Address;
            readonly wrappedNative: Address;
            readonly rtokenLens: Address;
            readonly balanceOf: Address;
            readonly curveRouterCall: Address;
            readonly ethBalanceOf: Address;
            readonly uniV3Router: Address;
            readonly curveStableSwapNGHelper: Address;
        };
    } | {
        readonly requoteTolerance: number;
        readonly routerDeadline: number;
        readonly searcherMinRoutesToProduce: number;
        readonly searcherMaxRoutesToProduce: number;
        readonly searchConcurrency: number;
        readonly defaultInternalTradeSlippage: bigint;
        readonly maxSearchTimeMs: number;
        readonly zapMaxValueLoss: number;
        readonly zapMaxDustProduced: number;
        readonly blocktime: 250;
        readonly blockGasLimit: bigint;
        readonly simulateZapTransaction?: import("../configuration/ZapSimulation").SimulateZapTransactionFunction | undefined;
        readonly chainId: 42161;
        readonly nativeToken: {
            readonly symbol: "ETH";
            readonly decimals: 18;
            readonly name: "Ether";
        };
        readonly addresses: {
            readonly commonTokens: {
                readonly RSR: Address;
                readonly eUSD: Address;
                readonly 'ETH+': Address;
                readonly RGUSD: Address;
                readonly ARB: Address;
                readonly USDC: Address;
                readonly DAI: Address;
                readonly WETH: Address;
                readonly ERC20GAS: Address;
                readonly cbETH: Address;
                readonly wstETH: Address;
                readonly reth: Address;
                readonly USDT: Address;
                readonly WBTC: Address;
                readonly FRAX: Address;
            };
            readonly rTokens: {
                KNOX: Address;
            };
            readonly facadeAddress: Address;
            readonly oldFacadeAddress: Address;
            readonly executorAddress: Address;
            readonly zapperAddress: Address;
            readonly wrappedNative: Address;
            readonly rtokenLens: Address;
            readonly balanceOf: Address;
            readonly curveRouterCall: Address;
            readonly ethBalanceOf: Address;
            readonly uniV3Router: Address;
            readonly curveStableSwapNGHelper: Address;
        };
    } | {
        readonly requoteTolerance: number;
        readonly routerDeadline: number;
        readonly searcherMinRoutesToProduce: number;
        readonly searcherMaxRoutesToProduce: number;
        readonly searchConcurrency: number;
        readonly defaultInternalTradeSlippage: bigint;
        readonly maxSearchTimeMs: number;
        readonly zapMaxValueLoss: number;
        readonly zapMaxDustProduced: number;
        readonly blocktime: 12000;
        readonly blockGasLimit: bigint;
        readonly simulateZapTransaction?: import("../configuration/ZapSimulation").SimulateZapTransactionFunction | undefined;
        readonly chainId: 1;
        readonly nativeToken: {
            readonly symbol: "ETH";
            readonly decimals: 18;
            readonly name: "Ether";
        };
        readonly addresses: {
            readonly commonTokens: {
                readonly USDC: Address;
                readonly USDT: Address;
                readonly DAI: Address;
                readonly WBTC: Address;
                readonly WETH: Address;
                readonly ERC20GAS: Address;
                readonly MIM: Address;
                readonly FRAX: Address;
                readonly 'eUSD3CRV-f': Address;
                readonly 'MIM-3LP3CRV-f': Address;
                readonly '3CRV': Address;
                readonly 'stkcvxeUSD3CRV-f': Address;
                readonly 'stkcvxeUSD3CRV-f2': Address;
                readonly 'stkcvxeUSD3CRV-f3': Address;
                readonly 'stkcvxMIM-3LP3CRV-f': Address;
                readonly stkcvx3Crv: Address;
                readonly cBAT: Address;
                readonly cDAI: Address;
                readonly cREP: Address;
                readonly cUSDC: Address;
                readonly cUSDT: Address;
                readonly cWBTC: Address;
                readonly cZRX: Address;
                readonly cUNI: Address;
                readonly cCOMP: Address;
                readonly cTUSD: Address;
                readonly cLINK: Address;
                readonly cMKR: Address;
                readonly cSUSHI: Address;
                readonly cAAVE: Address;
                readonly cYFI: Address;
                readonly cUSDP: Address;
                readonly cFEI: Address;
                readonly fOUSG: Address;
                readonly fUSDC: Address;
                readonly fDAI: Address;
                readonly fUSDT: Address;
                readonly fFRAX: Address;
                readonly saUSDT: Address;
                readonly saDAI: Address;
                readonly saUSDC: Address;
                readonly pyUSD: Address;
                readonly aEthPYUSD: Address;
                readonly saEthPyUSD: Address;
                readonly steakPYUSD: Address;
                readonly 'stkcvxETH+ETH-f': Address;
                readonly reth: Address;
                readonly steth: Address;
                readonly wsteth: Address;
                readonly cbeth: Address;
                readonly frxeth: Address;
                readonly sfrxeth: Address;
            };
            readonly rTokens: {
                readonly eUSD: Address;
                readonly 'ETH+': Address;
                readonly hyUSD: Address;
                readonly RSD: Address;
                readonly iUSD: Address;
                readonly 'USDC+': Address;
                readonly USD3: Address;
                readonly rgUSD: Address;
            };
            readonly facadeAddress: Address;
            readonly oldFacadeAddress: Address;
            readonly executorAddress: Address;
            readonly zapperAddress: Address;
            readonly wrappedNative: Address;
            readonly rtokenLens: Address;
            readonly balanceOf: Address;
            readonly curveRouterCall: Address;
            readonly ethBalanceOf: Address;
            readonly uniV3Router: Address;
            readonly curveStableSwapNGHelper: Address;
        };
    };
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
        /**
         * PHASE 2: Trade inputQuantity into precursor set
         */
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
//# sourceMappingURL=Searcher.d.ts.map