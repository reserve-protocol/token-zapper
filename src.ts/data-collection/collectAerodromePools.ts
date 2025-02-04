import { BigNumber, ethers } from 'ethers'
import { Universe } from '../Universe'
import {
  AerodromeContext,
  AerodromePoolType,
  getPoolType,
  poolTypeToNumber,
} from '../action/Aerodrome'
import { Address } from '../base/Address'
import {
  IAerodromeFactory__factory,
  IAerodromePool__factory,
  IAerodromeRouter__factory,
  IAerodromeSugar__factory,
  IMixedRouteQuoterV1__factory,
  SlipstreamRouterCall__factory,
} from '../contracts'
import fs from 'fs'
import { SwapLpStructOutput } from '../contracts/contracts/Aerodrome.sol/IAerodromeSugar'
import { DefaultMap } from '../base/DefaultMap'
import { GAS_TOKEN_ADDRESS, ZERO } from '../base/constants'
import { Token, TokenQuantity } from '../entities/Token'
import * as dotenv from 'dotenv'

dotenv.config()

const BASE_CONFIG = {
  router: '0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43',
  mixedRouter: '0x0A5aA5D3a4d28014f967Bf0f29EAA3FF9807D5c6',
  swapRouter: '0xBE6D8f0d05cC4be24d5167a3eF062215bE6D18a5',
  routerCaller: '0xeA698DeEAD412456dbc488F8A9066326D98C3435',
  sugar: '0xc301856b4262e49e9239ec8a2d0c754d5ae317c0',
}
const routers: Record<number, typeof BASE_CONFIG> = {
  8453: BASE_CONFIG,
}

interface DataContext {
  chainId: number
  provider: ethers.providers.JsonRpcProvider
}

export class AerodromeStablePool {
  public toString() {
    return `Aerodrome(${this.poolAddress}.${this.token0}:${this.token1})`
  }

  public toJSON() {
    return {
      poolType: this.data.poolType,
      poolAddress: this.poolAddress.address,
      lpToken: this.lpToken.address,
      token0: this.token0.address,
      token1: this.token1.address,
      factory: this.factory.address,
      poolFee: this.poolFee.toString(),
    }
  }

  public readonly factory: Address

  private constructor(
    public readonly context: AerodromeContext,
    public readonly poolAddress: Address,
    public readonly lpToken: Address,
    public readonly token0: Address,
    public readonly token1: Address,
    public readonly data: SwapLpStructOutput,
    private readonly reserves: (
      pool: AerodromeStablePool
    ) => Promise<TokenQuantity[]>
  ) {
    this.data = data
    this.poolAddress = Address.from(data.lp)
    this.lpToken = this.poolAddress
    this.token0 = Address.from(data.token0)
    this.token1 = Address.from(data.token1)
    this.factory = Address.from(data.factory)
    if (
      this.poolType === AerodromePoolType.CL ||
      this.lpToken.address === GAS_TOKEN_ADDRESS ||
      this.lpToken.address === ZERO
    ) {
      return
    }
  }

  public get poolFee() {
    return this.data.poolFee.toBigInt()
  }
  public get poolType() {
    return getPoolType(this.data.poolType)
  }
  public get tickSpacing() {
    return this.data.poolType
  }
  public get isStable() {
    return this.poolType === AerodromePoolType.STABLE
  }

  public get address() {
    return this.poolAddress
  }
}

class AerodromePoolCollector {
  private pools = new DefaultMap<Address, Map<Address, AerodromePoolData>>(
    () => new Map()
  )

  constructor(private readonly ctx: DataContext) {
    this.ctx = ctx
  }

