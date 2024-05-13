import ethereumPools from '../configuration/data/ethereum/curvePoolList.json'
import { UniverseWithCommonBaseTokens } from '../searcher/UniverseWithERC20GasTokenDefined'
import { Address } from '../base/Address'
import { Token, TokenQuantity } from '../entities/Token'
import { LPToken } from '../action/LPToken'
import { DefaultMap } from '../base/DefaultMap'
import { BaseAction } from '../action/Action'
import {
  CurveStableSwapNGPool,
  setupCurveStableSwapNGPool,
} from '../action/CurveStableSwapNG'
import { loadCurve } from '../action/Curve'
import { DexRouter, TradingVenue } from '../aggregators/DexAggregator'
import { Universe } from '..'
import { MultiChoicePath } from '../searcher/MultiChoicePath'
import { RouterAction } from '../action/RouterAction'
import { curve } from '../curve-js/src/curve'

type JSONPoolDataGeneric = (typeof ethereumPools.data.poolData)[number]
type JSONCoin = Omit<
  JSONPoolDataGeneric['coins'][number],
  'ethLsdApy' | 'usdPrice' | 'poolBalance'
>

class CurveCoin {
  constructor(
    public readonly token: Token,
    public readonly isBasePoolLpToken: boolean
  ) {}

  public static async fromJson(
    universe: UniverseWithCommonBaseTokens,
    data: JSONCoin
  ) {
    const token = await universe.getToken(Address.from(data.address))
    return new CurveCoin(token, data.isBasePoolLpToken)
  }

  toString() {
    if (this.isBasePoolLpToken) return `LP(${this.token})`
    return `${this.token}`
  }
}
type AssetTypeStr = 'eth' | 'usd' | 'btc' | 'sameTypeCrypto' | 'mixed'
class AssetType {
  public precursors = new Set<Token>()

  public bestInputTokens = new Set<Token>()
  private pegged?: Token
  constructor(
    public readonly universe: UniverseWithCommonBaseTokens,
    public readonly pool: CurvePool,
    public readonly assetType: AssetTypeStr
  ) {
    this.initialize()
  }

  private initialize() {
    if (this.assetType === 'eth') {
      this.initializeEth()
    }
    if (this.assetType === 'usd') {
      this.initializeUsd()
    }
    if (this.assetType === 'btc') {
      this.initializeBtc()
    }

    if (this.pool.isBasePool) {
      this.bestInputTokens = new Set(this.pool.baseTokens)
    } else if (this.pool.isMetaPool) {
      for (const token of this.pool.underlyingTokens) {
        if (!token.isBasePoolLpToken) {
          this.bestInputTokens.add(token.token)
        }
      }
    }
  }

  initializeEth() {
    this.precursors = new Set<Token>([this.universe.commonTokens.WETH])
    this.pegged = this.universe.commonTokens.WETH
  }
  initializeUsd() {
    for (const usdBase of [
      this.universe.commonTokens.USDC,
      this.universe.commonTokens.USDT,
      this.universe.commonTokens.DAI,
    ].filter((i) => i != null)) {
      this.precursors.add(usdBase)

      if (this.bestInputTokens.has(usdBase)) {
        this.pegged = this.pegged ?? usdBase
      }
    }
  }

  initializeBtc() {
    for (const btcBase of [this.universe.commonTokens.WBTC].filter(
      (i) => i != null
    )) {
      this.precursors.add(btcBase)
      this.pegged = btcBase
    }
  }
}

export class CurvePool {
  public readonly allPoolTokens = new Set<Token>()
  public readonly allPoolTokensWithoutBaseLp = new Set<Token>()
  public readonly baseTokens = new Set<Token>()
  public readonly underlying = new Set<Token>()
  public readonly assetType: AssetType
  constructor(
    public readonly universe: UniverseWithCommonBaseTokens,
    assetTypeStr: AssetTypeStr,
    public readonly poolTokens: CurveCoin[],
    public readonly underlyingTokens: CurveCoin[],
    public readonly lpTokenCurve: CurveCoin,
    public readonly isMetaPool: boolean,
    public readonly name: string,
    public readonly address: Address,
    private readonly allPools: Map<Address, CurvePool>,
    private readonly basePoolAddress?: Address
  ) {
    if (isMetaPool && basePoolAddress == null) {
      throw new Error('Base pool address is required')
    }
    this.baseTokens = new Set([...poolTokens.map((i) => i.token)])
    this.underlying = new Set([...underlyingTokens.map((i) => i.token)])
    this.allPoolTokens = new Set([...this.baseTokens, ...this.underlying])
    this.allPoolTokensWithoutBaseLp = new Set(
      [...this.baseTokens, ...this.underlying].filter(
        (i) => i !== lpTokenCurve.token
      )
    )
    this.assetType = new AssetType(universe, this, assetTypeStr)
  }
  get lpToken() {
    return this.lpTokenCurve.token
  }

