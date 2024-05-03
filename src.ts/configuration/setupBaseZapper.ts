import { Address } from '../base/Address'
import { type Token } from '../entities/Token'
import { PROTOCOL_CONFIGS, type BaseUniverse } from './base'
import { loadBaseTokenList } from './loadBaseTokenList'
import { loadRTokens } from './setupRTokens'
import { setupStargate } from './setupStargate'
import { setupStargateWrapper } from './setupStargateWrapper'
import { setupWrappedGasToken } from './setupWrappedGasToken'

import { OffchainOracleRegistry } from '../oracles/OffchainOracleRegistry'
import { ZapperTokenQuantityPrice } from '../oracles/ZapperAggregatorOracle'
import { setupAaveV3 } from './setupAaveV3'
import { setupAerodromeRouter } from './setupAerodromeRouter'
import { setupCompoundV3 } from './setupCompV3'
import { setupUniswapRouter } from './setupUniswapRouter'

export const setupBaseZapper = async (universe: BaseUniverse) => {
  await loadBaseTokenList(universe)
  const wsteth = await universe.getToken(
    Address.from('0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452')
  )

  const registry: OffchainOracleRegistry = new OffchainOracleRegistry(
    universe.config.requoteTolerance,
    'BaseOracles',
    async (token: Token) => {
      if (token === wsteth) {
        const oraclewstethToEth = registry.getOracle(
          token.address,
          universe.nativeToken.address
        )
        const oracleethToUsd = registry.getOracle(
          universe.nativeToken.address,
          universe.usd.address
        )
        if (oraclewstethToEth == null || oracleethToUsd == null) {
          return null
        }
        const oneWSTInETH = universe.nativeToken.from(
          await oraclewstethToEth.callStatic.latestAnswer()
        )

        const oneETHInUSD = (await universe.fairPrice(
          universe.nativeToken.one
        ))!
        const priceOfOnewsteth = oneETHInUSD.mul(oneWSTInETH.into(universe.usd))
        return priceOfOnewsteth
      }

      const oracle = registry.getOracle(token.address, universe.usd.address)
      if (oracle == null) {
        return null
      }
      return universe.usd.from(await oracle.callStatic.latestAnswer())
    },
    () => universe.currentBlock,
    universe.provider
  )
  Object.entries(PROTOCOL_CONFIGS.usdPriceOracles).map(
    ([tokenAddress, oracleAddress]) => {
      registry.register(
        Address.from(tokenAddress),
        universe.usd.address,
        Address.from(oracleAddress)
      )
    }
  )
  Object.entries(PROTOCOL_CONFIGS.ethPriceOracles).map(
    ([tokenAddress, oracleAddress]) => {
      registry.register(
        Address.from(tokenAddress),
        universe.nativeToken.address,
        Address.from(oracleAddress)
      )
    }
  )

  universe.oracles.push(registry)
  universe.oracle = new ZapperTokenQuantityPrice(universe)


  
  await setupWrappedGasToken(universe)

  // Load compound v3
  const [comets, cTokenWrappers] = await Promise.all([
    Promise.all(
      PROTOCOL_CONFIGS.compV3.comets.map((a) =>
        universe.getToken(Address.from(a))
      )
    ),
    Promise.all(
      PROTOCOL_CONFIGS.compV3.wrappers.map((a) =>
        universe.getToken(Address.from(a))
      )
    ),
  ])
  const compV3 = await setupCompoundV3(universe, {
    comets,
    cTokenWrappers,
  })

  const aaveV3 = await setupAaveV3(
    universe,
    Address.from(PROTOCOL_CONFIGS.aaveV3.pool),
    await Promise.all(
      PROTOCOL_CONFIGS.aaveV3.wrappers.map((a) =>
        universe.getToken(Address.from(a))
      )
    )
  )

  // Set up stargate
  await setupStargate(
    universe,
    PROTOCOL_CONFIGS.stargate.tokens,
    PROTOCOL_CONFIGS.stargate.router,
    {}
  )
  await setupStargateWrapper(universe, PROTOCOL_CONFIGS.stargate.wrappers, {})

  // Set up RTokens defined in the config
  await loadRTokens(universe)

  const uniV3 = await setupUniswapRouter(universe)
  await setupAerodromeRouter(universe)

  return {
    uni: uniV3,
    curve: null,
    compV3,
    aaveV3,
  }
}
