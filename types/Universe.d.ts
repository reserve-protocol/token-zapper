import { ethers } from 'ethers';
import { type Action } from './action/Action';
import { Address } from './base/Address';
import { Graph } from './exchange-graph/Graph';
import { Token, type TokenQuantity } from './entities/Token';
import { type ChainConfiguration } from './configuration/ChainConfiguration';
import { CommonTokens, RTokens } from './configuration';
import { DefaultMap } from './base/DefaultMap';
import { type Oracle } from './oracles/Oracle';
import { type DexAggregator } from './aggregators/DexAggregator';
import { Refreshable } from './entities/Refreshable';
import { ApprovalsStore } from './searcher/ApprovalsStore';
import { LPToken } from './action/LPToken';
import { SourcingRule } from './searcher/BasketTokenSourcingRules';
import { SwapPath } from './searcher';
export declare class Universe {
    readonly provider: ethers.providers.Provider;
    readonly chainConfig: ChainConfiguration;
    chainId: number;
    readonly refreshableEntities: Map<Address, Refreshable>;
    approvalStore: ApprovalsStore;
    readonly tokens: Map<Address, Token>;
    readonly lpTokens: Map<Token, LPToken>;
    readonly precursorTokenSourcingSpecialCases: DefaultMap<Token, Map<Token, SourcingRule>>;
    readonly actions: DefaultMap<Address, Action[]>;
    readonly tokenTradeSpecialCases: Map<Token, (amount: TokenQuantity, destination: Address) => Promise<SwapPath | null>>;
    readonly nativeToken: Token;
    readonly usd: Token;
    readonly graph: Graph;
    readonly wrappedTokens: Map<Token, {
        mint: Action;
        burn: Action;
    }>;
    readonly oracles: Oracle[];
    readonly dexAggregators: DexAggregator[];
    readonly rTokens: {
        [P in keyof RTokens]: Token | null;
    };
    readonly commonTokens: {
        [P in keyof CommonTokens]: Token | null;
    };
    refresh(entity: Address): Promise<void>;
    createRefreshableEntitity(address: Address, refresh: Refreshable['refreshAddress']): void;
    get config(): import("./configuration").StaticConfig;
    private readonly blockState;
    defineTokenSourcingRule(rToken: Token, precursor: Token, rule: SourcingRule): void;
    private priceCache;
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
    fairPrice(qty: TokenQuantity): Promise<TokenQuantity | null>;
    quoteIn(qty: TokenQuantity, tokenToQuoteWith: Token): Promise<TokenQuantity | null>;
    get currentBlock(): number;
    get gasPrice(): bigint;
    getToken(address: Address): Promise<Token>;
    createToken(address: Address, symbol: string, name: string, decimals: number): Token;
    addAction(action: Action, actionAddress?: Address): this;
    defineLPToken(lpTokenInstance: LPToken): void;
    defineMintable(mint: Action, burn: Action): {
        mint: Action;
        burn: Action;
    };
    private constructor();
    updateBlockState(block: number, gasPrice: bigint): Promise<void>;
    static create(provider: ethers.providers.Provider): Promise<Universe>;
    static createWithConfig(provider: ethers.providers.Provider, config: ChainConfiguration, network: ethers.providers.Network): Promise<Universe>;
    static createForTest(config: ChainConfiguration): Promise<Universe>;
    defineRToken(mainAddress: Address): Promise<void>;
}
//# sourceMappingURL=Universe.d.ts.map