  get isBasePool() {
    return !this.isMetaPool
  }

  get basePool() {
    if (!this.isMetaPool) {
      throw new Error('Not a meta pool')
    }
    if (this.basePoolAddress == null) {
      throw new Error('No base pool address')
    }
    return this.allPools.get(this.basePoolAddress)
  }

  toString() {
    if (this.isMetaPool) {
      return `CrvMeta(${this.lpToken}: tokens=${this.underlyingTokens.join(
        ', '
      )}, base=${this.basePool?.lpToken})`
    }
    return `Crv(${this.lpToken}: tokens=${this.poolTokens.join(', ')})`
  }

  public static async fromJson(
    universe: UniverseWithCommonBaseTokens,
    data: JSONPoolDataGeneric,
    poolMap: Map<Address, CurvePool>
  ) {
    const [poolTokens, underlyingTokens, lpToken] = await Promise.all([
      Promise.all(data.coins.map((coin) => CurveCoin.fromJson(universe, coin))),
      Promise.all(
        data.underlyingCoins?.map((coin) =>
          CurveCoin.fromJson(universe, coin)
        ) ?? []
      ),
      new CurveCoin(
        await universe.getToken(Address.from(data.lpTokenAddress)),
        data.basePoolAddress ? false : true
      ),
    ])

    const { isMetaPool, name, address, basePoolAddress } = data

    return new CurvePool(
      universe,
      data.assetType as AssetTypeStr,
      poolTokens,
      underlyingTokens,
      lpToken,
      isMetaPool,
      name,
      Address.from(address),
      poolMap,
      basePoolAddress ? Address.from(basePoolAddress) : undefined
    )
  }
}
const convertPoolListIntoMaps = async <
  T extends {
    lpToken: Token
    address: Address
    allPoolTokens: Iterable<Token>
  }
>(
  poolInst: T[]
) => {
  const poolByPoolAddress = new Map<Address, T>()
  const poolByLPToken = new Map<Token, T>()
  const poolsByPoolTokens = new DefaultMap<Token, Set<T>>(() => new Set())
  const lpTokenToPoolAddress = new Map<Token, Address>()

  // Load pools and create mappings
  try {
    poolInst.forEach((pool) => {
      poolByPoolAddress.set(pool.address, pool)
      poolByLPToken.set(pool.lpToken, pool)
      for (const token of pool.allPoolTokens) {
        poolsByPoolTokens.get(token).add(pool)
      }
      lpTokenToPoolAddress.set(pool.lpToken, pool.address)
    })
  } catch (e) {}
  return {
    poolInst,
    poolByPoolAddress,
    poolByLPToken,
    poolsByPoolTokens,
    lpTokenToPoolAddress,
  }
}

export const loadCurvePoolFromJson = async <
  T extends {
    fromJson: (universe: Universe, data: JSONPoolDataGeneric) => Promise<T>
  }
>(
  universe: UniverseWithCommonBaseTokens,
  poolsAsJsonData: JSONPoolDataGeneric[]
) => {
  const poolByPoolAddress = new Map<Address, CurvePool>()
  const pools = await Promise.all(
    poolsAsJsonData
      .map(async (poolInst) => {
        try {
          return await CurvePool.fromJson(universe, poolInst, poolByPoolAddress)
        } catch (e) {
          return null!
        }
      })
      .filter((i) => i != null)
  )

  return convertPoolListIntoMaps(pools)
}

export const loadPoolList = async (universe: UniverseWithCommonBaseTokens) => {
  if (universe.chainId === 1) {
    return await loadCurvePoolFromJson(universe, ethereumPools.data.poolData)
  }
  // if (universe.chainId === 8453) {
  //     return await loadCurvePoolFromJson(universe, basePools.data.poolData)
  // }
  // if (universe.chainId === 42161) {
  //     return await loadCurvePoolFromJson(universe, arbitrumPools.data.poolData)
  // }
  throw new Error(`Unknown chain ${universe.chainId}`)
}
type TokenOut = string
type Restriction = {
  [tokenIn: string]: TokenOut
}
interface ICurveConfig {
  allowedTradeInputs: Restriction
  allowedTradeOutput: Restriction
  ngPools: {
    [lpTokenName: string]: string
  }
}

