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
export declare class Universe {
    readonly provider: ethers.providers.Provider;
    readonly chainConfig: ChainConfiguration;
    chainId: number;
    readonly refreshableEntities: Map<Address, Refreshable>;
    approvalStore: ApprovalsStore;
    readonly tokens: Map<Address, Token>;
    readonly actions: DefaultMap<Address, Action[]>;
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
    fairPrice(qty: TokenQuantity): Promise<TokenQuantity | null>;
    get currentBlock(): number;
    get gasPrice(): bigint;
    getToken(address: Address): Promise<Token>;
    createToken(address: Address, symbol: string, name: string, decimals: number): Token;
    addAction(action: Action, actionAddress?: Address): this;
    defineMintable(mint: Action, burn: Action): void;
    private constructor();
    updateBlockState(block: number, gasPrice: bigint): Promise<void>;
    static create(provider: ethers.providers.Provider): Promise<Universe>;
    static createWithConfig(provider: ethers.providers.Provider, config: ChainConfiguration): Promise<Universe>;
    static createForTest(config: ChainConfiguration): Promise<Universe>;
}
