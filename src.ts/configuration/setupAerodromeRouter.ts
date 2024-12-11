import { ethers } from 'ethers'
import { Universe } from '../Universe'
import {
  AerodromeContext,
  AerodromePoolType,
  getPoolType,
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

export const setupAerodromeRouter = async (universe: Universe) => {
  const config = routers[universe.chainId]
  const routerAddr = Address.from(config.router)
  const mixedRouterAddr = Address.from(config.mixedRouter)
  const sugarAddr = Address.from(config.sugar)

  const splipstreamCall = SlipstreamRouterCall__factory.connect(
    config.routerCaller,
    universe.provider
  )
  const sugarInst = IAerodromeSugar__factory.connect(
    sugarAddr.address,
    universe.provider
  )

  const routerInst = IAerodromeRouter__factory.connect(
    routerAddr.address,
    universe.provider
  )

  const mixedRouterInst = IMixedRouteQuoterV1__factory.connect(
    mixedRouterAddr.address,
    universe.provider
  )

  const aerodromeContext = new AerodromeContext(
    universe,
    routerInst,
    mixedRouterInst,
    splipstreamCall,
    Address.from(config.swapRouter)
  )

  const loadPoolExplicit = async (addr: Address) => {
    const poolInst = IAerodromePool__factory.connect(
      addr.address,
      universe.provider
    )
    const [token0Addr, token1Addr, isStable, factoryAddr] = await Promise.all([
      poolInst.token0(),
      poolInst.token1(),
      poolInst.stable(),
      poolInst.factory(),
    ])
    const [token0, token1] = await Promise.all([
      universe.getToken(Address.from(token0Addr)),
      universe.getToken(Address.from(token1Addr)),
    ])
    const factory = Address.from(factoryAddr)
    const def = {
      lp: addr.address,
      poolType: isStable ? 0 : -1,
      token0: token0.address.address,
      token1: token1.address.address,
      factory: factory.address,
      poolFee: ethers.BigNumber.from(30),
    }

    const out = await aerodromeContext.definePool(addr, def)
  }

  const loadPools = async (count: number, start: number) => {
    return await Promise.all(
      (
        await sugarInst.forSwaps(count, start)
      ).map(async (data) => {
        const { token0, token1, poolType, poolFee, factory } = data

        const typ = getPoolType(poolType)
        if (typ !== AerodromePoolType.CL) {
          try {
            const addr = await routerInst.callStatic.poolFor(
              token0,
              token1,
              typ === AerodromePoolType.STABLE,
              factory
            )
            await aerodromeContext.definePool(Address.from(addr), data)
          } catch (e) {
            console.log('Failed to load pool: ' + data)
            console.log(e)
          }
        } else {
          try {
            const factoryInst = IAerodromeFactory__factory.connect(
              factory,
              universe.provider
            )
            const addr = Address.from(
              await factoryInst.callStatic.getPool(token0, token1, poolType)
            )

            if (addr === Address.ZERO) {
              return
            }
            await aerodromeContext.definePool(addr, data)
          } catch (e) {
            console.log('Failed to load pool: ' + data)
            console.log(e)
          }
        }
      })
    )
  }

  await loadPools(1000, 0)
  await loadPools(1000, 1000)
  await loadPools(1000, 2000)

  await loadPoolExplicit(
    Address.from('0x2578365B3dfA7FfE60108e181EFb79FeDdec2319')
  ).catch((e) => console.log(e))
}