export class CurveIntegration {
  public readonly venue: TradingVenue
  private constructor(
    public readonly universe: UniverseWithCommonBaseTokens,
    public readonly curveApi: Awaited<ReturnType<typeof loadCurve>>,
    public readonly dex: DexRouter,
    public readonly curvePools: Awaited<
      ReturnType<typeof convertPoolListIntoMaps<CurvePool>>
    >,
    public readonly ngCurvePools: Awaited<
      ReturnType<typeof convertPoolListIntoMaps<CurveStableSwapNGPool>>
    >
  ) {
    this.venue = new TradingVenue(universe, dex, async (a, b) => {
      return new RouterAction(
        dex,
        universe,
        curveApi.routerAddress,
        a,
        b,
        this.universe.config.defaultInternalTradeSlippage
      )
    })
  }

  public static async load(
    universe: UniverseWithCommonBaseTokens,
    config: ICurveConfig
  ) {
    const curveApi = await loadCurve(universe)
    const normalCurvePoolList = await loadPoolList(universe)
    const ngPoolList = await Promise.all(
      Object.entries(config.ngPools).map(async ([_, poolAddress]) => {
        return await setupCurveStableSwapNGPool(
          universe,
          await universe.getToken(Address.from(poolAddress))
        )
      })
    )

    const lpTokens = normalCurvePoolList.poolInst.map((i) => i.lpToken).flat()

    const inputTradeRestrictions = await Promise.all(
      Object.entries(config.allowedTradeInputs).map(async ([_, addr]) => {
        return await universe.getToken(Address.from(addr))
      })
    )
    inputTradeRestrictions.push(...lpTokens)

    const outputTradeRestrictions = await Promise.all(
      Object.entries(config.allowedTradeOutput).map(async ([_, addr]) => {
        return await universe.getToken(Address.from(addr))
      })
    )
    outputTradeRestrictions.push(...lpTokens)

    const dex = new DexRouter(
      'curveRouter',
      async (_, input, output, slippage) => {
        return (
          await curveApi.createRouterEdge(input, output, slippage)
        ).intoSwapPath(universe, input)
      },
      true,
      new Set(inputTradeRestrictions),
      new Set(outputTradeRestrictions)
    )

    const ngPools = await convertPoolListIntoMaps(ngPoolList)

    const out = new CurveIntegration(
      universe,
      curveApi,
      dex,
      normalCurvePoolList,
      ngPools
    )

    const withdrawals = (
      await Promise.all(
        [...out.curvePools.poolByLPToken.keys()].map((a) =>
          out.findWithdrawActions(a).catch((e) => null)
        )
      )
    ).flat()

    for (const w of withdrawals) {
      if (w != null) {
        console.log(`${w.inputToken.join(', ')} -> ${w.outputToken.join(', ')}`)
        universe.addAction(w)
      }
    }

    return out
  }

  async findWithdrawActions(lpToken: Token) {
    if (this.curvePools.poolByLPToken.has(lpToken)) {
      const out = this.curveApi.getPoolByLPMap.get(lpToken)

      if (out != null) {
        const actions = await Promise.all(
          out.underlyingTokens.map(async (outToken) => {
            if (outToken == lpToken) {
              return null
            }
            return await this.curveApi
              .createRouterEdge(
                lpToken.one,
                outToken,
                this.universe.config.defaultInternalTradeSlippage
              )
              .catch((e) => {
                return null!
              })
          })
        ).then((out) => out.filter((e) => e != null))
        if (actions.length !== 0) {
          return actions
        }
      }
    }
    if (this.ngCurvePools.poolByLPToken.has(lpToken)) {
      const p = this.ngCurvePools.poolByLPToken.get(lpToken)!
      return Object.values(p.actions).map(({ remove }) => remove)
    }
    return []
  }

  async findDepositAction(input: TokenQuantity, lpToken: Token) {
    if (this.curvePools.poolByLPToken.has(lpToken)) {
      const out = await this.curveApi
        .createRouterEdge(
          input,
          lpToken,
          this.universe.config.defaultInternalTradeSlippage
        )
        .catch((e) => {
          console.log(e)
          return null
        })
      if (out != null) {
        return out
      }
    }
    if (this.ngCurvePools.poolByLPToken.has(lpToken)) {
      return this.ngCurvePools.poolByLPToken
        .get(lpToken)!
        .getAddLiquidityAction(input.token).add
    }
    throw new Error(`No pool found for ${lpToken}`)
  }

  toString() {
    return `CurveIntegration(curveV2Pools=${this.curvePools.poolInst.length}, curveNGPools=${this.ngCurvePools.poolInst.length})`
  }
}