  collectAerodromePools = async () => {
    const config = routers[this.ctx.chainId]
    const routerAddr = Address.from(config.router)
    const mixedRouterAddr = Address.from(config.mixedRouter)
    const sugarAddr = Address.from(config.sugar)

    const splipstreamCall = SlipstreamRouterCall__factory.connect(
      config.routerCaller,
      this.ctx.provider
    )
    const sugarInst = IAerodromeSugar__factory.connect(
      sugarAddr.address,
      this.ctx.provider
    )

    const routerInst = IAerodromeRouter__factory.connect(
      routerAddr.address,
      this.ctx.provider
    )

    const mixedRouterInst = IMixedRouteQuoterV1__factory.connect(
      mixedRouterAddr.address,
      this.ctx.provider
    )

    // const loadPoolExplicit = async (addr: Address) => {
    //   const poolInst = IAerodromePool__factory.connect(
    //     addr.address,
    //     universe.provider
    //   )
    //   const [token0Addr, token1Addr, isStable, factoryAddr] = await Promise.all([
    //     poolInst.token0(),
    //     poolInst.token1(),
    //     poolInst.stable(),
    //     poolInst.factory(),
    //   ])
    //   const [token0, token1] = await Promise.all([
    //     universe.getToken(Address.from(token0Addr)),
    //     universe.getToken(Address.from(token1Addr)),
    //   ])
    //   const factory = Address.from(factoryAddr)
    //   const def = {
    //     lp: addr.address,
    //     poolType: isStable ? 0 : -1,
    //     token0: token0.address.address,
    //     token1: token1.address.address,
    //     factory: factory.address,
    //     poolFee: ethers.BigNumber.from(30),
    //   }

    //   return await aerodromeContext.definePool(addr, def)
    // }

    // if (!process.env.DEV) {
    const indexPools = async (count: number, start: number) => {
      const poolList = await sugarInst.forSwaps(count, start)
      await Promise.all(
        poolList
          .map(async (data) => {
            try {
              const { token0, token1, poolType, poolFee, factory } = data

              const typ = getPoolType(poolType)
              if (typ !== AerodromePoolType.CL) {
                const addr = await routerInst.callStatic.poolFor(
                  token0,
                  token1,
                  typ === AerodromePoolType.STABLE,
                  factory
                )
                return await this.definePool(Address.from(addr), data)
              } else {
                const factoryInst = IAerodromeFactory__factory.connect(
                  factory,
                  this.ctx.provider
                )
                const addr = Address.from(
                  await factoryInst.callStatic.getPool(token0, token1, poolType)
                )

                if (addr === Address.ZERO) {
                  return
                }
                return await this.definePool(addr, data)
              }
            } catch (e) {}
            return null
          })
          .filter((p) => p != null)
      )
    }

    await indexPools(10, 0)
    await indexPools(1000, 1000)
    await indexPools(1000, 2000)
    // } else {
    //   const pools: ReturnType<AerodromeStablePool['toJSON']>[] = JSON.parse(
    //     fs.readFileSync(
    //       'src.ts/configuration/data/base/aerodrome-pools.json',
    //       'utf8'
    //     )
    //   )
    //   await Promise.all(
    //     pools.map(async (p) =>
    //       aerodromeContext.definePool(Address.from(p.poolAddress), {
    //         lp: p.lpToken,
    //         poolType: p.poolType,
    //         token0: p.token0,
    //         token1: p.token1,
    //         factory: p.factory,
    //         poolFee: ethers.BigNumber.from(p.poolFee),
    //       })
    //     )
    //   )
    // }
    // await loadPoolExplicit(
    //   Address.from('0x2578365B3dfA7FfE60108e181EFb79FeDdec2319')
    // ).catch((e) => console.log(e))

    fs.writeFileSync(
      'src.ts/data-collection/data/base/pools.json',
      JSON.stringify(
        [...this.pools.values()]
          .map((poolMap) =>
            Array.from(poolMap.entries()).map(([address, pool]) => ({
              ...pool,
            }))
          )
          .flat(),
        null,
        2
      )
    )
  }

  public async definePool(address: Address, pool: SwapLpStructOutput) {
    let p: AerodromePoolData = {
      poolType: pool.poolType,
      token0: pool.token0,
      token1: pool.token1,
      factory: pool.factory,
      poolFee: pool.poolFee.toString(),
      lpToken: pool.lp,
      poolAddress: address.address,
    }
    this.pools.get(address).set(Address.from(pool.token0), p)
  }
}

interface AerodromePoolData {
  poolType: number
  token0: string
  token1: string
  factory: string
  poolFee: string
  lpToken: string
  poolAddress: string
}

async function main() {
  const collector = new AerodromePoolCollector({
    chainId: 8453,
    provider: new ethers.providers.JsonRpcProvider(process.env.BASE_PROVIDER),
  })

  await collector.collectAerodromePools()
}

main().catch((error) => {
  console.error(error)

  process.exitCode = 1
})
