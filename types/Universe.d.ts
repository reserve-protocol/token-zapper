import { ethers } from 'ethers';
import { type BaseAction as Action } from './action/Action';
import { Address } from './base/Address';
import { Graph } from './exchange-graph/Graph';
import { PricedTokenQuantity, Token, type TokenQuantity } from './entities/Token';
import { TokenLoader } from './entities/makeTokenLoader';
import { type Config } from './configuration/ChainConfiguration';
import { DefaultMap } from './base/DefaultMap';
import { type PriceOracle } from './oracles/PriceOracle';
import { Refreshable } from './entities/Refreshable';
import { ApprovalsStore } from './searcher/ApprovalsStore';
import { LPToken } from './action/LPToken';
import { SourcingRule } from './searcher/SourcingRule';
import { SwapPath } from './searcher/Swap';
import { Searcher } from './searcher/Searcher';
import { DexAggregator } from '.';
type TokenList<T> = {
    [K in keyof T]: Token;
};
interface OracleDef {
    quote: (qty: TokenQuantity) => Promise<TokenQuantity>;
    quoteIn: (qty: TokenQuantity, tokenToQuoteWith: Token) => Promise<TokenQuantity>;
}
export declare class Universe<const UniverseConf extends Config = Config> {
    readonly provider: ethers.providers.JsonRpcProvider;
    readonly config: UniverseConf;
    readonly approvalsStore: ApprovalsStore;
    readonly loadToken: TokenLoader;
    private emitter;
    _finishResolving: () => void;
    initialized: Promise<void>;
    get chainId(): UniverseConf['chainId'];
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
    readonly nativeToken: Token;
    readonly wrappedNativeToken: Token;
    readonly usd: Token;
    readonly graph: Graph;
    readonly wrappedTokens: Map<Token, {
        mint: Action;
        burn: Action;
        allowAggregatorSearcher: boolean;
    }>;
    readonly oracles: PriceOracle[];
    readonly dexAggregators: DexAggregator[];
    readonly rTokens: TokenList<UniverseConf["addresses"]["rTokens"]>;
    readonly commonTokens: TokenList<UniverseConf["addresses"]["commonTokens"]>;
    refresh(entity: Address): Promise<void>;
    createRefreshableEntity(address: Address, refresh: Refreshable['refreshAddress']): void;
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
    oracle?: OracleDef;
    fairPrice(qty: TokenQuantity): Promise<TokenQuantity | null>;
    priceQty(qty: TokenQuantity): Promise<PricedTokenQuantity>;
    quoteIn(qty: TokenQuantity, tokenToQuoteWith: Token): Promise<TokenQuantity | null>;
    readonly searcher: Searcher<Universe<any>>;
    get currentBlock(): number;
    get gasPrice(): bigint;
    getToken(address: Address): Promise<Token>;
    createToken(address: Address, symbol: string, name: string, decimals: number): Token;
    addAction(action: Action, actionAddress?: Address): this;
    defineLPToken(lpTokenInstance: LPToken): void;
    get execAddress(): Address;
    get zapperAddress(): Address;
    defineMintable(mint: Action, burn: Action, allowAggregatorSearcher?: boolean): {
        mint: Action;
        burn: Action;
        allowAggregatorSearcher: boolean;
    };
    private constructor();
    updateBlockState(block: number, gasPrice: bigint): Promise<void>;
    static createWithConfig<const C extends Config>(provider: ethers.providers.JsonRpcProvider, config: C, initialize: (universe: Universe<C>) => Promise<void>, opts?: Partial<{
        tokenLoader?: TokenLoader;
        approvalsStore?: ApprovalsStore;
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
    get approvalAddress(): string;
    zap(tokenIn: string, amountIn: bigint, rToken: string, signerAddress: string): Promise<{
        quote: import("./searcher/SearcherResult").BaseSearcherResult;
        cost: {
            units: bigint;
            txFee: TokenQuantity;
            txFeeUsd: TokenQuantity;
        };
        netValue: TokenQuantity;
    }>;
    zapETH(amountIn: bigint, rToken: string, signerAddress: string): Promise<{
        quote: import("./searcher/SearcherResult").BaseSearcherResult;
        cost: {
            units: bigint;
            txFee: TokenQuantity;
            txFeeUsd: TokenQuantity;
        };
        netValue: TokenQuantity;
    }>;
    redeem(rToken: string, amount: bigint, output: string, signerAddress: string): Promise<import("./searcher/SearcherResult").TradeSearcherResult | import("./searcher/SearcherResult").BurnRTokenSearcherResult>;
}
export {};
//# sourceMappingURL=Universe.d.ts.map