import ethereumPools from '../configuration/data/ethereum/curvePoolList.json'
import { UniverseWithERC20GasTokenDefined } from '../searcher/UniverseWithERC20GasTokenDefined'
import { Address } from '../base/Address'
import { Token } from '../entities/Token'

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
    universe: UniverseWithERC20GasTokenDefined,
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

class AssetType {
  constructor(
    public readonly tokens: CurveCoin[],
    public readonly assetType:
      | 'eth'
      | 'usd'
      | 'btc'
      | 'sameTypeCrypto'
      | 'mixed'
  ) {}

  toString() {
    if (this.assetType === 'mixed') {
      return `LP(${this.tokens.map((i) => i.token).join(', ')})`
    }
    if (this.assetType === 'sameTypeCrypto') {
      return `LP(${this.tokens.find((t) => !t.isBasePoolLpToken)!.token})`
    }
    if (this.assetType === 'eth') {
      return `LP(Eth)`
    }
    if (this.assetType === 'usd') {
      return `LP(USD)`
    }
    if (this.assetType === 'btc') {
      return `LP(BTC)`
    }
    return `Unknown`
  }
}
const assetTypeToToken = (
  poolCoins: CurveCoin[],
  pool: JSONPoolDataGeneric,
  defaults: {
    eth: CurveCoin
    usd: CurveCoin
    btc: CurveCoin
  }
) => {
  switch (pool.assetTypeName) {
    case 'eth':
      return new AssetType([defaults.eth], 'eth')
    case 'usd':
      return new AssetType([defaults.usd], 'usd')
    case 'btc':
      return new AssetType([defaults.btc], 'btc')
    case 'other':
      return new AssetType(poolCoins, 'sameTypeCrypto')
    case 'unknown':
      return new AssetType(poolCoins, 'mixed')
    default:
      throw new Error(`Unknown asset type ${pool.assetTypeName}`)
  }
}

export class CurvePool {
  constructor(
    public readonly universe: UniverseWithERC20GasTokenDefined,
    public readonly poolTokens: CurveCoin[],
    public readonly underlyingTokens: CurveCoin[],
    public readonly lpToken: CurveCoin,
    public readonly assetType: AssetType,
    public readonly isMetaPool: boolean,
    public readonly name: string,
    public readonly address: Address,
    public readonly basePoolAddress: Address,
    private readonly allPools: Map<Address, CurvePool>
  ) {}

  get isBasePool() {
    return !this.isMetaPool
  }

  get basePool() {
    return this.allPools.get(this.basePoolAddress)
  }

  toString() {
    if (this.isMetaPool) {
      return `CrvMeta(${
        this.lpToken
      }: tokens=${this.underlyingTokens.join(', ')}, base=${
        this.basePool?.lpToken
      })`
    }
    return `Crv(${this.lpToken}: tokens=${this.poolTokens.join(
      ', '
    )})`
  }

  public static async fromJson(
    universe: UniverseWithERC20GasTokenDefined,
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
    const tradedCoings =
      underlyingTokens.length > 0 ? underlyingTokens : poolTokens
    const defaults = {
      eth: new CurveCoin(universe.nativeToken, false),
      usd: new CurveCoin(universe.usd, false),
      btc: new CurveCoin(universe.commonTokens.WBTC, false),
    }
    const assetType = assetTypeToToken(tradedCoings, data, defaults)

    const { isMetaPool, name, address, basePoolAddress } = data

    return new CurvePool(
      universe,
      poolTokens,
      underlyingTokens,
      lpToken,
      assetType,
      isMetaPool,
      name,
      Address.from(address),
      basePoolAddress ? Address.from(basePoolAddress) : Address.ZERO,
      poolMap
    )
  }
}
export const loadCurvePoolFromJson = async (
  universe: UniverseWithERC20GasTokenDefined,
  poolsAsJsonData: JSONPoolDataGeneric[]
) => {
  const allPools = new Map<Address, CurvePool>()
  const pools: CurvePool[] = []
  await Promise.all(
    poolsAsJsonData.map(async (pool) => {
      try {
        const poolInst = await CurvePool.fromJson(universe, pool, allPools)
        allPools.set(poolInst.address, poolInst)
        pools.push(poolInst)
      } catch (e) {}
    })
  )
  return pools
}

export const loadPoolList = async (
  universe: UniverseWithERC20GasTokenDefined
) => {
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

export class CurveIntegration {
  public readonly byAddress: Map<Address, CurvePool> = new Map()
  public readonly byLpToken: Map<Token, CurvePool> = new Map()
  private constructor(
    public readonly universe: UniverseWithERC20GasTokenDefined,
    public readonly pools: CurvePool[]
  ) {
    pools.forEach((pool) => {
      this.byAddress.set(pool.address, pool)
      this.byLpToken.set(pool.lpToken.token, pool)
    })
  }

  public static async load(universe: UniverseWithERC20GasTokenDefined) {
    return new CurveIntegration(universe, await loadPoolList(universe))
  }

  toString() {
    return `Curve(pools=${this.pools.length} loaded)`
  }
}
