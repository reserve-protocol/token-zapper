import ethereumPools from '../configuration/data/ethereum/curvePoolList.json';
import { Address } from '../base/Address';
import { DefaultMap } from '../base/DefaultMap';
import { setupCurveStableSwapNGPool, } from '../action/CurveStableSwapNG';
import { setupCurveFactoryCryptoPool, } from '../action/CurveFactoryCryptoPool';
import { loadCurve } from '../action/Curve';
import { DexRouter, TradingVenue } from '../aggregators/DexAggregator';
import { RouterAction } from '../action/RouterAction';
class CurveCoin {
    token;
    isBasePoolLpToken;
    constructor(token, isBasePoolLpToken) {
        this.token = token;
        this.isBasePoolLpToken = isBasePoolLpToken;
    }
    static async fromJson(universe, data) {
        const token = await universe.getToken(Address.from(data.address));
        return new CurveCoin(token, data.isBasePoolLpToken);
    }
    toString() {
        if (this.isBasePoolLpToken)
            return `LP(${this.token})`;
        return `${this.token}`;
    }
}
class AssetType {
    universe;
    pool;
    assetType;
    precursors = new Set();
    bestInputTokens = new Set();
    pegged;
    constructor(universe, pool, assetType) {
        this.universe = universe;
        this.pool = pool;
        this.assetType = assetType;
        this.initialize();
    }
    initialize() {
        if (this.assetType === 'eth') {
            this.initializeEth();
        }
        if (this.assetType === 'usd') {
            this.initializeUsd();
        }
        if (this.assetType === 'btc') {
            this.initializeBtc();
        }
        if (this.pool.isBasePool) {
            this.bestInputTokens = new Set(this.pool.baseTokens);
        }
        else if (this.pool.isMetaPool) {
            for (const token of this.pool.underlyingTokens) {
                if (!token.isBasePoolLpToken) {
                    this.bestInputTokens.add(token.token);
                }
            }
        }
    }
    initializeEth() {
        this.precursors = new Set([this.universe.commonTokens.WETH]);
        this.pegged = this.universe.commonTokens.WETH;
    }
    initializeUsd() {
        for (const usdBase of [
            this.universe.commonTokens.USDC,
            this.universe.commonTokens.USDT,
            this.universe.commonTokens.DAI,
        ].filter((i) => i != null)) {
            this.precursors.add(usdBase);
            if (this.bestInputTokens.has(usdBase)) {
                this.pegged = this.pegged ?? usdBase;
            }
        }
    }
    initializeBtc() {
        for (const btcBase of [this.universe.commonTokens.WBTC].filter((i) => i != null)) {
            this.precursors.add(btcBase);
            this.pegged = btcBase;
        }
    }
}
export class CurvePool {
    universe;
    poolTokens;
    underlyingTokens;
    lpTokenCurve;
    isMetaPool;
    name;
    address;
    allPools;
    basePoolAddress;
    allPoolTokens = new Set();
    allPoolTokensWithoutBaseLp = new Set();
    baseTokens = new Set();
    underlying = new Set();
    assetType;
    constructor(universe, assetTypeStr, poolTokens, underlyingTokens, lpTokenCurve, isMetaPool, name, address, allPools, basePoolAddress) {
        this.universe = universe;
        this.poolTokens = poolTokens;
        this.underlyingTokens = underlyingTokens;
        this.lpTokenCurve = lpTokenCurve;
        this.isMetaPool = isMetaPool;
        this.name = name;
        this.address = address;
        this.allPools = allPools;
        this.basePoolAddress = basePoolAddress;
        if (isMetaPool && basePoolAddress == null) {
            throw new Error('Base pool address is required');
        }
        this.baseTokens = new Set([...poolTokens.map((i) => i.token)]);
        this.underlying = new Set([...underlyingTokens.map((i) => i.token)]);
        this.allPoolTokens = new Set([...this.baseTokens, ...this.underlying]);
        this.allPoolTokensWithoutBaseLp = new Set([...this.baseTokens, ...this.underlying].filter((i) => i !== lpTokenCurve.token));
        this.assetType = new AssetType(universe, this, assetTypeStr);
    }
    get lpToken() {
        return this.lpTokenCurve.token;
    }
    get isBasePool() {
        return !this.isMetaPool;
    }
    get basePool() {
        if (!this.isMetaPool) {
            throw new Error('Not a meta pool');
        }
        if (this.basePoolAddress == null) {
            throw new Error('No base pool address');
        }
        return this.allPools.get(this.basePoolAddress);
    }
    toString() {
        if (this.isMetaPool) {
            return `CrvMeta(${this.lpToken}: tokens=${this.underlyingTokens.join(', ')}, base=${this.basePool?.lpToken})`;
        }
        return `Crv(${this.lpToken}: tokens=${this.poolTokens.join(', ')})`;
    }
    static async fromJson(universe, data, poolMap) {
        const [poolTokens, underlyingTokens, lpToken] = await Promise.all([
            Promise.all(data.coins.map((coin) => CurveCoin.fromJson(universe, coin))),
            Promise.all(data.underlyingCoins?.map((coin) => CurveCoin.fromJson(universe, coin)) ?? []),
            new CurveCoin(await universe.getToken(Address.from(data.lpTokenAddress)), data.basePoolAddress ? false : true),
        ]);
        const { isMetaPool, name, address, basePoolAddress } = data;
        return new CurvePool(universe, data.assetType, poolTokens, underlyingTokens, lpToken, isMetaPool, name, Address.from(address), poolMap, basePoolAddress ? Address.from(basePoolAddress) : undefined);
    }
}
const convertPoolListIntoMaps = async (poolInst) => {
    const poolByPoolAddress = new Map();
    const poolByLPToken = new Map();
    const poolsByPoolTokens = new DefaultMap(() => new Set());
    const lpTokenToPoolAddress = new Map();
    // Load pools and create mappings
    try {
        poolInst.forEach((pool) => {
            poolByPoolAddress.set(pool.address, pool);
            poolByLPToken.set(pool.lpToken, pool);
            for (const token of pool.allPoolTokens) {
                poolsByPoolTokens.get(token).add(pool);
            }
            lpTokenToPoolAddress.set(pool.lpToken, pool.address);
        });
    }
    catch (e) { }
    return {
        poolInst,
        poolByPoolAddress,
        poolByLPToken,
        poolsByPoolTokens,
        lpTokenToPoolAddress,
    };
};
export const loadCurvePoolFromJson = async (universe, poolsAsJsonData) => {
    const poolByPoolAddress = new Map();
    const pools = await Promise.all(poolsAsJsonData
        .map(async (poolInst) => {
        try {
            return await CurvePool.fromJson(universe, poolInst, poolByPoolAddress);
        }
        catch (e) {
            return null;
        }
    })
        .filter((i) => i != null));
    return convertPoolListIntoMaps(pools);
};
export const loadPoolList = async (universe) => {
    if (universe.chainId === 1) {
        return await loadCurvePoolFromJson(universe, ethereumPools.data.poolData);
    }
    // if (universe.chainId === 8453) {
    //     return await loadCurvePoolFromJson(universe, basePools.data.poolData)
    // }
    // if (universe.chainId === 42161) {
    //     return await loadCurvePoolFromJson(universe, arbitrumPools.data.poolData)
    // }
    throw new Error(`Unknown chain ${universe.chainId}`);
};
export class CurveIntegration {
    universe;
    curveApi;
    dex;
    curvePools;
    specialCasePools;
    venue;
    constructor(universe, curveApi, dex, curvePools, specialCasePools) {
        this.universe = universe;
        this.curveApi = curveApi;
        this.dex = dex;
        this.curvePools = curvePools;
        this.specialCasePools = specialCasePools;
        this.venue = new TradingVenue(universe, dex, async (a, b) => {
            return new RouterAction(dex, universe, curveApi.routerAddress, a, b, this.universe.config.defaultInternalTradeSlippage);
        });
    }
    static async load(universe, config) {
        const curveApi = await loadCurve(universe);
        const normalCurvePoolList = await loadPoolList(universe);
        const ngPoolList = await Promise.all(config.specialCases.map(async ({ pool, type }) => {
            if (type === 'ngPool') {
                return await setupCurveStableSwapNGPool(universe, await universe.getToken(Address.from(pool)));
            }
            if (type === 'factory-crypto') {
                return await setupCurveFactoryCryptoPool(universe, Address.from(pool));
            }
            throw new Error(`Unknown type ${type}`);
        }));
        const lpTokens = normalCurvePoolList.poolInst.map((i) => i.lpToken).flat();
        const inputTradeRestrictions = await Promise.all(Object.entries(config.allowedTradeInputs).map(async ([_, addr]) => {
            return await universe.getToken(Address.from(addr));
        }));
        inputTradeRestrictions.push(...lpTokens);
        const outputTradeRestrictions = await Promise.all(Object.entries(config.allowedTradeOutput).map(async ([_, addr]) => {
            return await universe.getToken(Address.from(addr));
        }));
        outputTradeRestrictions.push(...lpTokens);
        const dex = new DexRouter('curveRouter', async (_, input, output, slippage) => {
            return (await curveApi.createRouterEdge(input, output, slippage)).intoSwapPath(universe, input);
        }, true, new Set(inputTradeRestrictions), new Set(outputTradeRestrictions));
        const specialCasePools = await convertPoolListIntoMaps(ngPoolList);
        const out = new CurveIntegration(universe, curveApi, dex, normalCurvePoolList, specialCasePools);
        const withdrawals = (await Promise.all([...out.curvePools.poolByLPToken.keys()].map((a) => out.findWithdrawActions(a).catch((e) => null)))).flat();
        for (const w of withdrawals) {
            if (w != null) {
                // console.log(`${w.inputToken.join(', ')} -> ${w.outputToken.join(', ')}`)
                universe.addAction(w);
            }
        }
        return out;
    }
    async findWithdrawActions(lpToken) {
        if (this.specialCasePools.poolByLPToken.has(lpToken)) {
            const p = this.specialCasePools.poolByLPToken.get(lpToken);
            return Object.values(p.actions).map(({ remove }) => remove);
        }
        if (this.curvePools.poolByLPToken.has(lpToken)) {
            const out = this.curveApi.getPoolByLPMap.get(lpToken);
            if (out != null) {
                const actions = await Promise.all(out.underlyingTokens.map(async (outToken) => {
                    if (outToken == lpToken) {
                        return null;
                    }
                    return await this.curveApi
                        .createRouterEdge(lpToken.one, outToken, this.universe.config.defaultInternalTradeSlippage)
                        .catch((e) => {
                        return null;
                    });
                })).then((out) => out.filter((e) => e != null));
                if (actions.length !== 0) {
                    return actions;
                }
            }
        }
        return [];
    }
    async findDepositAction(input, lpToken) {
        if (this.specialCasePools.poolByLPToken.has(lpToken)) {
            const out = this.specialCasePools.poolByLPToken
                .get(lpToken)
                .actions.find((action) => action.add.inputToken[0] === input.token);
            if (out != null) {
                return out.add;
            }
            throw new Error(`Could not find add liquidity action for ${input}`);
        }
        if (this.curvePools.poolByLPToken.has(lpToken)) {
            const out = await this.curveApi
                .createRouterEdge(input, lpToken, this.universe.config.defaultInternalTradeSlippage)
                .catch((e) => {
                console.log(e);
                return null;
            });
            if (out != null) {
                return out;
            }
        }
        throw new Error(`No pool found for ${lpToken}`);
    }
    toString() {
        return `CurveIntegration(curveV2Pools=${this.curvePools.poolInst.length}, curveNGPools=${this.specialCasePools.poolInst.length})`;
    }
}
//# sourceMappingURL=setupCurve.js.map