import { Address } from '../base/Address'
import { type Token } from '../entities/Token'
import { PROTOCOL_CONFIGS, type BaseUniverse } from './base'
import { loadBaseTokenList } from './loadBaseTokenList'
import { setupStargate } from './setupStargate'
import { setupStargateWrapper } from './setupStargateWrapper'
import { setupWrappedGasToken } from './setupWrappedGasToken'
import { OffchainOracleRegistry } from '../oracles/OffchainOracleRegistry'
import { setupCompoundV3 } from './setupCompV3'
import { setupAaveV3 } from './setupAaveV3'
import { setupUniswapV3 } from './setupUniswapV3'
import { setupAerodromeRouter } from './setupAerodromeRouter'
import { setupERC4626 } from './setupERC4626'
import { createProtocolWithWrappers } from '../action/RewardableWrapper'
import { TokenType } from '../entities/TokenClass'
import { setupOdosPricing } from './setupOdosPricing'
import { setupReservePricing } from './setupReservePricing'
import { setupUniswapV2 } from './setupUniswapV2'

export const setupBaseZapper = async (universe: BaseUniverse) => {
  console.log('setupBaseZapper')
  const logger = universe.logger.child({ prefix: 'setupBaseZapper' })

  logger.info('Loading base token list')
  await loadBaseTokenList(universe)
  console.log(`setupBaseZapper`)
  const priceViaOdos = setupOdosPricing(universe)
  const priceViaReserve = setupReservePricing(universe)

  logger.info('Setting up wrapped gas token')
  await setupWrappedGasToken(universe)

  await universe.addSingleTokenPriceOracle({
    token: universe.commonTokens.eUSD,
    oracleAddress: Address.from('0x9b2C948dbA5952A1f5Ab6fA16101c1392b8da1ab'),
    priceToken: universe.usd,
  })

  console.log(`done`)

  universe.tokenType.set(
    universe.commonTokens.cbETH,
    Promise.resolve(TokenType.Asset)
  )
  universe.tokenType.set(
    universe.commonTokens.wstETH,
    Promise.resolve(TokenType.Asset)
  )

  universe.underlyingToken.set(
    universe.commonTokens.USDbC,
    Promise.resolve(universe.commonTokens.USDbC)
  )
  universe.tokenType.set(
    universe.commonTokens.USDbC,
    Promise.resolve(TokenType.Asset)
  )
  universe.tokenType.set(
    universe.commonTokens.DEGEN,
    Promise.resolve(TokenType.Asset)
  )
  universe.addSingleTokenPriceSource({
    token: universe.commonTokens.DEGEN,
    priceFn: async () => await priceViaOdos(universe.commonTokens.DEGEN),
  })

  universe.addSingleTokenPriceSource({
    token: universe.commonTokens.wstETH,
    priceFn: async () => await priceViaOdos(universe.commonTokens.wstETH),
  })
  universe.preferredToken.set(universe.rTokens.BSDX, universe.commonTokens.WETH)
  universe.addSingleTokenPriceSource({
    token: universe.commonTokens.cbETH,
    priceFn: async () => await priceViaOdos(universe.commonTokens.cbETH),
  })

  universe.tokenType.set(
    universe.commonTokens.WELL,
    Promise.resolve(TokenType.Asset)
  )
  universe.addSingleTokenPriceSource({
    token: universe.commonTokens.WELL,
    priceFn: async () => await priceViaOdos(universe.commonTokens.WELL),
  })
  universe.tokenType.set(
    universe.commonTokens.AERO,
    Promise.resolve(TokenType.Asset)
  )
  universe.addSingleTokenPriceSource({
    token: universe.commonTokens.AERO,
    priceFn: async () => await priceViaOdos(universe.commonTokens.AERO),
  })
  universe.tokenType.set(
    universe.commonTokens.MOG,
    Promise.resolve(TokenType.Asset)
  )
  universe.addSingleTokenPriceSource({
    token: universe.commonTokens.MOG,
    priceFn: async () => await priceViaOdos(universe.commonTokens.MOG),
  })
  universe.tokenType.set(
    universe.commonTokens.cbBTC,
    Promise.resolve(TokenType.Asset)
  )
  universe.addSingleTokenPriceSource({
    token: universe.commonTokens.cbBTC,
    priceFn: async () => await priceViaOdos(universe.commonTokens.cbBTC),
  })

  logger.info('Registering USD price oracles')
  const registry: OffchainOracleRegistry = new OffchainOracleRegistry(
    universe.config.requoteTolerance,
    'BaseOracles',
    async (token: Token) => {
      if (token === universe.wrappedNativeToken) {
        const oracle = registry.getOracle(
          universe.nativeToken.address,
          universe.usd.address
        )
        if (oracle == null) {
          return null
        }
        return universe.usd.from(await oracle.callStatic.latestAnswer())
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

  universe.oracles.push(registry)

  // Load compound v3
  const initCompound = async () => {
    universe.addIntegration(
      'compoundV3',
      await setupCompoundV3('CompV3', universe, PROTOCOL_CONFIGS.compV3)
    )
  }

  const initAave = async () => {
    logger.info('Setting up AAVEV3')
    universe.addIntegration(
      'aaveV3',
      await setupAaveV3(universe, PROTOCOL_CONFIGS.aaveV3)
    )
  }

  const initUni3 = async () => {
    logger.info('Setting up UniswapV3')
    const router = await setupUniswapV3(universe)
    universe.addIntegration('uniswapV3', await router.venue())
  }
  const initUni2 = async () => {
    logger.info('Setting up UniswapV2')
    await setupUniswapV2(universe)
  }

  const initERC4626 = async () => {
    logger.info('Setting up preferred rTokens')
    await Promise.all(
      PROTOCOL_CONFIGS.erc4626.map(async ([addr, proto]) => {
        const vault = await setupERC4626(universe, {
          vaultAddress: addr,
          protocol: proto,
          slippage: 1n,
        })
        return vault
      })
    )
  }
  const setupStarGate_ = async () => {
    logger.info('Setting up stargate')
    // Set up stargate
    await setupStargate(
      universe,
      PROTOCOL_CONFIGS.stargate.tokens,
      PROTOCOL_CONFIGS.stargate.router,
      {}
    )
    await setupStargateWrapper(universe, PROTOCOL_CONFIGS.stargate.wrappers, {})
  }
  const setupAero = async () => {
    try {
      await setupAerodromeRouter(universe)
      const aerodromeWrappers = createProtocolWithWrappers(
        universe,
        'aerodrome'
      )

      for (const wrapperAddress of Object.values(
        PROTOCOL_CONFIGS.aerodrome.lpPoolWrappers
      )) {
        const wrapperToken = await universe.getToken(
          Address.from(wrapperAddress)
        )
        await aerodromeWrappers.addWrapper(wrapperToken)
      }
    } catch (e) {
      console.log(e)
    }
  }
  const setupUnis = async () => {
    await initUni3()
    await initUni2()
  }
  let done = 0
  const initMaverick = async () => {
    // await setupMaverick(universe)
  }
  console.log('setupBaseZapper')

  const tasks = [
    initCompound(),
    initAave(),
    setupUnis(),
    initERC4626(),
    setupStarGate_(),
    setupAero(),
    initMaverick(),
  ].map((tsk) => {
    return tsk
      .catch((e) => {
        console.error(e)
      })
      .finally(() => {
        done++
        console.log(`${done}/${tasks.length} done`)
      })
  })

  await Promise.all(tasks)

  universe.tokenClass.set(
    universe.rTokens.hyUSD,
    Promise.resolve(universe.commonTokens.USDC)
  )
  universe.tokenClass.set(
    universe.rTokens.RIVOTKN,
    Promise.resolve(universe.commonTokens.WETH)
  )
  universe.tokenClass.set(
    universe.commonTokens.USDbC,
    Promise.resolve(universe.commonTokens.USDC)
  )
  universe.tokenClass.set(
    universe.commonTokens.DEGEN,
    Promise.resolve(universe.commonTokens.DEGEN)
  )
  universe.tokenClass.set(
    universe.commonTokens.WELL,
    Promise.resolve(universe.commonTokens.WELL)
  )
  universe.tokenClass.set(
    universe.commonTokens.AERO,
    Promise.resolve(universe.commonTokens.AERO)
  )
  universe.tokenClass.set(
    universe.commonTokens.MOG,
    Promise.resolve(universe.commonTokens.MOG)
  )
  universe.tokenClass.set(
    universe.commonTokens.cbBTC,
    Promise.resolve(universe.commonTokens.cbBTC)
  )
  universe.tokenClass.set(
    universe.commonTokens.DAI,
    Promise.resolve(universe.commonTokens.USDC)
  )
  universe.tokenClass.set(
    universe.commonTokens.meUSD,
    Promise.resolve(universe.commonTokens.USDC)
  )
  universe.tokenClass.set(
    universe.commonTokens.eUSD,
    Promise.resolve(universe.commonTokens.USDC)
  )
  universe.tokenClass.set(
    universe.rTokens.bsd,
    Promise.resolve(universe.wrappedNativeToken)
  )
  universe.preferredToken.set(universe.rTokens.BSDX, universe.commonTokens.WETH)
  universe.tokenClass.set(
    universe.rTokens.BSDX,
    Promise.resolve(universe.commonTokens.WETH)
  )
  universe.tokenClass.set(
    universe.commonTokens.cbETH,
    Promise.resolve(universe.wrappedNativeToken)
  )
  universe.tokenClass.set(
    universe.commonTokens.wstETH,
    Promise.resolve(universe.wrappedNativeToken)
  )
  logger.info('Done setting up base zapper')
  await Promise.all(tasks)
}
