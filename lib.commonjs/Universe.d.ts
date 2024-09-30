import { ethers } from 'ethers';
import { type BaseAction as Action } from './action/Action';
import { LPToken } from './action/LPToken';
import { Address } from './base/Address';
import { DefaultMap } from './base/DefaultMap';
import { SimulateZapTransactionFunction, type Config } from './configuration/ChainConfiguration';
import { Refreshable } from './entities/Refreshable';
import { Token, type TokenQuantity } from './entities/Token';
import { TokenLoader } from './entities/makeTokenLoader';
import { Graph } from './exchange-graph/Graph';
import { PriceOracle } from './oracles/PriceOracle';
import { ApprovalsStore } from './searcher/ApprovalsStore';
import { SourcingRule } from './searcher/SourcingRule';
import { CompoundV2Deployment } from './action/CTokens';
import { LidoDeployment } from './action/Lido';
import { RTokenDeployment } from './action/RTokens';
import { TradingVenue } from './aggregators/DexAggregator';
import { BlockCache } from './base/BlockBasedCache';
import { AaveV2Deployment } from './configuration/setupAaveV2';
import { AaveV3Deployment } from './configuration/setupAaveV3';
import { CompoundV3Deployment } from './configuration/setupCompV3';
import { ReserveConvex } from './configuration/setupConvexStakingWrappers';
import { CurveIntegration } from './configuration/setupCurve';
import { PerformanceMonitor } from './searcher/PerformanceMonitor';
import { Searcher } from './searcher/Searcher';
import { SwapPath } from './searcher/Swap';
import { ToTransactionArgs } from './searcher/ToTransactionArgs';
import { Contract } from './tx-gen/Planner';
import { ZapperTokenQuantityPrice } from './oracles/ZapperAggregatorOracle';
type TokenList<T> = {
    [K in keyof T]: Token;
};
export type Integrations = Partial<{
    aaveV3: AaveV3Deployment;
    aaveV2: AaveV2Deployment;
    fluxFinance: CompoundV2Deployment;
    compoundV2: CompoundV2Deployment;
    compoundV3: CompoundV3Deployment;
    uniswapV3: TradingVenue;
    curve: CurveIntegration;
    rocketpool: TradingVenue;
    aerodrome: TradingVenue;
    lido: LidoDeployment;
    convex: ReserveConvex;
}>;
export declare class Universe<const UniverseConf extends Config = Config> {
    readonly provider: ethers.providers.JsonRpcProvider;
    readonly config: UniverseConf;
    readonly approvalsStore: ApprovalsStore;
    readonly loadToken: TokenLoader;
    private readonly simulateZapFn_;
    private emitter;
    _finishResolving: () => void;
    initialized: Promise<void>;
    get chainId(): UniverseConf['chainId'];
    private readonly caches;
    readonly perf: PerformanceMonitor;
    prettyPrintPerfs(addContext?: boolean): void;
    createCache<Input, Result, Key = Input>(fetch: (key: Input) => Promise<Result>, ttl?: number, keyFn?: (key: Input) => Key): BlockCache<Input, Result, Key>;
    readonly refreshableEntities: Map<Address, Refreshable>;
    readonly tokens: Map<Address, Token>;
    readonly lpTokens: Map<Token, LPToken>;
    private _gasTokenPrice;
    get gasTokenPrice(): TokenQuantity;
    quoteGas(units: bigint): Promise<{
        units: bigint;
        txFee: TokenQuantity;
        txFeeUsd: TokenQuantity;
    }>;
    readonly precursorTokenSourcingSpecialCases: Map<Token, SourcingRule>;
    readonly actions: DefaultMap<Address, Action[]>;
    private readonly allActions;
    readonly tokenTradeSpecialCases: Map<Token, (amount: TokenQuantity, destination: Address) => Promise<SwapPath | null>>;
    readonly tokenFromTradeSpecialCases: Map<Token, (amount: TokenQuantity, output: Token) => Promise<SwapPath | null>>;
    readonly nativeToken: Token;
    readonly wrappedNativeToken: Token;
    readonly usd: Token;
    private fairPriceCache;
    readonly graph: Graph;
    readonly wrappedTokens: Map<Token, {
        mint: Action;
        burn: Action;
        allowAggregatorSearcher: boolean;
    }>;
    readonly oracles: PriceOracle[];
    private tradeVenues;
    private readonly tradingVenuesSupportingDynamicInput;
    addTradeVenue(venue: TradingVenue): void;
    getTradingVenues(input: TokenQuantity, output: Token): TradingVenue[];
    swap(input: TokenQuantity, output: Token, opts?: {
        slippage: bigint;
        dynamicInput: boolean;
        abort: AbortSignal;
    }): Promise<SwapPath>;
    swaps(input: TokenQuantity, output: Token, onResult: (result: SwapPath) => Promise<void>, opts: {
        slippage: bigint;
        dynamicInput: boolean;
        abort: AbortSignal;
    }): Promise<void>;
    readonly rTokens: TokenList<UniverseConf["addresses"]["rTokens"]>;
    readonly commonTokens: TokenList<UniverseConf["addresses"]["commonTokens"]>;
    private commonTokensSet_;
    get commonTokensInfo(): {
        addresses: Set<Address>;
        tokens: Set<Token>;
    };
    private rTokensSet_;
    get rTokensInfo(): {
        addresses: Set<Address>;
        tokens: Set<Token>;
    };
    preferredRTokenInputToken: DefaultMap<Token, Set<Token>>;
    preferredToken: Map<Token, Token>;
    addPreferredRTokenInputToken(token: Token, inputToken: Token): void;
    readonly integrations: Integrations;
    private readonly rTokenDeployments;
    defineRToken(rTokenAddress: Address): Promise<Token>;
    getRTokenDeployment(token: Token): RTokenDeployment;
    addIntegration<K extends keyof Integrations>(key: K, value: Integrations[K]): NonNullable<Partial<{
        aaveV3: AaveV3Deployment;
        aaveV2: AaveV2Deployment;
        fluxFinance: CompoundV2Deployment;
        compoundV2: CompoundV2Deployment;
        compoundV3: CompoundV3Deployment;
        uniswapV3: TradingVenue;
        curve: CurveIntegration;
        rocketpool: TradingVenue;
        aerodrome: TradingVenue;
        lido: LidoDeployment;
        convex: ReserveConvex;
    }>[K]>;
    balanceOf(token: Token, account: Address): Promise<TokenQuantity>;
    private readonly blockState;
    defineTokenSourcingRule(precursor: Token, rule: SourcingRule): void;
    /**
     * This method try to price a given token in USD.
     * It will first try and see if there is an canonical way to mint/burn the token,
     * if there is, it will recursively unwrap the token until it finds a what the token consists of.
     *
     * Once the token is fully unwrapped, it will query the oracles to find the price of each underlying
     * quantity, and sum them up.
     *
     * @param qty quantity to price
     * @returns The price of the qty in USD, or null if the price cannot be determined
     */
    readonly oracle: ZapperTokenQuantityPrice;
    /** */
    addSingleTokenPriceOracle(opts: {
        token: Token;
        oracleAddress: Address;
        priceToken: Token;
    }): Promise<PriceOracle>;
    addSingleTokenPriceSource(opts: {
        token: Token;
        priceFn: () => Promise<TokenQuantity>;
        priceToken: Token;
    }): PriceOracle;
    fairPrice(qty: TokenQuantity): Promise<TokenQuantity | null>;
    quoteIn(qty: TokenQuantity, tokenToQuoteWith: Token): Promise<TokenQuantity | null>;
    get currentBlock(): number;
    get gasPrice(): bigint;
    getToken(address: Address): Promise<Token>;
    createToken(address: Address, symbol: string, name: string, decimals: number): Token;
    addAction(action: Action, actionAddress?: Address): this;
    defineLPToken(lpTokenInstance: LPToken): void;
    weirollZapperExec: Contract;
    weirollZapperExecContract: Contract;
    findBurnActions(token: Token): Action[];
    get execAddress(): Address;
    get zapperAddress(): Address;
    createTradeEdge(tokenIn: Token, tokenOut: Token): Promise<Action>;
    defineMintable(mint: Action, burn: Action, allowAggregatorSearcher?: boolean): {
        mint: Action;
        burn: Action;
        allowAggregatorSearcher: boolean;
    };
    simulateZapFn: SimulateZapTransactionFunction;
    get searcher(): Searcher<Universe<UniverseConf>>;
    private constructor();
    updateBlockState(block: number, gasPrice: bigint): Promise<void>;
    static createWithConfig<const C extends Config>(provider: ethers.providers.JsonRpcProvider, config: C, initialize: (universe: Universe<C>) => Promise<void>, opts?: Partial<{
        tokenLoader?: TokenLoader;
        approvalsStore?: ApprovalsStore;
        simulateZapFn?: SimulateZapTransactionFunction;
    }>): Promise<Universe<C>>;
    emitEvent(object: {
        type: string;
        params: Record<string, any>;
    }): void;
    onEvent(cb: (event: {
        type: string;
        params: Record<string, any>;
        chainId: number;
    }) => void): () => void;
    zap(userInput: TokenQuantity, rToken: Token | string, userAddress: Address | string, opts?: ToTransactionArgs): Promise<import("./searcher/ZapTransaction").ZapTransaction>;
    redeem(rTokenQuantity: TokenQuantity, outputToken: Token | string, userAddress: Address | string, opts?: ToTransactionArgs): Promise<import("./searcher/ZapTransaction").ZapTransaction>;
    get approvalAddress(): string;
}
export {};
