import ethereumPools from '../configuration/data/ethereum/curvePoolList.json';
import { UniverseWithCommonBaseTokens } from '../searcher/UniverseWithERC20GasTokenDefined';
import { Address } from '../base/Address';
import { Token, TokenQuantity } from '../entities/Token';
import { DefaultMap } from '../base/DefaultMap';
import { CurveStableSwapNGPool } from '../action/CurveStableSwapNG';
import { loadCurve } from '../action/Curve';
import { DexRouter, TradingVenue } from '../aggregators/DexAggregator';
import { Universe } from '..';
type JSONPoolDataGeneric = (typeof ethereumPools.data.poolData)[number];
type JSONCoin = Omit<JSONPoolDataGeneric['coins'][number], 'ethLsdApy' | 'usdPrice' | 'poolBalance'>;
declare class CurveCoin {
    readonly token: Token;
    readonly isBasePoolLpToken: boolean;
    constructor(token: Token, isBasePoolLpToken: boolean);
    static fromJson(universe: UniverseWithCommonBaseTokens, data: JSONCoin): Promise<CurveCoin>;
    toString(): string;
}
type AssetTypeStr = 'eth' | 'usd' | 'btc' | 'sameTypeCrypto' | 'mixed';
declare class AssetType {
    readonly universe: UniverseWithCommonBaseTokens;
    readonly pool: CurvePool;
    readonly assetType: AssetTypeStr;
    precursors: Set<Token>;
    bestInputTokens: Set<Token>;
    private pegged?;
    constructor(universe: UniverseWithCommonBaseTokens, pool: CurvePool, assetType: AssetTypeStr);
    private initialize;
    initializeEth(): void;
    initializeUsd(): void;
    initializeBtc(): void;
}
export declare class CurvePool {
    readonly universe: UniverseWithCommonBaseTokens;
    readonly poolTokens: CurveCoin[];
    readonly underlyingTokens: CurveCoin[];
    readonly lpTokenCurve: CurveCoin;
    readonly isMetaPool: boolean;
    readonly name: string;
    readonly address: Address;
    private readonly allPools;
    private readonly basePoolAddress?;
    readonly allPoolTokens: Set<Token>;
    readonly allPoolTokensWithoutBaseLp: Set<Token>;
    readonly baseTokens: Set<Token>;
    readonly underlying: Set<Token>;
    readonly assetType: AssetType;
    constructor(universe: UniverseWithCommonBaseTokens, assetTypeStr: AssetTypeStr, poolTokens: CurveCoin[], underlyingTokens: CurveCoin[], lpTokenCurve: CurveCoin, isMetaPool: boolean, name: string, address: Address, allPools: Map<Address, CurvePool>, basePoolAddress?: Address | undefined);
    get lpToken(): Token;
    get isBasePool(): boolean;
    get basePool(): CurvePool | undefined;
    toString(): string;
    static fromJson(universe: UniverseWithCommonBaseTokens, data: JSONPoolDataGeneric, poolMap: Map<Address, CurvePool>): Promise<CurvePool>;
}
declare const convertPoolListIntoMaps: <T extends {
    lpToken: Token;
    address: Address;
    allPoolTokens: Iterable<Token>;
}>(poolInst: T[]) => Promise<{
    poolInst: T[];
    poolByPoolAddress: Map<Address, T>;
    poolByLPToken: Map<Token, T>;
    poolsByPoolTokens: DefaultMap<Token, Set<T>>;
    lpTokenToPoolAddress: Map<Token, Address>;
}>;
export declare const loadCurvePoolFromJson: <T extends {
    fromJson: (universe: Universe, data: JSONPoolDataGeneric) => Promise<T>;
}>(universe: UniverseWithCommonBaseTokens, poolsAsJsonData: JSONPoolDataGeneric[]) => Promise<{
    poolInst: CurvePool[];
    poolByPoolAddress: Map<Address, CurvePool>;
    poolByLPToken: Map<Token, CurvePool>;
    poolsByPoolTokens: DefaultMap<Token, Set<CurvePool>>;
    lpTokenToPoolAddress: Map<Token, Address>;
}>;
export declare const loadPoolList: (universe: UniverseWithCommonBaseTokens) => Promise<{
    poolInst: CurvePool[];
    poolByPoolAddress: Map<Address, CurvePool>;
    poolByLPToken: Map<Token, CurvePool>;
    poolsByPoolTokens: DefaultMap<Token, Set<CurvePool>>;
    lpTokenToPoolAddress: Map<Token, Address>;
}>;
type TokenOut = string;
type Restriction = {
    [tokenIn: string]: TokenOut;
};
interface ICurveConfig {
    allowedTradeInputs: Restriction;
    allowedTradeOutput: Restriction;
    ngPools: {
        [lpTokenName: string]: string;
    };
}
export declare class CurveIntegration {
    readonly universe: UniverseWithCommonBaseTokens;
    readonly curveApi: Awaited<ReturnType<typeof loadCurve>>;
    readonly dex: DexRouter;
    readonly curvePools: Awaited<ReturnType<typeof convertPoolListIntoMaps<CurvePool>>>;
    readonly ngCurvePools: Awaited<ReturnType<typeof convertPoolListIntoMaps<CurveStableSwapNGPool>>>;
    readonly venue: TradingVenue;
    private constructor();
    static load(universe: UniverseWithCommonBaseTokens, config: ICurveConfig): Promise<CurveIntegration>;
    findWithdrawActions(lpToken: Token): Promise<(import("../action/Curve").CurveSwap | null)[] | import("../action/CurveStableSwapNG").CurveStableSwapNGRemoveLiquidity[]>;
    findDepositAction(input: TokenQuantity, lpToken: Token): Promise<import("../action/CurveStableSwapNG").CurveStableSwapNGAddLiquidity | import("../action/Curve").CurveSwap>;
    toString(): string;
}
export {};
